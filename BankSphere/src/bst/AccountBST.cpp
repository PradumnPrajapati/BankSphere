#include "../../include/bst/AccountBST.h"
#include "../../include/utils/FileUtils.h"
#include <fstream>
#include <iostream>
#include <sstream>
#include <ctime>
#include <functional>

AccountBST::AccountBST() : root(nullptr) {
    loadData();
}

AccountBST::~AccountBST() {
    persistData();
    clear(root);
}

void AccountBST::clear(AccountNode* root) {
    if (!root) {
        return;
    }

    clear(root->left);
    clear(root->right);
    delete root;
}

AccountNode* AccountBST::insert(AccountNode* root, AccountNode* node) {
    if (!root) {
        return node;
    }

    if (node->accountNumber < root->accountNumber) {
        root->left = insert(root->left, node);
    } else if (node->accountNumber > root->accountNumber) {
        root->right = insert(root->right, node);
    }

    return root;
}

AccountNode* AccountBST::search(AccountNode* root, int accountNumber) {
    if (!root || root->accountNumber == accountNumber) {
        return root;
    }

    if (accountNumber < root->accountNumber) {
        return search(root->left, accountNumber);
    }

    return search(root->right, accountNumber);
}

AccountNode* AccountBST::findMin(AccountNode* root) {
    while (root && root->left) {
        root = root->left;
    }

    return root;
}

AccountNode* AccountBST::remove(AccountNode* root, int accountNumber) {
    if (!root) {
        return nullptr;
    }

    if (accountNumber < root->accountNumber) {
        root->left = remove(root->left, accountNumber);
    } else if (accountNumber > root->accountNumber) {
        root->right = remove(root->right, accountNumber);
    } else {
        if (!root->left) {
            AccountNode* temp = root->right;
            delete root;
            return temp;
        }

        if (!root->right) {
            AccountNode* temp = root->left;
            delete root;
            return temp;
        }

        AccountNode* successor = findMin(root->right);

        root->name = successor->name;
        root->address = successor->address;
        root->accountNumber = successor->accountNumber;
        root->passwordHash = successor->passwordHash;
        root->balance = successor->balance;

        root->right = remove(root->right, successor->accountNumber);
    }

    return root;
}

int AccountBST::generateAccountNumber() {
    int highest = 1000;

    std::function<void(AccountNode*)> traverse =
        [&](AccountNode* node) {
            if (!node) {
                return;
            }

            highest = std::max(highest, node->accountNumber);

            traverse(node->left);
            traverse(node->right);
        };

    traverse(root);

    return highest + 1;
}

bool AccountBST::addAccount(const std::string& name,
                            const std::string& address,
                            const std::string& password,
                            double balance,
                            const std::string& accountType) {
    if (balance < 0) {
        return false;
    }

    int accountNumber = generateAccountNumber();

    authTable.addCredential(accountNumber, password);

    std::size_t hashed = std::hash<std::string>{}("FinTrack@" + password);

    AccountNode* node = new AccountNode(
        name,
        address,
        accountNumber,
        hashed,
        balance
    );

    node->accountType = accountType;

    root = insert(root, node);

    FileUtils::logTransaction(accountNumber,
                              "Account created with balance: " +
                              std::to_string(balance));

    persistData();

    std::cout << "\nGenerated Account Number: "
              << accountNumber << "\n";

    return true;
}

bool AccountBST::deleteAccount(int accountNumber) {
    if (!findAccount(accountNumber)) {
        return false;
    }

    root = remove(root, accountNumber);
    authTable.removeCredential(accountNumber);

    persistData();
    return true;
}

bool AccountBST::deposit(int accountNumber, double amount) {
    if (amount <= 0) {
        return false;
    }

    AccountNode* account = findAccount(accountNumber);

    if (!account) {
        return false;
    }

    account->balance += amount;

    FileUtils::logTransaction(accountNumber,
                              "Deposit: +" + std::to_string(amount));

    persistData();
    return true;
}

bool AccountBST::withdraw(int accountNumber, double amount) {
    if (amount <= 0) {
        return false;
    }

    AccountNode* account = findAccount(accountNumber);

    if (!account) {
        return false;
    }

    double minimumBalance = (account->accountType == "Current") ? 5000 : 1000;

    if (account->balance - amount < minimumBalance) {
        return false;
    }

    account->balance -= amount;

    FileUtils::logTransaction(accountNumber,
                              "Withdraw: -" + std::to_string(amount));

    persistData();
    return true;
}

bool AccountBST::transfer(int sender, int receiver, double amount) {
    if (amount <= 0) {
        return false;
    }

    AccountNode* senderAccount = findAccount(sender);
    AccountNode* receiverAccount = findAccount(receiver);

    if (!senderAccount || !receiverAccount) {
        return false;
    }

    double minimumBalance = (senderAccount->accountType == "Current") ? 5000 : 1000;

    if (senderAccount->balance - amount < minimumBalance) {
        return false;
    }

    senderAccount->balance -= amount;
    receiverAccount->balance += amount;

    FileUtils::logTransaction(sender,
                              "Transfer to " +
                              std::to_string(receiver) +
                              ": -" + std::to_string(amount));

    FileUtils::logTransaction(receiver,
                              "Received from " +
                              std::to_string(sender) +
                              ": +" + std::to_string(amount));

    persistData();

    return true;
}

bool AccountBST::authenticate(int accountNumber,
                              const std::string& password) {
    return authTable.validate(accountNumber, password);
}

AccountNode* AccountBST::findAccount(int accountNumber) {
    return search(root, accountNumber);
}

void AccountBST::printInOrder(AccountNode* root) {
    if (!root) {
        return;
    }

    printInOrder(root->left);

    std::cout << "--------------------------------\n";
    std::cout << "Account Number : " << root->accountNumber << "\n";
    std::cout << "Name           : " << root->name << "\n";
    std::cout << "Address        : " << root->address << "\n";
    std::cout << "Type           : " << root->accountType << "\n";
    std::cout << "Status         : " << (root->isActive ? "Active" : "Inactive") << "\n";
    std::cout << "Balance        : " << root->balance << "\n";

    printInOrder(root->right);
}

void AccountBST::displayAllAccounts() {
    printInOrder(root);
}

void AccountBST::displayBankAnalytics() {
    int totalAccounts = 0;
    double totalBalance = 0;

    std::function<void(AccountNode*)> traverse = [&](AccountNode* node) {
        if (!node) {
            return;
        }

        totalAccounts++;
        totalBalance += node->balance;

        traverse(node->left);
        traverse(node->right);
    };

    traverse(root);

    std::cout << "\n========== BANK ANALYTICS ==========\n";
    std::cout << "Total Accounts : " << totalAccounts << "\n";
    std::cout << "Total Bank Balance : " << totalBalance << "\n";
}

void AccountBST::saveAccounts(AccountNode* root, std::ofstream& file) {
    if (!root) {
        return;
    }

    saveAccounts(root->left, file);

    file << root->accountNumber << "|"
         << root->name << "|"
         << root->address << "|"
         << root->passwordHash << "|"
         << root->balance << "|"
         << root->accountType << "|"
         << root->isActive << "\n";

    saveAccounts(root->right, file);
}

void AccountBST::persistData() {
    std::ofstream file(FileUtils::ACCOUNT_FILE);

    saveAccounts(root, file);
}

void AccountBST::loadData() {
    std::ifstream file(FileUtils::ACCOUNT_FILE);

    if (!file.is_open()) {
        return;
    }

    std::string line;

    while (std::getline(file, line)) {
        if (line.empty()) {
            continue;
        }

        std::stringstream ss(line);

        std::string accountStr;
        std::string name;
        std::string address;
        std::string hashStr;
        std::string balanceStr;
        std::string accountType;
        std::string statusStr;

        std::getline(ss, accountStr, '|');
        std::getline(ss, name, '|');
        std::getline(ss, address, '|');
        std::getline(ss, hashStr, '|');
        std::getline(ss, balanceStr, '|');
        std::getline(ss, accountType, '|');
        std::getline(ss, statusStr, '|');

        AccountNode* node = new AccountNode(
            name,
            address,
            std::stoi(accountStr),
            std::stoull(hashStr),
            std::stod(balanceStr)
        );

        node->accountType = accountType;

    root = insert(root, node);
    }
}
