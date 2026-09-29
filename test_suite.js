const http = require('http');

async function request(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };

    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTestSuite() {
  console.log('====================================================');
  console.log('  RUNNING BANK SPHERE E2E INTEGRATION TEST SUITE     ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Test Login (valid)
  console.log('Testing Authentication (C++ AuthTable)...');
  const loginRes = await request('/api/login', 'POST', { accountNumber: 1001, password: 'Rajan@123' });
  assert(loginRes.status === 200 && loginRes.data.success && loginRes.data.account.accountNumber === 1001, 'Valid credentials login to Account 1001');

  // 2. Test Login (invalid password)
  const invalidLogin = await request('/api/login', 'POST', { accountNumber: 1001, password: 'WrongPassword' });
  assert(invalidLogin.status === 401 && !invalidLogin.data.success, 'Invalid credentials properly rejected with 401');

  // 3. Test Account Lookup
  console.log('\nTesting Account Lookup (C++ BST Search)...');
  const accRes = await request('/api/account/1001');
  assert(accRes.status === 200 && accRes.data.account.name === 'Rajan Soni', 'Fetched account #1001 name correctly: ' + accRes.data.account.name);
  const initialBal = accRes.data.account.balance;

  // 4. Test Deposit
  console.log('\nTesting Deposit Operation (C++ tree.deposit)...');
  const depRes = await request('/api/deposit', 'POST', { accountNumber: 1001, amount: 250 });
  assert(depRes.status === 200 && depRes.data.balance === initialBal + 250, `Deposit of 250 reflected in balance: ${initialBal} -> ${depRes.data.balance}`);

  // 5. Test Withdrawal
  console.log('\nTesting Withdrawal Operation (C++ tree.withdraw)...');
  const withRes = await request('/api/withdraw', 'POST', { accountNumber: 1001, amount: 250 });
  assert(withRes.status === 200 && withRes.data.balance === initialBal, `Withdrawal of 250 restored balance: ${withRes.data.balance}`);

  // 6. Test Minimum Balance enforcement
  console.log('\nTesting Minimum Balance Policy...');
  const excessiveWith = await request('/api/withdraw', 'POST', { accountNumber: 1001, amount: 999999 });
  assert(!excessiveWith.data.success, 'Excessive withdrawal properly rejected by C++ minimum balance check');

  // 7. Test Fund Transfer
  console.log('\nTesting Fund Transfer (C++ tree.transfer)...');
  const trfRes = await request('/api/transfer', 'POST', { sender: 1001, receiver: 1002, amount: 50 });
  assert(trfRes.status === 200 && trfRes.data.success, 'Transfer of 50 from 1001 to 1002 completed successfully');

  // Reverse transfer to restore balances
  await request('/api/transfer', 'POST', { sender: 1002, receiver: 1001, amount: 50 });

  // 8. Test Transaction History
  console.log('\nTesting Transaction Logging (C++ FileUtils)...');
  const txRes = await request('/api/transactions/1001');
  assert(txRes.status === 200 && txRes.data.transactions.length > 0, `Retrieved ${txRes.data.transactions.length} ledger records from data/transactions/1001.txt`);

  // 9. Test Bank Analytics
  console.log('\nTesting Bank Analytics...');
  const analyticsRes = await request('/api/admin/analytics');
  assert(analyticsRes.status === 200 && analyticsRes.data.totalAccounts > 0, `Total accounts in BST: ${analyticsRes.data.totalAccounts}, Total Liquidity: ₹${analyticsRes.data.totalBalance}`);

  // 10. Test Admin Create Account
  console.log('\nTesting Customer Account Registration (C++ BST Insertion)...');
  const createRes = await request('/api/admin/create-account', 'POST', {
    name: 'Priya Sharma',
    address: 'Connaught Place, New Delhi',
    password: 'Priya@123',
    accountType: 'Savings',
    balance: 5000
  });
  assert(createRes.status === 200 && createRes.data.success && createRes.data.accountNumber > 0, `Created account #${createRes.data?.accountNumber} for Priya Sharma`);

  // 11. Test Login with New Account
  if (createRes.data?.accountNumber) {
    const newLogin = await request('/api/login', 'POST', {
      accountNumber: createRes.data.accountNumber,
      password: 'Priya@123'
    });
    assert(newLogin.status === 200 && newLogin.data.success, `New account #${createRes.data.accountNumber} successfully logged in using AuthTable hash`);

    // Clean up created test account
    await request(`/api/admin/delete-account/${createRes.data.accountNumber}`, 'DELETE');
    console.log(`Cleaned up temporary test account #${createRes.data.accountNumber}`);
  }

  console.log('\n====================================================');
  console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  process.exit(failed > 0 ? 1 : 0);
}

runTestSuite().catch(err => {
  console.error('Test Suite encountered an unexpected error:', err);
  process.exit(1);
});
