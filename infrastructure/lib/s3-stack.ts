import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export interface S3StackProps extends cdk.StackProps {
  // No dependencies for Phase 1
}

export class S3Stack extends cdk.Stack {
  public readonly mediaBucket: s3.Bucket;
  public readonly mediaBucketName: string;

  constructor(scope: Construct, id: string, props?: S3StackProps) {
    super(scope, id, props);

    // Create S3 bucket for media storage (athlete photos, brand logos, campaign assets)
    this.mediaBucket = new s3.Bucket(this, 'MediaBucket', {
      bucketName: `ssg-media-${this.account}-${this.region}`,
      versioned: true, // Enable versioning for backup and recovery
      encryption: s3.BucketEncryption.S3_MANAGED, // Server-side encryption
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL, // Block all public access by default
      removalPolicy: cdk.RemovalPolicy.RETAIN, // Retain bucket on stack deletion
      autoDeleteObjects: false, // Don't auto-delete objects (safer)
      cors: [
        {
          allowedOrigins: ['*'], // Configure based on your frontend domain in Phase 2
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT, s3.HttpMethods.POST, s3.HttpMethods.DELETE],
          allowedHeaders: ['*'],
          exposedHeaders: ['ETag'],
          maxAge: 3000,
        },
      ],
      lifecycleRules: [
        {
          id: 'TransitionToIA',
          enabled: true,
          transitions: [
            {
              storageClass: s3.StorageClass.INFREQUENT_ACCESS,
              transitionAfter: cdk.Duration.days(90), // Move to IA after 90 days
            },
          ],
        },
        {
          id: 'TransitionToGlacier',
          enabled: true,
          transitions: [
            {
              storageClass: s3.StorageClass.GLACIER,
              transitionAfter: cdk.Duration.days(365), // Move to Glacier after 1 year
            },
          ],
        },
        {
          id: 'DeleteOldVersions',
          enabled: true,
          noncurrentVersionExpiration: cdk.Duration.days(30), // Delete old versions after 30 days
        },
      ],
      // Enable server access logging (optional, can add logging bucket in Phase 2)
      // serverAccessLogsBucket: loggingBucket,
      // serverAccessLogsPrefix: 'media-access-logs/',
    });

    this.mediaBucketName = this.mediaBucket.bucketName;

    // Stack Outputs
    new cdk.CfnOutput(this, 'MediaBucketName', {
      value: this.mediaBucketName,
      description: 'S3 bucket name for media storage',
      exportName: 'SSG-MediaBucketName',
    });

    new cdk.CfnOutput(this, 'MediaBucketArn', {
      value: this.mediaBucket.bucketArn,
      description: 'S3 bucket ARN for media storage',
      exportName: 'SSG-MediaBucketArn',
    });

    new cdk.CfnOutput(this, 'MediaBucketDomainName', {
      value: this.mediaBucket.bucketDomainName,
      description: 'S3 bucket domain name',
      exportName: 'SSG-MediaBucketDomainName',
    });
  }
}

