#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { VpcStack } from '../lib/vpc-stack';
import { RdsStack } from '../lib/rds-stack';
import { EcrStack } from '../lib/ecr-stack';
import { EcsStack } from '../lib/ecs-stack';
import { CacheStack } from '../lib/cache-stack';
import { S3Stack } from '../lib/s3-stack';
import { MonitoringStack } from '../lib/monitoring-stack';

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: 'us-east-2',
};

// Phase 2: VPC Stack
const vpcStack = new VpcStack(app, 'SSGVpcStack', {
  env,
});

// Phase 3: RDS Stack (depends on VPC Stack)
const rdsStack = new RdsStack(app, 'SSGRdsStack', {
  env,
  vpcStack,
});

// Phase 4: ECR Stack (container registry)
const ecrStack = new EcrStack(app, 'SSGEcrStack', {
  env,
});

// Phase 6: ElastiCache Stack (depends on VPC Stack)
const cacheStack = new CacheStack(app, 'SSGCacheStack', {
  env,
  vpcStack,
});

// Phase 7: S3 Stack (media storage)
const s3Stack = new S3Stack(app, 'SSGS3Stack', {
  env,
});

// Phase 5: ECS Stack (depends on VPC, RDS, ECR, S3, and Cache stacks)
// Note: Moved after S3 and Cache stacks to ensure dependencies are available
const ecsStack = new EcsStack(app, 'SSGEcsStack', {
  env,
  vpcStack,
  rdsStack,
  ecrStack,
  s3Stack,
  cacheStack,
});

// Phase 8: Monitoring Stack (depends on RDS, ECS, and Cache stacks)
new MonitoringStack(app, 'SSGMonitoringStack', {
  env,
  rdsStack,
  ecsStack,
  cacheStack,
});
