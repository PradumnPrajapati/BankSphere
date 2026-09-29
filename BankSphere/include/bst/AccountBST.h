#pragma once
#include "AccountNode.h"
#include "../hashtable/AuthTable.h"
#include <string>

class AccountBST {
private:
    AccountNode* root;
    AuthTable authTable;

    AccountNode* insert(AccountNode* root, AccountNode* node);
    AccountNode* remove(AccountNode* root, int accountNumber);
    AccountNode* search(AccountNode* root, int accountNumber);
    AccountNode* findMin(AccountNode* root);
    void printInOrder(AccountNode* root);
    void saveAccounts(AccountNode* root, std::ofstream& file);
    void clear(AccountNode* root);

public:
    AccountBST();
    ~AccountBST();

    void loadData();
    void persistData();

    int generateAccountNumber();

    bool addAccount(const std::string& name,
                    const std::string& address,
                    const std::string& password,
                    double balance,
                    const std::string& accountType = "Savings");

    bool deleteAccount(int accountNumber);

    bool deposit(int accountNumber, double amount);
    bool withdraw(int accountNumber, double amount);
    bool transfer(int sender, int receiver, double amount);

    bool authenticate(int accountNumber, const std::string& password);

    AccountNode* findAccount(int accountNumber);

    void displayAllAccounts();
    void displayBankAnalytics();
};
