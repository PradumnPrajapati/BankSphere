#pragma once
#include <string>

namespace FileUtils {
    const std::string ACCOUNT_FILE = "data/accounts.txt";
    const std::string CREDENTIAL_FILE = "data/credentials.txt";

    void logTransaction(int accountNumber, const std::string& message);
}
