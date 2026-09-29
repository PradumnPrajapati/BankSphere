#pragma once
#include "BucketNode.h"
#include <string>

class AuthTable {
private:
    static const int BUCKET_COUNT = 13;
    BucketNode* start;

    std::size_t hashPassword(const std::string& password);

public:
    AuthTable();
    ~AuthTable();

    void clear();

    void loadCredentials();

    bool addCredential(int accountNumber, const std::string& password);

    bool validate(int accountNumber, const std::string& password);

    bool removeCredential(int accountNumber);

    void saveCredential(int accountNumber, std::size_t passwordHash);
};
