# Bank Sphere — Modern Core Banking System

A full-featured Bank Management System built in **C++** using **Binary Search Trees (BST)** and **Separate Chaining Hash Tables**, paired with an enterprise-grade modern web dashboard.

---

## Architecture Overview

```
+-------------------------------------------------------------+
|               Modern Banking Web Dashboard                  |
|  (Customer Portal | Staff Teller Desk | Executive Admin)    |
+-------------------------------------------------------------+
                              |
                     REST API / JSON
                              |
+-------------------------------------------------------------+
|                     Local Node.js Bridge                    |
|      (Zero dependencies, executes native C++ binary)       |
+-------------------------------------------------------------+
                              |
                       CLI JSON Bridge
                              |
+-------------------------------------------------------------+
|                    Native C++ Core Engine                   |
|  - Binary Search Tree (AccountBST & AccountNode)            |
|  - Separate Chaining Hash Table (AuthTable & BucketNode)    |
|  - Transaction Audit Logger (FileUtils)                    |
|  - Persistent File Storage (data/accounts.txt, etc.)        |
+-------------------------------------------------------------+
```

---

## How to Run

### 1. Modern Graphical Banking Dashboard (Recommended)
Double-click or run from PowerShell:
```powershell
.\run_gui.bat
```
Or with Node:
```powershell
node server.js
```
Then visit **`http://localhost:3000`** in your browser.

- **Demo Login:** Click any of the quick-login demo chips on the login page (e.g. Account `#1001` - **Pradumn Prajapati** with password `Pradumn@123`, Account `#1008` - **Pradumn Prajapati**, `#1002` - Om Tripathi, etc.).
- **Dynamic Profile Management:** Use the "Edit Profile Name" button to change or give names dynamically, synced in real-time with the C++ BST.
- **Staff Portal:** Click the "Staff Desk" tab to manage over-the-counter teller transactions.
- **Admin Portal:** Click the "Administrator" tab to review bank-wide liquidity analytics and manage accounts.

---

### 2. Classic C++ Console Terminal
Run:
```powershell
.\run.bat
```
Or directly from `BankSphere`:
```powershell
cd BankSphere
.\BankSphere.exe
```

---

## Automated Verification
Run the end-to-end integration test suite:
```powershell
node test_suite.js
```
All 11 tests verify real-time C++ BST insertions, searches, deletions, AuthTable password validation, minimum balance checks, and atomic file logs.
