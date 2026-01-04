import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elasticache from 'aws-cdk-lib/aws-elasticache';
import { Construct } from 'constructs';
import { VpcStack } from './vpc-stack';

export interface CacheStackProps extends cdk.StackProps {
  vpcStack: VpcStack;
}

export class CacheStack extends cdk.Stack {
  public readonly redisCluster: elasticache.CfnReplicationGroup;
  public readonly redisEndpoint: string;
  public readonly redisPort: number;

  constructor(scope: Construct, id: string, props: CacheStackProps) {
    super(scope, id, props);

    const { vpcStack } = props;

    // Create subnet group for ElastiCache in private subnets
    const subnetGroup = new elasticache.CfnSubnetGroup(this, 'SubnetGroup', {
      description: 'Subnet group for ElastiCache Redis',
      subnetIds: vpcStack.privateSubnets.map(subnet => subnet.subnetId),
    });

    // Create parameter group for Redis
    const parameterGroup = new elasticache.CfnParameterGroup(this, 'ParameterGroup', {
      cacheParameterGroupFamily: 'redis7',
      description: 'Parameter group for SSG Redis cluster',
      properties: {
        'maxmemory-policy': 'allkeys-lru', // Evict least recently used keys when memory is full
      },
    });

    // Create Redis replication group (cluster mode disabled for Phase 1)
    this.redisCluster = new elasticache.CfnReplicationGroup(this, 'RedisCluster', {
      replicationGroupId: 'ssg-redis-cluster',
      replicationGroupDescription: 'Redis cluster for SSG application caching',
      engine: 'redis',
      cacheNodeType: 'cache.t3.micro', // Smallest instance for Phase 1
      numCacheClusters: 1, // Single node for Phase 1 (no replication)
      automaticFailoverEnabled: false, // Enable in Phase 2 for high availability
      multiAzEnabled: false, // Single AZ for Phase 1 cost optimization
      cacheSubnetGroupName: subnetGroup.ref,
      securityGroupIds: [vpcStack.cacheSecurityGroup.securityGroupId],
      cacheParameterGroupName: parameterGroup.ref,
      port: 6379,
      atRestEncryptionEnabled: true, // Encrypt data at rest
      transitEncryptionEnabled: false, // Disable for Phase 1 (can enable in Phase 2)
      snapshotRetentionLimit: 1, // Keep 1 snapshot
      snapshotWindow: '03:00-05:00', // UTC
    });

    // Get endpoint and port
    // For single node, use primary endpoint; for cluster mode, use configuration endpoint
    const primaryEndpoint = this.redisCluster.attrPrimaryEndPointAddress;
    const configEndpoint = this.redisCluster.attrConfigurationEndPointAddress;
    this.redisEndpoint = primaryEndpoint || configEndpoint || 'pending';
    this.redisPort = 6379;

    // Stack Outputs
    new cdk.CfnOutput(this, 'RedisEndpoint', {
      value: this.redisEndpoint,
      description: 'ElastiCache Redis endpoint',
      exportName: 'SSG-RedisEndpoint',
    });

    new cdk.CfnOutput(this, 'RedisPort', {
      value: this.redisPort.toString(),
      description: 'ElastiCache Redis port',
      exportName: 'SSG-RedisPort',
    });

    new cdk.CfnOutput(this, 'RedisClusterId', {
      value: this.redisCluster.replicationGroupId || 'ssg-redis-cluster',
      description: 'ElastiCache Redis replication group ID',
      exportName: 'SSG-RedisClusterId',
    });
  }
}

