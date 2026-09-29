#pragma once
#include <string>

class AccountNode {
public:
    std::string name;
    std::string address;
    int accountNumber;
    std::size_t passwordHash;
    double balance;
    std::string accountType;
    bool isActive;

    AccountNode* left;
    AccountNode* right;

    AccountNode();
    AccountNode(const std::string& name,
                const std::string& address,
                int accountNumber,
                std::size_t passwordHash,
                double balance);
};
