#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { VpcStack } from '../lib/vpc-stack';
import { RdsStack } from '../lib/rds-stack';
import { EcrStack } from '../lib/ecr-stack';
import { EcsStack } from '../lib/ecs-stack';

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

// Phase 5: ECS Stack (depends on VPC, RDS, and ECR stacks)
new EcsStack(app, 'SSGEcsStack', {
  env,
  vpcStack,
  rdsStack,
  ecrStack,
});
