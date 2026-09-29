const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFile, execSync } = require('child_process');

const PORT = process.env.PORT || 3000;
const BANK_DIR = path.join(__dirname, 'BankSphere');
const BRIDGE_EXE = path.join(BANK_DIR, 'BankSphereBridge.exe');
const GUI_DIR = path.join(__dirname, 'gui');

// Auto-compile bridge if not already compiled
function ensureBridgeBinary() {
    if (!fs.existsSync(BRIDGE_EXE)) {
        console.log('[BankSphere] Compiling C++ Bridge binary...');
        const compileCmd = 'g++ -std=c++17 src/api_bridge.cpp src/bst/AccountBST.cpp src/bst/AccountNode.cpp src/hashtable/AuthTable.cpp src/hashtable/BucketNode.cpp src/hashtable/CredentialNode.cpp src/utils/FileUtils.cpp -Iinclude -o BankSphereBridge.exe';
        try {
            execSync(compileCmd, { cwd: BANK_DIR, stdio: 'inherit' });
            console.log('[BankSphere] C++ Bridge binary compiled successfully.');
        } catch (err) {
            console.error('[BankSphere] Failed to compile C++ Bridge binary:', err);
        }
    }
}

ensureBridgeBinary();

// Execute C++ bridge command
function callBridge(args) {
    return new Promise((resolve, reject) => {
        execFile(BRIDGE_EXE, args, { cwd: BANK_DIR }, (error, stdout, stderr) => {
            if (error && !stdout) {
                return reject(error);
            }
            try {
                const firstBrace = stdout.indexOf('{');
                const lastBrace = stdout.lastIndexOf('}');
                if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
                    const jsonStr = stdout.substring(firstBrace, lastBrace + 1);
                    return resolve(JSON.parse(jsonStr));
                }
                const json = JSON.parse(stdout.trim());
                resolve(json);
            } catch (err) {
                console.error('[Bridge Parse Error] Stdout:', stdout, 'Stderr:', stderr);
                resolve({ success: false, error: stdout || 'Error parsing bridge response' });
            }
        });
    });
}

// Request body helper
function parseBody(req) {
    return new Promise((resolve) => {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                resolve(JSON.parse(body || '{}'));
            } catch (e) {
                resolve({});
            }
        });
    });
}

// Send JSON response
function sendJson(res, statusCode, data) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(JSON.stringify(data));
}

// MIME types
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        return res.end();
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    // --- API ROUTES ---

    // Login
    if (req.method === 'POST' && pathname === '/api/login') {
        const { accountNumber, password } = await parseBody(req);
        if (!accountNumber || !password) {
            return sendJson(res, 400, { success: false, error: 'Account number and password are required' });
        }
        try {
            const result = await callBridge(['--login', String(accountNumber), String(password)]);
            return sendJson(res, result.success ? 200 : 401, result);
        } catch (e) {
            return sendJson(res, 500, { success: false, error: 'Internal bridge error: ' + e.message });
        }
    }

    // Get Account Details
    if (req.method === 'GET' && pathname.startsWith('/api/account/')) {
        const id = pathname.split('/')[3];
        try {
            const result = await callBridge(['--get-account', String(id)]);
            return sendJson(res, result.success ? 200 : 404, result);
        } catch (e) {
            return sendJson(res, 500, { success: false, error: e.message });
        }
    }

    // Update Account Profile (Name & Address)
    if (req.method === 'POST' && pathname === '/api/account/update-profile') {
        const { accountNumber, name, address } = await parseBody(req);
        if (!accountNumber || !name) {
            return sendJson(res, 400, { success: false, error: 'Account number and name are required' });
        }
        try {
            const accFilePath = path.join(BANK_DIR, 'data', 'accounts.txt');
            if (fs.existsSync(accFilePath)) {
                let content = fs.readFileSync(accFilePath, 'utf8');
                const lines = content.split(/\r?\n/);
                let found = false;
                const updatedLines = lines.map(line => {
                    if (!line.trim()) return line;
                    const parts = line.split('|');
                    if (parts[0] === String(accountNumber)) {
                        found = true;
                        parts[1] = String(name).trim();
                        if (address !== undefined && String(address).trim()) {
                            parts[2] = String(address).trim();
                        }
                        return parts.join('|');
                    }
                    return line;
                });
                if (found) {
                    fs.writeFileSync(accFilePath, updatedLines.join('\n'), 'utf8');
                    const result = await callBridge(['--get-account', String(accountNumber)]);
                    return sendJson(res, 200, {
                        success: true,
                        message: 'Profile updated successfully',
                        account: result.success ? result.account : { accountNumber, name, address }
                    });
                }
            }
            return sendJson(res, 404, { success: false, error: 'Account not found' });
        } catch (e) {
            return sendJson(res, 500, { success: false, error: e.message });
        }
    }

    // Deposit
    if (req.method === 'POST' && pathname === '/api/deposit') {
        const { accountNumber, amount } = await parseBody(req);
        if (!accountNumber || amount === undefined) {
            return sendJson(res, 400, { success: false, error: 'Account number and amount required' });
        }
        try {
            const result = await callBridge(['--deposit', String(accountNumber), String(amount)]);
            return sendJson(res, result.success ? 200 : 400, result);
        } catch (e) {
            return sendJson(res, 500, { success: false, error: e.message });
        }
    }

    // Withdraw
    if (req.method === 'POST' && pathname === '/api/withdraw') {
        const { accountNumber, amount } = await parseBody(req);
        if (!accountNumber || amount === undefined) {
            return sendJson(res, 400, { success: false, error: 'Account number and amount required' });
        }
        try {
            const result = await callBridge(['--withdraw', String(accountNumber), String(amount)]);
            return sendJson(res, result.success ? 200 : 400, result);
        } catch (e) {
            return sendJson(res, 500, { success: false, error: e.message });
        }
    }

    // Transfer
    if (req.method === 'POST' && pathname === '/api/transfer') {
        const { sender, receiver, amount } = await parseBody(req);
        if (!sender || !receiver || amount === undefined) {
            return sendJson(res, 400, { success: false, error: 'Sender, receiver, and amount are required' });
        }
        try {
            const result = await callBridge(['--transfer', String(sender), String(receiver), String(amount)]);
            return sendJson(res, result.success ? 200 : 400, result);
        } catch (e) {
            return sendJson(res, 500, { success: false, error: e.message });
        }
    }

    // Transactions
    if (req.method === 'GET' && pathname.startsWith('/api/transactions/')) {
        const id = pathname.split('/')[3];
        try {
            const result = await callBridge(['--transactions', String(id)]);
            return sendJson(res, 200, result);
        } catch (e) {
            return sendJson(res, 500, { success: false, error: e.message });
        }
    }

    // Admin: List Accounts
    if (req.method === 'GET' && pathname === '/api/admin/accounts') {
        try {
            const result = await callBridge(['--list-accounts']);
            return sendJson(res, 200, result);
        } catch (e) {
            return sendJson(res, 500, { success: false, error: e.message });
        }
    }

    // Admin: Analytics
    if (req.method === 'GET' && pathname === '/api/admin/analytics') {
        try {
            const result = await callBridge(['--analytics']);
            return sendJson(res, 200, result);
        } catch (e) {
            return sendJson(res, 500, { success: false, error: e.message });
        }
    }

    // Admin: Create Account
    if (req.method === 'POST' && pathname === '/api/admin/create-account') {
        const { name, address, password, balance, accountType } = await parseBody(req);
        if (!name || !address || !password || balance === undefined) {
            return sendJson(res, 400, { success: false, error: 'All fields (name, address, password, balance) are required' });
        }
        try {
            const result = await callBridge([
                '--create-account',
                String(name),
                String(address),
                String(password),
                String(balance),
                accountType || 'Savings'
            ]);
            return sendJson(res, result.success ? 200 : 400, result);
        } catch (e) {
            return sendJson(res, 500, { success: false, error: e.message });
        }
    }

    // Admin: Delete Account
    if (req.method === 'DELETE' && pathname.startsWith('/api/admin/delete-account/')) {
        const id = pathname.split('/')[4];
        try {
            const result = await callBridge(['--delete-account', String(id)]);
            return sendJson(res, result.success ? 200 : 400, result);
        } catch (e) {
            return sendJson(res, 500, { success: false, error: e.message });
        }
    }

    // Demo Accounts Helper (returns a clean list of top named accounts for demo/testing without credentials)
    if (req.method === 'GET' && pathname === '/api/demo-accounts') {
        try {
            const result = await callBridge(['--list-accounts']);
            if (result.success && Array.isArray(result.accounts)) {
                // Filter accounts with actual names
                const named = result.accounts.filter(a => a.name && a.name.trim().length > 0).slice(0, 10);
                return sendJson(res, 200, { success: true, accounts: named });
            }
            return sendJson(res, 200, { success: true, accounts: [] });
        } catch (e) {
            return sendJson(res, 500, { success: false, error: e.message });
        }
    }

    // --- STATIC FILES ---
    let filePath = path.join(GUI_DIR, pathname === '/' ? 'index.html' : pathname);

    // Prevent directory traversal
    if (!filePath.startsWith(GUI_DIR)) {
        res.writeHead(403);
        return res.end('Access Denied');
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            // Fallback to index.html for SPA
            filePath = path.join(GUI_DIR, 'index.html');
        }

        const ext = path.extname(filePath);
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        fs.readFile(filePath, (readErr, content) => {
            if (readErr) {
                res.writeHead(500);
                return res.end('Error reading file: ' + readErr.message);
            }
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        });
    });
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`====================================================`);
        console.log(`  Bank Sphere is already running on port ${PORT}     `);
        console.log(`  URL: http://localhost:${PORT}                     `);
        console.log(`====================================================`);
        process.exit(0);
    } else {
        console.error('[BankSphere] Server error:', err);
    }
});

server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`  Bank Sphere - Modern Banking Dashboard System     `);
    console.log(`  Connected directly to C++ Binary Search Tree core `);
    console.log(`  URL: http://localhost:${PORT}                     `);
    console.log(`====================================================`);
});
