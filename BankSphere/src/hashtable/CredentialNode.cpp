#include "../../include/hashtable/CredentialNode.h"

CredentialNode::CredentialNode(int accountNumber, std::size_t passwordHash)
    : accountNumber(accountNumber),
      passwordHash(passwordHash),
      next(nullptr) {}
