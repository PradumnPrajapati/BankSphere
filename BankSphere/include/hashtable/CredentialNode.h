#pragma once
#include <cstddef>

class CredentialNode {
public:
    int accountNumber;
    std::size_t passwordHash;
    CredentialNode* next;

    CredentialNode(int accountNumber, std::size_t passwordHash);
};
