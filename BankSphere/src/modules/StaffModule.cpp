#include "../../include/modules/StaffModule.h"
#include <iostream>

void StaffModule::menu(AccountBST& tree) {
    int choice = 0;

    while (choice != 4) {
        std::cout << "\n========== STAFF MENU ==========\n";
        std::cout << "1. Deposit\n";
        std::cout << "2. Withdraw\n";
        std::cout << "3. Transfer\n";
        std::cout << "4. Exit\n";
        std::cout << "Enter choice: ";

        std::cin >> choice;

        int sender;
        int receiver;
        double amount;

        if (choice == 1) {
            std::cout << "Enter account number: ";
            std::cin >> sender;

            std::cout << "Enter amount: ";
            std::cin >> amount;

            if (amount <= 0) {
                std::cout << "Invalid amount.\n";
                continue;
            }

            if (tree.deposit(sender, amount)) {
                std::cout << "Deposit successful.\n";
            } else {
                std::cout << "Deposit failed.\n";
            }
        }

        else if (choice == 2) {
            std::cout << "Enter account number: ";
            std::cin >> sender;

            std::cout << "Enter amount: ";
            std::cin >> amount;

            if (amount <= 0) {
                std::cout << "Invalid amount.\n";
                continue;
            }

            if (tree.withdraw(sender, amount)) {
                std::cout << "Withdraw successful.\n";
            } else {
                std::cout << "Withdraw failed.\n";
            }
        }

        else if (choice == 3) {
            std::cout << "Enter sender account number: ";
            std::cin >> sender;

            std::cout << "Enter receiver account number: ";
            std::cin >> receiver;

            if (sender == receiver) {
                std::cout << "Cannot transfer to same account.\n";
                continue;
            }

            std::cout << "Enter amount: ";
            std::cin >> amount;

            if (amount <= 0) {
                std::cout << "Invalid amount.\n";
                continue;
            }

            if (tree.transfer(sender, receiver, amount)) {
                std::cout << "Transfer successful.\n";
            } else {
                std::cout << "Transfer failed.\n";
            }
        }

        else if (choice != 4) {
            std::cout << "Invalid choice.\n";
        }
    }
}