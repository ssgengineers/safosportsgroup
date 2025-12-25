# Phase 5: ECS Stack - COMPLETE ✅

## What Was Completed

1. ✅ **ECS Cluster Created** - Fargate cluster in new VPC
2. ✅ **Task Definition** - Spring Boot container with 2 vCPU, 4GB memory
3. ✅ **ECS Service** - Fargate service with 2 tasks (min) to 4 tasks (max)
4. ✅ **Application Load Balancer** - Internet-facing ALB in public subnets
5. ✅ **Target Group** - HTTP target group with health checks
6. ✅ **Auto-Scaling** - CPU and memory-based auto-scaling configured
7. ✅ **Secrets Integration** - Database password from Secrets Manager
8. ✅ **CloudWatch Logs** - Centralized logging for ECS tasks
9. ✅ **Health Checks** - Container and ALB health checks configured
10. ✅ **Security** - Tasks in private subnets, proper security groups

## ECS Configuration

- **Cluster:** `ssg-cluster`
- **Service:** Fargate service
- **Task Definition:**
  - CPU: 2 vCPU
  - Memory: 4GB
  - Container: Spring Boot API (port 8080)
- **Desired Count:** 2 tasks (scales 2-4 based on load)
- **Deployment:** 100% min healthy, 200% max healthy
- **Subnets:** Private subnets (no public IP)
- **Security Group:** ECS security group from VPC stack

## Application Load Balancer

- **Type:** Application Load Balancer (Layer 7)
- **Internet-Facing:** Yes
- **Subnets:** Public subnets
- **Listener:** HTTP (port 80) - forwards to target group
- **Health Check:** `/actuator/health` endpoint
- **Target Group:** ECS tasks on port 8080

## Auto-Scaling Configuration

**CPU Scaling:**
- Target: 70% CPU utilization
- Scale out cooldown: 60 seconds
- Scale in cooldown: 60 seconds

**Memory Scaling:**
- Target: 80% memory utilization
- Scale out cooldown: 60 seconds
- Scale in cooldown: 60 seconds

**Capacity:**
- Min: 2 tasks
- Max: 4 tasks

## Environment Variables

The ECS task has the following environment variables:

- `SPRING_PROFILES_ACTIVE=prod`
- `SERVER_PORT=8080`
- `DB_HOST` - From RDS stack output
- `DB_PORT` - From RDS stack output
- `DB_NAME` - From RDS stack output
- `DB_USERNAME=nil_admin`
- `DB_PASSWORD` - From Secrets Manager (secure)

## Stack Outputs (Exported)

The following outputs are exported and can be imported by other stacks:

- `SSG-LoadBalancerDns` - ALB DNS name
- `SSG-LoadBalancerUrl` - Full ALB URL (http://...)
- `SSG-ClusterName` - ECS cluster name
- `SSG-ServiceName` - ECS service name

## Verification Steps

Run these commands to verify everything is working:

```bash
cd infrastructure

# 1. Verify TypeScript compiles
npm run build

# 2. Verify CDK can synthesize
npx cdk synth SSGEcsStack

# 3. List stacks
npx cdk list
# Should show: SSGVpcStack, SSGRdsStack, SSGEcrStack, SSGEcsStack

# 4. View stack outputs
npx cdk synth SSGEcsStack | grep -A 15 "Outputs:"
```

## Deployment Order

Deploy stacks in this order:

```bash
cd infrastructure

# 1. Deploy VPC (if not already deployed)
npx cdk deploy SSGVpcStack

# 2. Deploy RDS (if not already deployed)
npx cdk deploy SSGRdsStack

# 3. Deploy ECR (if not already deployed)
npx cdk deploy SSGEcrStack

# 4. Build and push Docker image
cd scripts
./build-and-push.sh

# 5. Deploy ECS stack
cd ..
npx cdk deploy SSGEcsStack
```

**⚠️ Important:** 
- ECS stack requires an image in ECR before deployment
- First deployment takes 5-10 minutes
- ALB DNS name will be available after deployment

## Cost Estimate

- **ECS Fargate:** 2 tasks × (2 vCPU + 4GB) = ~$140/month
- **Application Load Balancer:** ~$20/month
- **Data Transfer:** Variable based on usage
- **CloudWatch Logs:** ~$0.50/GB ingested
- **Total Phase 5 Cost: ~$160-180/month**

## Accessing Your Application

After deployment, get the ALB URL:

```bash
aws cloudformation describe-stacks \
  --stack-name SSGEcsStack \
  --query "Stacks[0].Outputs[?OutputKey=='LoadBalancerUrl'].OutputValue" \
  --output text \
  --region us-east-2
```

Then access:
- **API Base:** `http://<alb-dns-name>`
- **Health Check:** `http://<alb-dns-name>/actuator/health`
- **Swagger UI:** `http://<alb-dns-name>/swagger-ui.html`

## Troubleshooting

### Service won't start:
1. Check ECR image exists: `aws ecr describe-images --repository-name ssg-spring-boot-api`
2. Check task logs: `aws logs tail /ecs/ssg-spring-boot-api --follow`
3. Check task status: `aws ecs describe-tasks --cluster ssg-cluster --tasks <task-id>`

### Health check failing:
1. Verify `/actuator/health` endpoint works locally
2. Check security group allows traffic from ALB
3. Check container logs for errors

### Can't access ALB:
1. Verify ALB is in "active" state
2. Check security group allows HTTP (80) from internet
3. Verify target group has healthy targets

### Database connection issues:
1. Verify RDS security group allows traffic from ECS security group
2. Check Secrets Manager secret exists and is accessible
3. Verify database endpoint is correct

## Next Steps: Phase 6

Once the ECS stack is deployed and verified, we can proceed to **Phase 6: ElastiCache Stack** where we'll:
- Create Redis cluster for caching
- Configure in private subnets
- Set up security groups
- Integrate with ECS tasks

## Useful Commands

**View service status:**
```bash
aws ecs describe-services \
  --cluster ssg-cluster \
  --services <service-name> \
  --region us-east-2
```

**View running tasks:**
```bash
aws ecs list-tasks \
  --cluster ssg-cluster \
  --region us-east-2
```

**View task logs:**
```bash
aws logs tail /ecs/ssg-spring-boot-api --follow
```

**Update service (after pushing new image):**
```bash
aws ecs update-service \
  --cluster ssg-cluster \
  --service <service-name> \
  --force-new-deployment \
  --region us-east-2
```

