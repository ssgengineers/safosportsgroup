#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { VpcStack } from '../lib/vpc-stack';
import { RdsStack } from '../lib/rds-stack';

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
new RdsStack(app, 'SSGRdsStack', {
  env,
  vpcStack,
});
