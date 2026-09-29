#include "../../include/hashtable/AuthTable.h"
#include "../../include/utils/FileUtils.h"
#include <fstream>
#include <functional>

AuthTable::AuthTable() : start(nullptr) {
    BucketNode* current = nullptr;

    for (int i = 0; i < BUCKET_COUNT; i++) {
        BucketNode* bucket = new BucketNode(i);

        if (!start) {
            start = bucket;
            current = bucket;
        } else {
            current->next = bucket;
            current = current->next;
        }
    }

    loadCredentials();
}

AuthTable::~AuthTable() {
    clear();
}

void AuthTable::clear() {
    BucketNode* bucket = start;

    while (bucket) {
        CredentialNode* current = bucket->head;

        while (current) {
            CredentialNode* temp = current;
            current = current->next;
            delete temp;
        }

        BucketNode* tempBucket = bucket;
        bucket = bucket->next;
        delete tempBucket;
    }

    start = nullptr;
}

std::size_t AuthTable::hashPassword(const std::string& password) {
    std::string salted = "FinTrack@" + password;
    return std::hash<std::string>{}(salted);
}

void AuthTable::saveCredential(int accountNumber, std::size_t passwordHash) {
    std::ofstream file(FileUtils::CREDENTIAL_FILE, std::ios::app);
    file << accountNumber << "|" << passwordHash << "\n";
}

bool AuthTable::addCredential(int accountNumber, const std::string& password) {
    std::size_t hashed = hashPassword(password);

    int index = accountNumber % BUCKET_COUNT;

    BucketNode* bucket = start;

    while (bucket && bucket->bucketId != index) {
        bucket = bucket->next;
    }

    if (!bucket) {
        return false;
    }

    CredentialNode* current = bucket->head;

    while (current) {
        if (current->accountNumber == accountNumber) {
            return false;
        }
        current = current->next;
    }

    CredentialNode* node = new CredentialNode(accountNumber, hashed);
    node->next = bucket->head;
    bucket->head = node;

    saveCredential(accountNumber, hashed);
    return true;
}

void AuthTable::loadCredentials() {
    std::ifstream file(FileUtils::CREDENTIAL_FILE);

    if (!file.is_open()) {
        return;
    }

    int accountNumber;
    std::size_t passwordHash;
    char delimiter;

    while (file >> accountNumber >> delimiter >> passwordHash) {
        int index = accountNumber % BUCKET_COUNT;

        BucketNode* bucket = start;

        while (bucket && bucket->bucketId != index) {
            bucket = bucket->next;
        }

        if (!bucket) {
            continue;
        }

        CredentialNode* node = new CredentialNode(accountNumber, passwordHash);
        node->next = bucket->head;
        bucket->head = node;
    }
}

bool AuthTable::validate(int accountNumber, const std::string& password) {
    int index = accountNumber % BUCKET_COUNT;

    BucketNode* bucket = start;

    while (bucket && bucket->bucketId != index) {
        bucket = bucket->next;
    }

    if (!bucket) {
        return false;
    }

    std::size_t hashed = hashPassword(password);

    CredentialNode* current = bucket->head;

    while (current) {
        if (current->accountNumber == accountNumber &&
            current->passwordHash == hashed) {
            return true;
        }

        current = current->next;
    }

    return false;
}

bool AuthTable::removeCredential(int accountNumber) {
    int index = accountNumber % BUCKET_COUNT;

    BucketNode* bucket = start;

    while (bucket && bucket->bucketId != index) {
        bucket = bucket->next;
    }

    if (!bucket) {
        return false;
    }

    CredentialNode* current = bucket->head;
    CredentialNode* previous = nullptr;

    while (current) {
        if (current->accountNumber == accountNumber) {
            if (previous) {
                previous->next = current->next;
            } else {
                bucket->head = current->next;
            }

            delete current;
            return true;
        }

        previous = current;
        current = current->next;
    }

    return false;
}
