#include "../../include/hashtable/BucketNode.h"

BucketNode::BucketNode(int bucketId)
    : bucketId(bucketId),
      head(nullptr),
      next(nullptr) {}
