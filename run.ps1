Set-Location "$PSScriptRoot\BankSphere"
if (-not (Test-Path "BankSphere.exe")) {
    Write-Host "Compiling BankSphere..."
    g++ -std=c++17 (Get-ChildItem -Recurse -Filter *.cpp).FullName -Iinclude -o BankSphere.exe
}
.\BankSphere.exe
