#include "../../include/modules/CustomerModule.h"
#include <fstream>
#include <iostream>
#include <limits>

void CustomerModule::menu(AccountBST& tree) {
    int accountNumber;
    std::string password;

    std::cout << "Enter account number: ";
    std::cin >> accountNumber;

    std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');

    std::cout << "Enter password: ";
    std::getline(std::cin, password);

    if (!tree.authenticate(accountNumber, password)) {
        std::cout << "Invalid credentials.\n";
        return;
    }

    int choice = 0;

    while (choice != 3) {
        std::cout << "\n========== CUSTOMER MENU ==========\n";
        std::cout << "1. View Account\n";
        std::cout << "2. View Transactions\n";
        std::cout << "3. Exit\n";
        std::cout << "Enter choice: ";

        std::cin >> choice;

        if (choice == 1) {
            AccountNode* account = tree.findAccount(accountNumber);

            if (!account) {
                std::cout << "Account not found.\n";
                continue;
            }

            std::cout << "\n========== ACCOUNT DETAILS ==========\n";
            std::cout << "Account Number : " << account->accountNumber << "\n";
            std::cout << "Name           : " << account->name << "\n";
            std::cout << "Address        : " << account->address << "\n";
            std::cout << "Balance        : " << account->balance << "\n";
        }

        else if (choice == 2) {
            std::ifstream file(
                "data/transactions/" +
                std::to_string(accountNumber) +
                ".txt"
            );

            if (!file.is_open()) {
                std::cout << "No transaction history found.\n";
                continue;
            }

            std::string line;

            std::cout << "\n========== TRANSACTION HISTORY ==========\n";

            while (std::getline(file, line)) {
                std::cout << line << "\n";
            }

            file.close();
        }

        else if (choice != 3) {
            std::cout << "Invalid choice.\n";
        }
    }
}