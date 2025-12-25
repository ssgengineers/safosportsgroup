import * as cdk from 'aws-cdk-lib';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import { Construct } from 'constructs';

export interface EcrStackProps extends cdk.StackProps {
  // No additional props needed for Phase 1
}

export class EcrStack extends cdk.Stack {
  public readonly repository: ecr.Repository;
  public readonly repositoryUri: string;

  constructor(scope: Construct, id: string, props?: EcrStackProps) {
    super(scope, id, props);

    // Create ECR repository for Spring Boot application
    this.repository = new ecr.Repository(this, 'SpringBootRepository', {
      repositoryName: 'ssg-spring-boot-api',
      imageTagMutability: ecr.TagMutability.MUTABLE, // Allow overwriting tags
      imageScanOnPush: true, // Enable automatic image scanning
      encryption: ecr.RepositoryEncryption.AES_256, // Encrypt images at rest
      lifecycleRules: [
        {
          // Remove untagged images older than 1 day (higher priority)
          description: 'Remove untagged images older than 1 day',
          maxImageAge: cdk.Duration.days(1),
          tagStatus: ecr.TagStatus.UNTAGGED,
        },
        {
          // Keep only the last 10 images to save storage costs (ANY rule must be last/highest priority)
          description: 'Keep last 10 images',
          maxImageCount: 10,
          tagStatus: ecr.TagStatus.ANY,
        },
      ],
    });

    this.repositoryUri = this.repository.repositoryUri;

    // Stack Outputs
    new cdk.CfnOutput(this, 'RepositoryUri', {
      value: this.repositoryUri,
      description: 'ECR repository URI for pushing/pulling images',
      exportName: 'SSG-ECR-RepositoryUri',
    });

    new cdk.CfnOutput(this, 'RepositoryName', {
      value: this.repository.repositoryName,
      description: 'ECR repository name',
      exportName: 'SSG-ECR-RepositoryName',
    });

    new cdk.CfnOutput(this, 'RepositoryArn', {
      value: this.repository.repositoryArn,
      description: 'ECR repository ARN',
      exportName: 'SSG-ECR-RepositoryArn',
    });
  }
}

