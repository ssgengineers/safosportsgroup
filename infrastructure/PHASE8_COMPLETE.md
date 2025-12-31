# Phase 8: CloudWatch Monitoring & Observability Stack - Complete ✅

## Overview
Phase 8 adds comprehensive CloudWatch monitoring and alerting infrastructure with alarms for RDS, ECS, ElastiCache, and Application Load Balancer, along with SNS topics for notifications.

## What Was Completed

### 1. Monitoring Stack (`lib/monitoring-stack.ts`)
- ✅ Created `MonitoringStack` class with CloudWatch alarms
- ✅ SNS topic for alarm notifications
- ✅ RDS monitoring alarms (CPU, connections, storage)
- ✅ ECS monitoring alarms (CPU, memory, running tasks)
- ✅ ElastiCache monitoring alarms (CPU, memory)
- ✅ Application Load Balancer alarms (response time, 5xx errors)
- ✅ All alarms configured to send notifications to SNS topic

### 2. Monitoring Coverage

#### RDS Alarms
- **CPU Utilization**: Alert when CPU exceeds 80%
- **Database Connections**: Alert when connections exceed threshold
- **Free Storage Space**: Alert when storage below 2GB

#### ECS Alarms
- **CPU Utilization**: Alert when CPU exceeds 80%
- **Memory Utilization**: Alert when memory exceeds 85%
- **Running Task Count**: Alert when tasks drop below minimum

#### ElastiCache Alarms
- **CPU Utilization**: Alert when CPU exceeds 80%
- **Memory Utilization**: Alert when memory exceeds 85%

#### Application Load Balancer Alarms
- **Target Response Time**: Alert when response time exceeds 1 second
- **HTTP 5xx Errors**: Alert when 5xx error count exceeds threshold

### 3. SNS Integration
- ✅ Created SNS topic for infrastructure alarms
- ✅ All alarms configured to send notifications to SNS
- ✅ Email subscription can be added in Phase 2

### 4. Integration
- ✅ Added `MonitoringStack` to main app
- ✅ Depends on RDS, ECS, and Cache stacks
- ✅ Stack outputs for SNS topic ARN and name

## Stack Outputs

The stack exports the following values:

1. **AlarmTopicArn**: SNS topic ARN for CloudWatch alarms
2. **AlarmTopicName**: SNS topic name for CloudWatch alarms

## Deployment

### Deploy the Monitoring Stack

```bash
cd infrastructure
npx cdk deploy SSGMonitoringStack
```

### Expected Deployment Time
- **Initial deployment**: ~2-3 minutes
- **Updates**: ~1-2 minutes

### Verify Deployment

```bash
# Check stack status
aws cloudformation describe-stacks --stack-name SSGMonitoringStack --query 'Stacks[0].StackStatus'

# Get SNS topic ARN
aws cloudformation describe-stacks --stack-name SSGMonitoringStack \
  --query 'Stacks[0].Outputs[?OutputKey==`AlarmTopicArn`].OutputValue' \
  --output text

# List all alarms
aws cloudwatch describe-alarms --alarm-name-prefix ssg- \
  --query 'MetricAlarms[*].[AlarmName,StateValue]' \
  --output table
```

## Cost Estimate

### Phase 1 (Current)
- **CloudWatch Alarms**: $0.10 per alarm per month (10 alarms = $1/month)
- **SNS**: $0.50 per 1 million requests (minimal for alerts)
- **CloudWatch Metrics**: First 1 million API requests free, then $0.01 per 1,000
- **Estimated Phase 1**: ~$1-5/month

### Phase 2 (Growth)
- **Additional alarms**: $0.10 per alarm
- **SNS subscriptions**: Free (email), $0.50 per 1 million SMS
- **CloudWatch Dashboards**: $3 per dashboard per month
- **Estimated Phase 2**: ~$5-20/month

## Next Steps

### 1. Subscribe to SNS Topic

Add email subscription to receive alerts:

```bash
# Get the topic ARN
TOPIC_ARN=$(aws cloudformation describe-stacks --stack-name SSGMonitoringStack \
  --query 'Stacks[0].Outputs[?OutputKey==`AlarmTopicArn`].OutputValue' \
  --output text)

# Subscribe email (replace with your email)
aws sns subscribe \
  --topic-arn ${TOPIC_ARN} \
  --protocol email \
  --notification-endpoint your-email@example.com
```

You'll receive a confirmation email - click the link to confirm.

### 2. Create CloudWatch Dashboard

Create a custom dashboard for visual monitoring:

```bash
# Create dashboard JSON
cat > dashboard.json <<EOF
{
  "widgets": [
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["AWS/RDS", "CPUUtilization", {"stat": "Average"}],
          ["AWS/ECS", "CPUUtilization", {"stat": "Average"}],
          ["AWS/ElastiCache", "CPUUtilization", {"stat": "Average"}]
        ],
        "period": 300,
        "stat": "Average",
        "region": "us-east-2",
        "title": "CPU Utilization"
      }
    }
  ]
}
EOF

# Create dashboard
aws cloudwatch put-dashboard \
  --dashboard-name SSG-Infrastructure \
  --dashboard-body file://dashboard.json
```

### 3. Set Up PagerDuty Integration (Optional)

For critical alerts, integrate with PagerDuty:

```bash
# Create SNS subscription to PagerDuty HTTP endpoint
aws sns subscribe \
  --topic-arn ${TOPIC_ARN} \
  --protocol https \
  --notification-endpoint https://events.pagerduty.com/integration/YOUR_KEY
```

### 4. Configure Alarm Actions

You can add additional alarm actions:

- **Auto Scaling**: Trigger auto-scaling based on alarms
- **Lambda Functions**: Run automated remediation
- **SQS Queues**: Queue alerts for processing
- **Multiple SNS Topics**: Different topics for different severity levels

### 5. Custom Metrics

Add custom application metrics in Spring Boot:

```java
@Autowired
private CloudWatchAsyncClient cloudWatchClient;

public void recordCustomMetric(String metricName, double value) {
    PutMetricDataRequest request = PutMetricDataRequest.builder()
        .namespace("SSG/Application")
        .metricData(MetricDatum.builder()
            .metricName(metricName)
            .value(value)
            .timestamp(Instant.now())
            .build())
        .build();
    
    cloudWatchClient.putMetricData(request);
}
```

## Alarm Thresholds

### Current Thresholds (Phase 1)

| Alarm | Metric | Threshold | Evaluation Periods |
|-------|--------|-----------|-------------------|
| RDS CPU | CPUUtilization | 80% | 2 periods (10 min) |
| RDS Connections | DatabaseConnections | 80 | 2 periods (10 min) |
| RDS Storage | FreeStorageSpace | 2GB | 1 period (5 min) |
| ECS CPU | CPUUtilization | 80% | 2 periods (10 min) |
| ECS Memory | MemoryUtilization | 85% | 2 periods (10 min) |
| ECS Tasks | RunningTaskCount | < 1 | 1 period (1 min) |
| Cache CPU | CPUUtilization | 80% | 2 periods (10 min) |
| Cache Memory | DatabaseMemoryUsagePercentage | 85% | 2 periods (10 min) |
| ALB Response Time | TargetResponseTime | 1 second | 2 periods (10 min) |
| ALB 5xx Errors | HTTPCode_Target_5XX_Count | 10 errors | 1 period (5 min) |

### Adjusting Thresholds

You can adjust thresholds based on your needs:

```typescript
// In monitoring-stack.ts, modify threshold values
threshold: 70, // Lower threshold for more sensitive alerts
evaluationPeriods: 3, // More periods for more stable alerts
datapointsToAlarm: 2, // Require 2 out of 3 periods
```

## Phase 2 Enhancements

When ready to scale, consider:

1. **CloudWatch Dashboards**: Visual dashboards for monitoring
2. **X-Ray Integration**: Distributed tracing for applications
3. **Log Insights**: Query and analyze logs
4. **Composite Alarms**: Combine multiple alarms
5. **Anomaly Detection**: Use ML-based anomaly detection
6. **Custom Metrics**: Application-specific metrics
7. **Cost Monitoring**: Track and alert on AWS costs

## Troubleshooting

### Alarms Not Triggering

1. **Check Metric Data**: Verify metrics are being published
   ```bash
   aws cloudwatch get-metric-statistics \
     --namespace AWS/RDS \
     --metric-name CPUUtilization \
     --dimensions Name=DBInstanceIdentifier,Value=YOUR_DB_ID \
     --start-time 2024-01-01T00:00:00Z \
     --end-time 2024-01-01T23:59:59Z \
     --period 300 \
     --statistics Average
   ```

2. **Check Alarm State**: Verify alarm configuration
   ```bash
   aws cloudwatch describe-alarms --alarm-names ssg-rds-cpu-utilization
   ```

3. **Check SNS Topic**: Verify topic exists and has subscriptions
   ```bash
   aws sns get-topic-attributes --topic-arn ${TOPIC_ARN}
   ```

### Too Many Alerts

1. **Increase Thresholds**: Raise threshold values
2. **Increase Evaluation Periods**: Require more periods before alerting
3. **Adjust Datapoints**: Require more datapoints to alarm

### Missing Metrics

1. **Check Namespace**: Verify correct AWS service namespace
2. **Check Dimensions**: Ensure dimension names match
3. **Wait for Data**: Some metrics take time to appear

## Verification Checklist

- [x] Stack compiles without errors
- [x] Stack synthesizes correctly
- [ ] Stack deployed successfully
- [ ] SNS topic created
- [ ] All alarms created
- [ ] Email subscription added (optional)
- [ ] Alarms are in OK state initially
- [ ] Test alarm by temporarily raising threshold
- [ ] Verify SNS notifications are received

## Files Created/Modified

### New Files
- `infrastructure/lib/monitoring-stack.ts` - CloudWatch monitoring stack definition

### Modified Files
- `infrastructure/bin/infrastructure.ts` - Added MonitoringStack instantiation and stored ECS/Cache stack references

## Summary

Phase 8 successfully adds comprehensive CloudWatch monitoring and alerting infrastructure. The stack monitors all critical infrastructure components (RDS, ECS, ElastiCache, ALB) and sends alerts via SNS when thresholds are exceeded.

**Status**: ✅ Ready for deployment

**Next Phase**: Add email subscription to SNS topic and create CloudWatch dashboards for visual monitoring.

