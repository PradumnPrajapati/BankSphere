#include "../include/bst/AccountBST.h"
#include "../include/modules/AdminModule.h"
#include "../include/modules/StaffModule.h"
#include "../include/modules/CustomerModule.h"
#include <iostream>

int main() {
    AccountBST tree;

    int choice = 0;

    while (choice != 5) {
        std::cout << "\n========== BANK SPHERE ==========\n";
        std::cout << "1. Admin\n";
        std::cout << "2. Staff\n";
        std::cout << "3. Customer\n";
        std::cout << "4. Launch Modern Web Dashboard (GUI)\n";
        std::cout << "5. Exit\n";
        std::cout << "Enter choice: ";
        std::cin >> choice;

        if (choice == 1) {
            AdminModule::menu(tree);
        }

        if (choice == 2) {
            StaffModule::menu(tree);
        }

        if (choice == 3) {
            CustomerModule::menu(tree);
        }

        if (choice == 4) {
            std::cout << "\n[BankSphere] Opening Modern Web Dashboard at http://localhost:3000 ...\n";
            system("start http://localhost:3000");
        }
    }

    return 0;
}
