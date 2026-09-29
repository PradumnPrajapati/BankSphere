@echo off
setlocal
echo ========================================================
echo   Starting Bank Sphere Modern Banking System
echo   Native C++ Binary Search Tree & Hash Table Core
echo ========================================================

cd /d "%~dp0"

REM Verify/Compile C++ Bridge if not present
if not exist "BankSphere\BankSphereBridge.exe" (
    echo [BankSphere] Compiling C++ Bridge binary...
    cd BankSphere
    g++ -std=c++17 src/api_bridge.cpp src/bst/AccountBST.cpp src/bst/AccountNode.cpp src/hashtable/AuthTable.cpp src/hashtable/BucketNode.cpp src/hashtable/CredentialNode.cpp src/utils/FileUtils.cpp -Iinclude -o BankSphereBridge.exe
    cd ..
)

echo [BankSphere] Launching local bridge server on port 3000...
start "" "http://localhost:3000"
node server.js
