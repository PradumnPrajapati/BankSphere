#include "../../include/modules/AdminModule.h"
#include <iostream>
#include <limits>

void AdminModule::menu(AccountBST& tree) {
    int choice = 0;

    while (choice != 6) {
        std::cout << "\n========== ADMIN MENU ==========\n";
        std::cout << "1. Create Account\n";
        std::cout << "2. Delete Account\n";
        std::cout << "3. View All Accounts\n";
        std::cout << "4. Search Account\n";
        std::cout << "5. Bank Analytics\n";
        std::cout << "6. Exit\n";
        std::cout << "Enter choice: ";

        std::cin >> choice;

        if (choice == 1) {
            std::string name, address, password;
            int typeChoice;
            std::string accountType;
            double balance;

            std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');

            std::cout << "Enter name: ";
            std::getline(std::cin, name);

            std::cout << "Enter address: ";
            std::getline(std::cin, address);

            std::cout << "Enter password: ";
            std::getline(std::cin, password);

            std::cout << "Select account type:\n";
            std::cout << "1. Savings\n";
            std::cout << "2. Current\n";
            std::cin >> typeChoice;

            accountType = (typeChoice == 2) ? "Current" : "Savings";

            std::cout << "Enter opening balance: ";
            std::cin >> balance;

            if (tree.addAccount(name, address, password, balance, accountType)) {
                std::cout << "Account created successfully.\n";
            } else {
                std::cout << "Failed to create account.\n";
            }
        }

        else if (choice == 2) {
            int accountNumber;

            std::cout << "Enter account number: ";
            std::cin >> accountNumber;

            if (tree.deleteAccount(accountNumber)) {
                std::cout << "Account deleted successfully.\n";
            } else {
                std::cout << "Account not found.\n";
            }
        }

        else if (choice == 3) {
            tree.displayAllAccounts();
        }

        else if (choice == 4) {
            int accountNumber;
            std::cout << "Enter account number: ";
            std::cin >> accountNumber;

            AccountNode* account = tree.findAccount(accountNumber);

            if (!account) {
                std::cout << "Account not found.\n";
            } else {
                std::cout << "\n========== ACCOUNT DETAILS ==========\n";
                std::cout << "Account Number : " << account->accountNumber << "\n";
                std::cout << "Name           : " << account->name << "\n";
                std::cout << "Type           : " << account->accountType << "\n";
                std::cout << "Balance        : " << account->balance << "\n";
            }
        }

        else if (choice == 5) {
            tree.displayBankAnalytics();
        }

        else if (choice != 6) {
            std::cout << "Invalid choice.\n";
        }
    }
}