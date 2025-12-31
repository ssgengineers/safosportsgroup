import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as cloudwatchActions from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as snsSubscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import { Construct } from 'constructs';
import { RdsStack } from './rds-stack';
import { EcsStack } from './ecs-stack';
import { CacheStack } from './cache-stack';

export interface MonitoringStackProps extends cdk.StackProps {
  rdsStack: RdsStack;
  ecsStack: EcsStack;
  cacheStack: CacheStack;
}

export class MonitoringStack extends cdk.Stack {
  public readonly alarmTopic: sns.Topic;

  constructor(scope: Construct, id: string, props: MonitoringStackProps) {
    super(scope, id, props);

    const { rdsStack, ecsStack, cacheStack } = props;

    // Create SNS topic for alarms
    this.alarmTopic = new sns.Topic(this, 'AlarmTopic', {
      topicName: 'ssg-infrastructure-alarms',
      displayName: 'SSG Infrastructure Alarms',
    });

    // Add email subscription (replace with your email in Phase 2)
    // this.alarmTopic.addSubscription(
    //   new snsSubscriptions.EmailSubscription('your-email@example.com')
    // );

    // ============================================
    // RDS Alarms
    // ============================================

    // RDS CPU Utilization Alarm
    const rdsCpuAlarm = new cloudwatch.Alarm(this, 'RdsCpuAlarm', {
      alarmName: 'ssg-rds-cpu-utilization',
      alarmDescription: 'Alert when RDS CPU utilization exceeds 80%',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/RDS',
        metricName: 'CPUUtilization',
        dimensionsMap: {
          DBInstanceIdentifier: rdsStack.database.instanceIdentifier,
        },
        statistic: 'Average',
        period: cdk.Duration.minutes(5),
      }),
      threshold: 80,
      evaluationPeriods: 2,
      datapointsToAlarm: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
    });
    rdsCpuAlarm.addAlarmAction(new cloudwatchActions.SnsAction(this.alarmTopic));

    // RDS Database Connections Alarm
    const rdsConnectionsAlarm = new cloudwatch.Alarm(this, 'RdsConnectionsAlarm', {
      alarmName: 'ssg-rds-connections',
      alarmDescription: 'Alert when RDS connection count exceeds 80% of max',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/RDS',
        metricName: 'DatabaseConnections',
        dimensionsMap: {
          DBInstanceIdentifier: rdsStack.database.instanceIdentifier,
        },
        statistic: 'Average',
        period: cdk.Duration.minutes(5),
      }),
      threshold: 80, // Adjust based on your max connections
      evaluationPeriods: 2,
      datapointsToAlarm: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
    });
    rdsConnectionsAlarm.addAlarmAction(new cloudwatchActions.SnsAction(this.alarmTopic));

    // RDS Free Storage Space Alarm
    const rdsStorageAlarm = new cloudwatch.Alarm(this, 'RdsStorageAlarm', {
      alarmName: 'ssg-rds-free-storage',
      alarmDescription: 'Alert when RDS free storage space is below 2GB',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/RDS',
        metricName: 'FreeStorageSpace',
        dimensionsMap: {
          DBInstanceIdentifier: rdsStack.database.instanceIdentifier,
        },
        statistic: 'Minimum',
        period: cdk.Duration.minutes(5),
      }),
      threshold: 2 * 1024 * 1024 * 1024, // 2GB in bytes
      evaluationPeriods: 1,
      datapointsToAlarm: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.LESS_THAN_THRESHOLD,
    });
    rdsStorageAlarm.addAlarmAction(new cloudwatchActions.SnsAction(this.alarmTopic));

    // ============================================
    // ECS Alarms
    // ============================================

    // ECS CPU Utilization Alarm
    const ecsCpuAlarm = new cloudwatch.Alarm(this, 'EcsCpuAlarm', {
      alarmName: 'ssg-ecs-cpu-utilization',
      alarmDescription: 'Alert when ECS service CPU utilization exceeds 80%',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/ECS',
        metricName: 'CPUUtilization',
        dimensionsMap: {
          ServiceName: ecsStack.service.serviceName,
          ClusterName: ecsStack.cluster.clusterName,
        },
        statistic: 'Average',
        period: cdk.Duration.minutes(5),
      }),
      threshold: 80,
      evaluationPeriods: 2,
      datapointsToAlarm: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
    });
    ecsCpuAlarm.addAlarmAction(new cloudwatchActions.SnsAction(this.alarmTopic));

    // ECS Memory Utilization Alarm
    const ecsMemoryAlarm = new cloudwatch.Alarm(this, 'EcsMemoryAlarm', {
      alarmName: 'ssg-ecs-memory-utilization',
      alarmDescription: 'Alert when ECS service memory utilization exceeds 85%',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/ECS',
        metricName: 'MemoryUtilization',
        dimensionsMap: {
          ServiceName: ecsStack.service.serviceName,
          ClusterName: ecsStack.cluster.clusterName,
        },
        statistic: 'Average',
        period: cdk.Duration.minutes(5),
      }),
      threshold: 85,
      evaluationPeriods: 2,
      datapointsToAlarm: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
    });
    ecsMemoryAlarm.addAlarmAction(new cloudwatchActions.SnsAction(this.alarmTopic));

    // ECS Running Task Count Alarm
    const ecsTaskCountAlarm = new cloudwatch.Alarm(this, 'EcsTaskCountAlarm', {
      alarmName: 'ssg-ecs-running-tasks',
      alarmDescription: 'Alert when ECS running task count is below minimum',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/ECS',
        metricName: 'RunningTaskCount',
        dimensionsMap: {
          ServiceName: ecsStack.service.serviceName,
          ClusterName: ecsStack.cluster.clusterName,
        },
        statistic: 'Average',
        period: cdk.Duration.minutes(1),
      }),
      threshold: 1, // Alert if less than 1 task running
      evaluationPeriods: 1,
      datapointsToAlarm: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.LESS_THAN_THRESHOLD,
    });
    ecsTaskCountAlarm.addAlarmAction(new cloudwatchActions.SnsAction(this.alarmTopic));

    // ============================================
    // ElastiCache Alarms
    // ============================================

    // ElastiCache CPU Utilization Alarm
    const cacheCpuAlarm = new cloudwatch.Alarm(this, 'CacheCpuAlarm', {
      alarmName: 'ssg-cache-cpu-utilization',
      alarmDescription: 'Alert when ElastiCache CPU utilization exceeds 80%',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/ElastiCache',
        metricName: 'CPUUtilization',
        dimensionsMap: {
          ReplicationGroupId: cacheStack.redisCluster.replicationGroupId || 'ssg-redis-cluster',
        },
        statistic: 'Average',
        period: cdk.Duration.minutes(5),
      }),
      threshold: 80,
      evaluationPeriods: 2,
      datapointsToAlarm: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
    });
    cacheCpuAlarm.addAlarmAction(new cloudwatchActions.SnsAction(this.alarmTopic));

    // ElastiCache Memory Utilization Alarm
    const cacheMemoryAlarm = new cloudwatch.Alarm(this, 'CacheMemoryAlarm', {
      alarmName: 'ssg-cache-memory-utilization',
      alarmDescription: 'Alert when ElastiCache memory utilization exceeds 85%',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/ElastiCache',
        metricName: 'DatabaseMemoryUsagePercentage',
        dimensionsMap: {
          ReplicationGroupId: cacheStack.redisCluster.replicationGroupId || 'ssg-redis-cluster',
        },
        statistic: 'Average',
        period: cdk.Duration.minutes(5),
      }),
      threshold: 85,
      evaluationPeriods: 2,
      datapointsToAlarm: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
    });
    cacheMemoryAlarm.addAlarmAction(new cloudwatchActions.SnsAction(this.alarmTopic));

    // ============================================
    // Application Load Balancer Alarms
    // ============================================

    // ALB Target Response Time Alarm
    // Note: LoadBalancer dimension requires full name (app/name/id)
    // We'll use the load balancer ARN to construct the full name
    const albFullName = cdk.Fn.select(1, cdk.Fn.split('/', ecsStack.loadBalancer.loadBalancerArn));
    const albResponseTimeAlarm = new cloudwatch.Alarm(this, 'AlbResponseTimeAlarm', {
      alarmName: 'ssg-alb-response-time',
      alarmDescription: 'Alert when ALB target response time exceeds 1 second',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/ApplicationELB',
        metricName: 'TargetResponseTime',
        dimensionsMap: {
          LoadBalancer: albFullName,
        },
        statistic: 'Average',
        period: cdk.Duration.minutes(5),
      }),
      threshold: 1, // 1 second
      evaluationPeriods: 2,
      datapointsToAlarm: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
    });
    albResponseTimeAlarm.addAlarmAction(new cloudwatchActions.SnsAction(this.alarmTopic));

    // ALB HTTP 5xx Error Rate Alarm
    const alb5xxAlarm = new cloudwatch.Alarm(this, 'Alb5xxAlarm', {
      alarmName: 'ssg-alb-5xx-errors',
      alarmDescription: 'Alert when ALB HTTP 5xx error rate exceeds threshold',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/ApplicationELB',
        metricName: 'HTTPCode_Target_5XX_Count',
        dimensionsMap: {
          LoadBalancer: albFullName,
        },
        statistic: 'Sum',
        period: cdk.Duration.minutes(5),
      }),
      threshold: 10, // 10 errors in 5 minutes
      evaluationPeriods: 1,
      datapointsToAlarm: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
    });
    alb5xxAlarm.addAlarmAction(new cloudwatchActions.SnsAction(this.alarmTopic));

    // ============================================
    // Stack Outputs
    // ============================================

    new cdk.CfnOutput(this, 'AlarmTopicArn', {
      value: this.alarmTopic.topicArn,
      description: 'SNS topic ARN for CloudWatch alarms',
      exportName: 'SSG-AlarmTopicArn',
    });

    new cdk.CfnOutput(this, 'AlarmTopicName', {
      value: this.alarmTopic.topicName,
      description: 'SNS topic name for CloudWatch alarms',
      exportName: 'SSG-AlarmTopicName',
    });
  }
}

