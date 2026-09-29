#include "../../include/utils/FileUtils.h"

#include <fstream>
#include <iostream>
#include <ctime>
#include <iomanip>

void FileUtils::logTransaction(
    int accountNumber,
    const std::string& message
) {
    std::string path =
        "./data/transactions/" +
        std::to_string(accountNumber) +
        ".txt";

    std::ofstream file(path, std::ios::app);

    if (!file.is_open()) {
        std::cout << "Failed to open transaction file.\n";
        return;
    }

    std::time_t now = std::time(nullptr);

    file << "[" 
         << std::put_time(std::localtime(&now), "%Y-%m-%d %H:%M:%S")
         << "] "
         << message
         << "\n";

    file.close();
}