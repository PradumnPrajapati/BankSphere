#include "../../include/bst/AccountNode.h"

AccountNode::AccountNode()
    : accountNumber(0),
      passwordHash(0),
      balance(0),
      accountType("Savings"),
      isActive(true),
      left(nullptr),
      right(nullptr) {}

AccountNode::AccountNode(const std::string &name,
                         const std::string &address,
                         int accountNumber,
                         std::size_t passwordHash,
                         double balance)
    : name(name),
      address(address),
      accountNumber(accountNumber),
      passwordHash(passwordHash),
      balance(balance),
      accountType("Savings"),
      isActive(true),
      left(nullptr),
      right(nullptr) {}
