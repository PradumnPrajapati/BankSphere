# Bank Management System

## Overview

Bank Management System is a console-based banking application developed in C++ that simulates core banking operations through a role-based access model. The project demonstrates strong Object-Oriented Programming principles, efficient data management using custom data structures, and persistent storage through file handling.

The system supports account creation, account management, fund transfers, deposits, withdrawals, authentication, and transaction tracking while maintaining a modular and scalable code structure.

---

## Key Concepts Demonstrated

- Object-Oriented Programming (OOP)
- Data Structures and Algorithms
- Binary Search Tree (BST)
- Hash Table with Separate Chaining
- Linked Lists
- File Handling and Data Persistence
- Role-Based Access Control
- Modular Software Design

---

## Features

### Admin
- Create customer accounts
- Delete customer accounts
- View all registered accounts

### Staff
- Deposit funds
- Withdraw funds
- Transfer money between accounts

### Customer
- Secure login authentication
- View account details
- View transaction history

---

## Data Structures Used

| Functionality | Data Structure |
|--------------|---------------|
| Account Management | Binary Search Tree (BST) |
| User Authentication | Hash Table |
| Collision Resolution | Linked List (Separate Chaining) |

---

## Technical Highlights

- Designed a modular architecture using classes and separate modules for maintainability and scalability.
- Implemented efficient account management using a Binary Search Tree for organized account storage and retrieval.
- Utilized Hash Tables with separate chaining for fast credential lookup and authentication.
- Applied file handling to persist account and transaction data across application sessions.
- Followed Object-Oriented Programming principles including encapsulation, abstraction, inheritance, and polymorphism where applicable.
- Separated business logic, data structures, and utility functions into dedicated modules for improved code organization.

---

## Project Structure

```text
Bank-Management-System/
│
├── data/
│   └── account and transaction records
│
├── include/
│   └── header files
│
├── src/
│   ├── bst/
│   ├── hashtable/
│   ├── modules/
│   ├── utils/
│   └── main.cpp
│
├── Makefile
├── README.md
└── .gitignore
```

---

## Build and Run

### Option 1: Modern Graphical Banking Dashboard (Recommended)

Bank Sphere features a modern, responsive web dashboard connected directly to the C++ Binary Search Tree and Separate Chaining Hash Table backend via a high-performance local bridge.

#### Launching the GUI:
```powershell
# From the project root folder:
.\run_gui.bat
```
Or with Node.js:
```bash
node server.js
```
Then open your browser at **`http://localhost:3000`**.

#### Features Available in GUI:
- **Role Portals:** Seamless switching between **Customer**, **Staff**, and **Administrator**.
- **Customer Dashboard:** Real-time balance display, quick deposit/withdrawal/transfer actions, and recent transaction feeds.
- **Transaction History:** Searchable and filterable ledger powered by `FileUtils::logTransaction`.
- **Staff Operations:** Over-the-counter deposits, withdrawals, transfers, and instant BST account lookups.
- **Admin Console:** Bank analytics (total accounts, system liquidity, average balance), customer creation, and BST node deletion.

---

### Option 2: Classic C++ Console Terminal

The original console application remains 100% functional and uses the exact same data structures and files:

#### Quick Run:
```powershell
# From the project root folder:
.\run.bat
```

#### Manual Compilation & Run:
```bash
cd BankSphere
g++ -std=c++17 src/main.cpp src/bst/*.cpp src/hashtable/*.cpp src/modules/*.cpp src/utils/*.cpp -Iinclude -o BankSphere.exe
./BankSphere.exe
```

---

## Learning Outcomes

Through this project, I gained hands-on experience with:

- Designing applications using Object-Oriented Programming principles
- Implementing and integrating custom data structures (Binary Search Tree, Separate Chaining Hash Table)
- Managing persistent storage using file handling
- Building a full-stack bridge between native C++ data structures and a modern fintech dashboard
- Structuring medium-sized C++ projects using modular design
- Applying Data Structures and Algorithms to real-world scenarios

---

## Completed & Future Enhancements

- [x] Develop a modern graphical user interface (GUI) connected to the C++ core
- [x] Add role-based access for Customer, Staff, and Admin
- [x] Add account search and transaction reporting features
- [ ] Implement AVL Trees for self-balancing account storage
- [ ] Integrate a relational database (MySQL/PostgreSQL)
- [ ] Implement Admin authentication and authorization tokens
