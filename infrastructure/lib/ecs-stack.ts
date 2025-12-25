import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { VpcStack } from './vpc-stack';
import { RdsStack } from './rds-stack';
import { EcrStack } from './ecr-stack';

export interface EcsStackProps extends cdk.StackProps {
  vpcStack: VpcStack;
  rdsStack: RdsStack;
  ecrStack: EcrStack;
}

export class EcsStack extends cdk.Stack {
  public readonly cluster: ecs.Cluster;
  public readonly service: ecs.FargateService;
  public readonly loadBalancer: elbv2.ApplicationLoadBalancer;
  public readonly loadBalancerDns: string;

  constructor(scope: Construct, id: string, props: EcsStackProps) {
    super(scope, id, props);

    const { vpcStack, rdsStack, ecrStack } = props;

    // Create ECS Cluster
    this.cluster = new ecs.Cluster(this, 'Cluster', {
      vpc: vpcStack.vpc,
      clusterName: 'ssg-cluster',
      enableFargateCapacityProviders: true,
      // Note: Container Insights can be enabled via CloudWatch console or CLI
      // aws ecs update-cluster --cluster ssg-cluster --settings name=containerInsights,value=enabled
    });

    // Create CloudWatch Log Group
    const logGroup = new logs.LogGroup(this, 'LogGroup', {
      logGroupName: '/ecs/ssg-spring-boot-api',
      retention: logs.RetentionDays.ONE_WEEK, // Keep logs for 7 days
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Task Execution Role (for pulling images, writing logs, accessing secrets)
    const taskExecutionRole = new iam.Role(this, 'TaskExecutionRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy'),
      ],
    });

    // Grant access to Secrets Manager
    rdsStack.databaseSecret.grantRead(taskExecutionRole);

    // Grant access to ECR
    ecrStack.repository.grantPull(taskExecutionRole);

    // Task Role (for application permissions - S3, etc.)
    const taskRole = new iam.Role(this, 'TaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      description: 'Role for ECS task to access AWS services',
    });

    // Create Task Definition
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDefinition', {
      memoryLimitMiB: 4096, // 4GB
      cpu: 2048, // 2 vCPU
      executionRole: taskExecutionRole,
      taskRole: taskRole,
    });

    // Add container to task definition
    const container = taskDefinition.addContainer('SpringBootContainer', {
      image: ecs.ContainerImage.fromEcrRepository(
        ecrStack.repository,
        'latest' // Use 'latest' tag initially, can be updated
      ),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'ssg-api',
        logGroup: logGroup,
      }),
      environment: {
        SPRING_PROFILES_ACTIVE: 'prod',
        SERVER_PORT: '8080',
        DB_HOST: rdsStack.databaseEndpoint,
        DB_PORT: rdsStack.databasePort.toString(),
        DB_NAME: rdsStack.databaseName,
        DB_USERNAME: 'nil_admin',
      },
      secrets: {
        DB_PASSWORD: ecs.Secret.fromSecretsManager(
          rdsStack.databaseSecret,
          'password'
        ),
      },
      healthCheck: {
        command: [
          'CMD-SHELL',
          'wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1',
        ],
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        retries: 3,
        startPeriod: cdk.Duration.seconds(60), // Give app time to start
      },
    });

    // Add port mapping
    container.addPortMappings({
      containerPort: 8080,
      protocol: ecs.Protocol.TCP,
    });

    // Create Application Load Balancer
    this.loadBalancer = new elbv2.ApplicationLoadBalancer(this, 'LoadBalancer', {
      vpc: vpcStack.vpc,
      internetFacing: true,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      securityGroup: vpcStack.albSecurityGroup,
    });

    // Create Target Group
    const targetGroup = new elbv2.ApplicationTargetGroup(this, 'TargetGroup', {
      vpc: vpcStack.vpc,
      port: 8080,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.IP,
      healthCheck: {
        path: '/actuator/health',
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 3,
        healthyHttpCodes: '200',
      },
      deregistrationDelay: cdk.Duration.seconds(30),
    });

    // Create HTTP Listener (redirect to HTTPS in Phase 2)
    const httpListener = this.loadBalancer.addListener('HttpListener', {
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
    });

    // Redirect HTTP to HTTPS (for now, just forward to target group)
    // In Phase 2, we'll add HTTPS listener with SSL certificate
    httpListener.addTargetGroups('DefaultTarget', {
      targetGroups: [targetGroup],
    });

    // Create ECS Service
    this.service = new ecs.FargateService(this, 'Service', {
      cluster: this.cluster,
      taskDefinition: taskDefinition,
      desiredCount: 2, // Start with 2 tasks
      assignPublicIp: false, // Tasks in private subnets
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [vpcStack.ecsSecurityGroup],
      healthCheckGracePeriod: cdk.Duration.seconds(60),
      enableExecuteCommand: true, // Enable ECS Exec for debugging
      minHealthyPercent: 100, // Keep all tasks healthy during deployments
      maxHealthyPercent: 200, // Allow up to 2x tasks during deployments
    });

    // Attach service to target group
    this.service.attachToApplicationTargetGroup(targetGroup);

    // Auto Scaling
    const scaling = this.service.autoScaleTaskCount({
      minCapacity: 2,
      maxCapacity: 4,
    });

    // Scale based on CPU
    scaling.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 70,
      scaleInCooldown: cdk.Duration.seconds(60),
      scaleOutCooldown: cdk.Duration.seconds(60),
    });

    // Scale based on memory
    scaling.scaleOnMemoryUtilization('MemoryScaling', {
      targetUtilizationPercent: 80,
      scaleInCooldown: cdk.Duration.seconds(60),
      scaleOutCooldown: cdk.Duration.seconds(60),
    });

    // Get load balancer DNS name
    this.loadBalancerDns = this.loadBalancer.loadBalancerDnsName;

    // Stack Outputs
    new cdk.CfnOutput(this, 'LoadBalancerDns', {
      value: this.loadBalancerDns,
      description: 'Application Load Balancer DNS name',
      exportName: 'SSG-LoadBalancerDns',
    });

    new cdk.CfnOutput(this, 'LoadBalancerUrl', {
      value: `http://${this.loadBalancerDns}`,
      description: 'Application Load Balancer URL',
      exportName: 'SSG-LoadBalancerUrl',
    });

    new cdk.CfnOutput(this, 'ClusterName', {
      value: this.cluster.clusterName,
      description: 'ECS Cluster name',
      exportName: 'SSG-ClusterName',
    });

    new cdk.CfnOutput(this, 'ServiceName', {
      value: this.service.serviceName,
      description: 'ECS Service name',
      exportName: 'SSG-ServiceName',
    });
  }
}

