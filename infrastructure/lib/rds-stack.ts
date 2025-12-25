import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { VpcStack } from './vpc-stack';

export interface RdsStackProps extends cdk.StackProps {
  vpcStack: VpcStack;
  // Optional: snapshot identifier to restore from (for migration)
  snapshotIdentifier?: string;
  // Optional: master username (default: nil_admin)
  masterUsername?: string;
  // Optional: create new instance or reference existing
  createNewInstance?: boolean;
}

export class RdsStack extends cdk.Stack {
  public readonly database: rds.IDatabaseInstance;
  public readonly databaseEndpoint: string;
  public readonly databasePort: number;
  public readonly databaseName: string;
  public readonly databaseSecret: secretsmanager.ISecret;

  constructor(scope: Construct, id: string, props: RdsStackProps) {
    super(scope, id, props);

    const { 
      vpcStack, 
      snapshotIdentifier,
      masterUsername = 'nil_admin',
      createNewInstance = true,
    } = props;

    let databaseSecret: secretsmanager.ISecret;

    if (createNewInstance) {
      // Create database secret for new instance
      databaseSecret = new secretsmanager.Secret(this, 'DatabaseSecret', {
        description: 'RDS PostgreSQL master credentials',
        generateSecretString: {
          secretStringTemplate: JSON.stringify({ username: masterUsername }),
          generateStringKey: 'password',
          excludeCharacters: '"@/\\',
          includeSpace: false,
          passwordLength: 32,
        },
      });
      // Create new CDK-managed RDS instance in new VPC
      const subnetGroup = new rds.SubnetGroup(this, 'DatabaseSubnetGroup', {
        vpc: vpcStack.vpc,
        description: 'Subnet group for RDS PostgreSQL database',
        vpcSubnets: {
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
      });

      // Create parameter group for PostgreSQL
      const parameterGroup = new rds.ParameterGroup(this, 'DatabaseParameterGroup', {
        engine: rds.DatabaseInstanceEngine.postgres({
          version: rds.PostgresEngineVersion.VER_15,
        }),
        description: 'Parameter group for SSG PostgreSQL database',
      });

      // Create the RDS instance
      this.database = new rds.DatabaseInstance(this, 'Database', {
        engine: rds.DatabaseInstanceEngine.postgres({
          version: rds.PostgresEngineVersion.VER_15,
        }),
        instanceType: ec2.InstanceType.of(
          ec2.InstanceClass.T4G,
          ec2.InstanceSize.MICRO
        ),
        vpc: vpcStack.vpc,
        vpcSubnets: {
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
        subnetGroup: subnetGroup,
        securityGroups: [vpcStack.rdsSecurityGroup],
        databaseName: 'nil_db',
        credentials: rds.Credentials.fromSecret(databaseSecret, masterUsername),
        parameterGroup: parameterGroup,
        removalPolicy: cdk.RemovalPolicy.SNAPSHOT, // Keep snapshot when deleting
        deletionProtection: false, // Set to true in production
        backupRetention: cdk.Duration.days(1), // 7 days of backups
        preferredBackupWindow: '03:00-04:00', // UTC
        preferredMaintenanceWindow: 'sun:04:00-sun:05:00', // UTC
        storageEncrypted: true,
        multiAz: false, // Single AZ for Phase 1 (cost optimization)
        autoMinorVersionUpgrade: true,
        // If snapshot provided, restore from it
        ...(snapshotIdentifier && { snapshotIdentifier }),
      });

      this.databaseEndpoint = this.database.instanceEndpoint.hostname;
      this.databasePort = this.database.instanceEndpoint.port;
      this.databaseName = 'nil_db';
      this.databaseSecret = databaseSecret;
    } else {
      // Reference existing RDS instance (for backward compatibility)
      // Note: For full CDK management, use createNewInstance=true
      this.database = rds.DatabaseInstance.fromDatabaseInstanceAttributes(
        this,
        'ExistingDatabase',
        {
          instanceIdentifier: 'nil-database',
          instanceEndpointAddress: 'nil-database.chae2y8a6x43.us-east-2.rds.amazonaws.com',
          port: 5432,
          securityGroups: [vpcStack.rdsSecurityGroup],
        }
      );

      this.databaseEndpoint = this.database.instanceEndpoint.hostname;
      this.databasePort = this.database.instanceEndpoint.port;
      this.databaseName = 'nil_db';
      
      // Reference existing secret or create placeholder
      this.databaseSecret = secretsmanager.Secret.fromSecretNameV2(
        this,
        'ExistingDatabaseSecret',
        'rds-db-credentials/nil-database'
      );
    }

    // Stack Outputs
    new cdk.CfnOutput(this, 'DatabaseEndpoint', {
      value: this.databaseEndpoint,
      description: 'RDS PostgreSQL endpoint',
      exportName: 'SSG-DatabaseEndpoint',
    });

    new cdk.CfnOutput(this, 'DatabasePort', {
      value: this.databasePort.toString(),
      description: 'RDS PostgreSQL port',
      exportName: 'SSG-DatabasePort',
    });

    new cdk.CfnOutput(this, 'DatabaseName', {
      value: this.databaseName,
      description: 'RDS PostgreSQL database name',
      exportName: 'SSG-DatabaseName',
    });

    new cdk.CfnOutput(this, 'DatabaseSecretArn', {
      value: this.databaseSecret.secretArn,
      description: 'ARN of the database secret (contains username and password)',
      exportName: 'SSG-DatabaseSecretArn',
    });

    if (createNewInstance) {
      new cdk.CfnOutput(this, 'DatabaseInstanceId', {
        value: this.database.instanceIdentifier,
        description: 'RDS instance identifier',
        exportName: 'SSG-DatabaseInstanceId',
      });
    }
  }
}

