#include "../include/bst/AccountBST.h"
#include "../include/utils/FileUtils.h"
#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
#include <vector>
#include <iomanip>

// Helper to escape JSON strings
std::string escapeJson(const std::string& input) {
    std::ostringstream ss;
    for (char c : input) {
        if (c == '"') ss << "\\\"";
        else if (c == '\\') ss << "\\\\";
        else if (c == '\b') ss << "\\b";
        else if (c == '\f') ss << "\\f";
        else if (c == '\n') ss << "\\n";
        else if (c == '\r') ss << "\\r";
        else if (c == '\t') ss << "\\t";
        else if ('\x00' <= c && c <= '\x1f') {
            ss << "\\u" << std::hex << std::setw(4) << std::setfill('0') << (int)c;
        } else {
            ss << c;
        }
    }
    return ss.str();
}

void traverseAccountsJson(AccountNode* node, std::vector<std::string>& list) {
    if (!node) return;
    traverseAccountsJson(node->left, list);

    std::ostringstream ss;
    ss << "{"
       << "\"accountNumber\":" << node->accountNumber << ","
       << "\"name\":\"" << escapeJson(node->name) << "\","
       << "\"address\":\"" << escapeJson(node->address) << "\","
       << "\"balance\":" << std::fixed << std::setprecision(2) << node->balance << ","
       << "\"accountType\":\"" << escapeJson(node->accountType) << "\","
       << "\"isActive\":" << (node->isActive ? "true" : "false")
       << "}";
    list.push_back(ss.str());

    traverseAccountsJson(node->right, list);
}

void getAnalytics(AccountNode* node, int& count, double& totalBalance) {
    if (!node) return;
    count++;
    totalBalance += node->balance;
    getAnalytics(node->left, count, totalBalance);
    getAnalytics(node->right, count, totalBalance);
}

int executeCommand(AccountBST& tree, const std::string& cmd, const std::vector<std::string>& args) {
    if (cmd == "--login") {
        if (args.size() < 2) {
            std::cout << "{\"success\":false,\"error\":\"Missing account number or password\"}\n";
            return 1;
        }
        int accNum = std::stoi(args[0]);
        std::string pwd = args[1];

        if (tree.authenticate(accNum, pwd)) {
            AccountNode* acc = tree.findAccount(accNum);
            if (!acc) {
                std::cout << "{\"success\":false,\"error\":\"Account node not found in BST\"}\n";
                return 1;
            }
            std::cout << "{"
                      << "\"success\":true,"
                      << "\"account\":{"
                      << "\"accountNumber\":" << acc->accountNumber << ","
                      << "\"name\":\"" << escapeJson(acc->name) << "\","
                      << "\"address\":\"" << escapeJson(acc->address) << "\","
                      << "\"balance\":" << std::fixed << std::setprecision(2) << acc->balance << ","
                      << "\"accountType\":\"" << escapeJson(acc->accountType) << "\","
                      << "\"isActive\":" << (acc->isActive ? "true" : "false")
                      << "}"
                      << "}\n";
            return 0;
        } else {
            std::cout << "{\"success\":false,\"error\":\"Invalid account number or password\"}\n";
            return 0;
        }
    }

    if (cmd == "--get-account") {
        if (args.empty()) {
            std::cout << "{\"success\":false,\"error\":\"Missing account number\"}\n";
            return 1;
        }
        int accNum = std::stoi(args[0]);
        AccountNode* acc = tree.findAccount(accNum);
        if (!acc) {
            std::cout << "{\"success\":false,\"error\":\"Account not found\"}\n";
            return 0;
        }
        std::cout << "{"
                  << "\"success\":true,"
                  << "\"account\":{"
                  << "\"accountNumber\":" << acc->accountNumber << ","
                  << "\"name\":\"" << escapeJson(acc->name) << "\","
                  << "\"address\":\"" << escapeJson(acc->address) << "\","
                  << "\"balance\":" << std::fixed << std::setprecision(2) << acc->balance << ","
                  << "\"accountType\":\"" << escapeJson(acc->accountType) << "\","
                  << "\"isActive\":" << (acc->isActive ? "true" : "false")
                  << "}"
                  << "}\n";
        return 0;
    }

    if (cmd == "--deposit") {
        if (args.size() < 2) {
            std::cout << "{\"success\":false,\"error\":\"Missing account number or amount\"}\n";
            return 1;
        }
        int accNum = std::stoi(args[0]);
        double amount = std::stod(args[1]);

        if (amount <= 0) {
            std::cout << "{\"success\":false,\"error\":\"Deposit amount must be greater than zero\"}\n";
            return 0;
        }

        if (tree.deposit(accNum, amount)) {
            AccountNode* acc = tree.findAccount(accNum);
            std::cout << "{"
                      << "\"success\":true,"
                      << "\"message\":\"Deposit successful\","
                      << "\"balance\":" << std::fixed << std::setprecision(2) << (acc ? acc->balance : 0.0)
                      << "}\n";
            return 0;
        } else {
            std::cout << "{\"success\":false,\"error\":\"Deposit failed. Account may not exist.\"}\n";
            return 0;
        }
    }

    if (cmd == "--withdraw") {
        if (args.size() < 2) {
            std::cout << "{\"success\":false,\"error\":\"Missing account number or amount\"}\n";
            return 1;
        }
        int accNum = std::stoi(args[0]);
        double amount = std::stod(args[1]);

        if (amount <= 0) {
            std::cout << "{\"success\":false,\"error\":\"Withdrawal amount must be greater than zero\"}\n";
            return 0;
        }

        AccountNode* acc = tree.findAccount(accNum);
        if (!acc) {
            std::cout << "{\"success\":false,\"error\":\"Account not found\"}\n";
            return 0;
        }

        double minBal = (acc->accountType == "Current") ? 5000.0 : 1000.0;
        if (acc->balance - amount < minBal) {
            std::cout << "{\"success\":false,\"error\":\"Insufficient funds. Required minimum balance is ₹" 
                      << (long)minBal << " for " << acc->accountType << " accounts.\"}\n";
            return 0;
        }

        if (tree.withdraw(accNum, amount)) {
            acc = tree.findAccount(accNum);
            std::cout << "{"
                      << "\"success\":true,"
                      << "\"message\":\"Withdrawal successful\","
                      << "\"balance\":" << std::fixed << std::setprecision(2) << (acc ? acc->balance : 0.0)
                      << "}\n";
            return 0;
        } else {
            std::cout << "{\"success\":false,\"error\":\"Withdrawal failed\"}\n";
            return 0;
        }
    }

    if (cmd == "--transfer") {
        if (args.size() < 3) {
            std::cout << "{\"success\":false,\"error\":\"Missing sender, receiver, or amount\"}\n";
            return 1;
        }
        int sender = std::stoi(args[0]);
        int receiver = std::stoi(args[1]);
        double amount = std::stod(args[2]);

        if (sender == receiver) {
            std::cout << "{\"success\":false,\"error\":\"Cannot transfer funds to the same account\"}\n";
            return 0;
        }

        if (amount <= 0) {
            std::cout << "{\"success\":false,\"error\":\"Transfer amount must be greater than zero\"}\n";
            return 0;
        }

        AccountNode* sAcc = tree.findAccount(sender);
        AccountNode* rAcc = tree.findAccount(receiver);

        if (!sAcc) {
            std::cout << "{\"success\":false,\"error\":\"Sender account not found\"}\n";
            return 0;
        }
        if (!rAcc) {
            std::cout << "{\"success\":false,\"error\":\"Recipient account not found\"}\n";
            return 0;
        }

        double minBal = (sAcc->accountType == "Current") ? 5000.0 : 1000.0;
        if (sAcc->balance - amount < minBal) {
            std::cout << "{\"success\":false,\"error\":\"Insufficient balance. Required minimum balance is ₹" 
                      << (long)minBal << " for " << sAcc->accountType << " accounts.\"}\n";
            return 0;
        }

        if (tree.transfer(sender, receiver, amount)) {
            sAcc = tree.findAccount(sender);
            std::cout << "{"
                      << "\"success\":true,"
                      << "\"message\":\"Transfer successful\","
                      << "\"senderBalance\":" << std::fixed << std::setprecision(2) << (sAcc ? sAcc->balance : 0.0)
                      << "}\n";
            return 0;
        } else {
            std::cout << "{\"success\":false,\"error\":\"Transfer failed\"}\n";
            return 0;
        }
    }

    if (cmd == "--create-account") {
        // args: name, address, password, balance, accountType
        if (args.size() < 5) {
            std::cout << "{\"success\":false,\"error\":\"Missing parameters for account creation\"}\n";
            return 1;
        }
        std::string name = args[0];
        std::string address = args[1];
        std::string password = args[2];
        double balance = std::stod(args[3]);
        std::string accountType = args[4];

        int newAccNum = tree.generateAccountNumber();

        if (tree.addAccount(name, address, password, balance, accountType)) {
            std::cout << "{"
                      << "\"success\":true,"
                      << "\"message\":\"Account created successfully\","
                      << "\"accountNumber\":" << newAccNum
                      << "}\n";
            return 0;
        } else {
            std::cout << "{\"success\":false,\"error\":\"Failed to create account\"}\n";
            return 0;
        }
    }

    if (cmd == "--delete-account") {
        if (args.empty()) {
            std::cout << "{\"success\":false,\"error\":\"Missing account number\"}\n";
            return 1;
        }
        int accNum = std::stoi(args[0]);

        if (tree.deleteAccount(accNum)) {
            std::cout << "{\"success\":true,\"message\":\"Account deleted successfully\"}\n";
            return 0;
        } else {
            std::cout << "{\"success\":false,\"error\":\"Account not found\"}\n";
            return 0;
        }
    }

    if (cmd == "--list-accounts") {
        std::vector<std::string> accList;
        // Search root by searching findAccount
        // Or traverse by searching min to max or using helper
        // Since root is private in AccountBST, let's look at how AccountBST exposes accounts:
        // We can inspect all accounts by reading accounts.txt or adding a public traverse.
        // But wait! Can we read data/accounts.txt directly or inspect BST?
        // Let's check: data/accounts.txt contains all saved accounts!
        // Also we can load data directly or parse.
        std::ifstream file(FileUtils::ACCOUNT_FILE);
        std::cout << "{\"success\":true,\"accounts\":[";
        if (file.is_open()) {
            std::string line;
            bool first = true;
            while (std::getline(file, line)) {
                if (line.empty()) continue;
                std::stringstream ss(line);
                std::string accStr, name, addr, hashStr, balStr, typeStr, statusStr;
                std::getline(ss, accStr, '|');
                std::getline(ss, name, '|');
                std::getline(ss, addr, '|');
                std::getline(ss, hashStr, '|');
                std::getline(ss, balStr, '|');
                std::getline(ss, typeStr, '|');
                std::getline(ss, statusStr, '|');

                if (!first) std::cout << ",";
                first = false;

                std::cout << "{"
                          << "\"accountNumber\":" << accStr << ","
                          << "\"name\":\"" << escapeJson(name) << "\","
                          << "\"address\":\"" << escapeJson(addr) << "\","
                          << "\"balance\":" << (balStr.empty() ? "0" : balStr) << ","
                          << "\"accountType\":\"" << escapeJson(typeStr) << "\","
                          << "\"isActive\":" << (statusStr == "1" ? "true" : "false")
                          << "}";
            }
        }
        std::cout << "]}\n";
        return 0;
    }

    if (cmd == "--analytics") {
        std::ifstream file(FileUtils::ACCOUNT_FILE);
        int totalAccounts = 0;
        double totalBalance = 0;
        if (file.is_open()) {
            std::string line;
            while (std::getline(file, line)) {
                if (line.empty()) continue;
                std::stringstream ss(line);
                std::string accStr, name, addr, hashStr, balStr;
                std::getline(ss, accStr, '|');
                std::getline(ss, name, '|');
                std::getline(ss, addr, '|');
                std::getline(ss, hashStr, '|');
                std::getline(ss, balStr, '|');
                if (!balStr.empty()) {
                    totalAccounts++;
                    totalBalance += std::stod(balStr);
                }
            }
        }
        std::cout << "{"
                  << "\"success\":true,"
                  << "\"totalAccounts\":" << totalAccounts << ","
                  << "\"totalBalance\":" << std::fixed << std::setprecision(2) << totalBalance
                  << "}\n";
        return 0;
    }

    if (cmd == "--transactions") {
        if (args.empty()) {
            std::cout << "{\"success\":false,\"error\":\"Missing account number\"}\n";
            return 1;
        }
        int accNum = std::stoi(args[0]);
        std::string filePath = "data/transactions/" + std::to_string(accNum) + ".txt";
        std::ifstream file(filePath);

        std::cout << "{\"success\":true,\"accountNumber\":" << accNum << ",\"transactions\":[";
        if (file.is_open()) {
            std::string line;
            bool first = true;
            std::vector<std::string> lines;
            while (std::getline(file, line)) {
                if (!line.empty()) {
                    lines.push_back(line);
                }
            }
            // Output in reverse order (most recent first)
            for (auto it = lines.rbegin(); it != lines.rend(); ++it) {
                if (!first) std::cout << ",";
                first = false;

                std::string raw = *it;
                std::string date = "";
                std::string desc = raw;

                if (raw.size() > 21 && raw[0] == '[' && raw[20] == ']') {
                    date = raw.substr(1, 19);
                    desc = raw.substr(22);
                }

                // Determine transaction type and amount from description
                std::string type = "Transfer";
                double amount = 0.0;
                if (desc.find("Deposit:") != std::string::npos || desc.find("Account created") != std::string::npos || desc.find("Received") != std::string::npos) {
                    type = "Credit";
                } else if (desc.find("Withdraw:") != std::string::npos || desc.find("Transfer to") != std::string::npos) {
                    type = "Debit";
                }

                size_t plusPos = desc.find('+');
                size_t minusPos = desc.find('-');
                if (plusPos != std::string::npos) {
                    try { amount = std::stod(desc.substr(plusPos + 1)); } catch (...) {}
                } else if (minusPos != std::string::npos) {
                    try { amount = std::stod(desc.substr(minusPos + 1)); } catch (...) {}
                } else if (desc.find("Account created with balance: ") != std::string::npos) {
                    try { amount = std::stod(desc.substr(30)); } catch (...) {}
                }

                std::cout << "{"
                          << "\"raw\":\"" << escapeJson(raw) << "\","
                          << "\"date\":\"" << escapeJson(date) << "\","
                          << "\"description\":\"" << escapeJson(desc) << "\","
                          << "\"type\":\"" << type << "\","
                          << "\"amount\":" << std::fixed << std::setprecision(2) << amount
                          << "}";
            }
        }
        std::cout << "]}\n";
        return 0;
    }

    std::cout << "{\"success\":false,\"error\":\"Unknown command: " << escapeJson(cmd) << "\"}\n";
    return 1;
}

int main(int argc, char* argv[]) {
    // Synchronize C++ streams with C stdio disabled for speed
    std::ios_base::sync_with_stdio(false);
    std::cin.tie(NULL);

    AccountBST tree;

    // Check if running in single command line mode
    if (argc >= 2) {
        std::string cmd = argv[1];
        std::vector<std::string> args;
        for (int i = 2; i < argc; ++i) {
            args.push_back(argv[i]);
        }
        return executeCommand(tree, cmd, args);
    }

    // Interactive stdio mode for persistent daemon bridge
    // Reads line: <cmd> [arg1] [arg2] ...
    std::string line;
    while (std::getline(std::cin, line)) {
        if (line.empty()) continue;
        if (line == "exit" || line == "quit") break;

        std::stringstream ss(line);
        std::string cmd;
        ss >> cmd;

        std::vector<std::string> args;
        std::string arg;
        while (ss >> std::quoted(arg)) {
            args.push_back(arg);
        }

        executeCommand(tree, cmd, args);
        std::cout << std::flush;
    }

    return 0;
}
