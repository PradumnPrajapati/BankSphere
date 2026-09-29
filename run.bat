@echo off
cd /d "%~dp0BankSphere"
if not exist "BankSphere.exe" (
    echo Compiling BankSphere...
    g++ -std=c++17 src/main.cpp src/bst/*.cpp src/hashtable/*.cpp src/modules/*.cpp src/utils/*.cpp -Iinclude -o BankSphere.exe
)
BankSphere.exe
