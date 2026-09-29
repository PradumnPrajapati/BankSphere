#pragma once
#include "CredentialNode.h"

class BucketNode {
public:
    int bucketId;
    CredentialNode* head;
    BucketNode* next;

    BucketNode(int bucketId);
};
