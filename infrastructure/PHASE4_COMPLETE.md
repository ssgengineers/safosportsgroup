# Phase 4: ECR Stack - COMPLETE ✅

## What Was Completed

1. ✅ **ECR Stack Created** - Container registry for Spring Boot application
2. ✅ **Repository Configuration** - Named `ssg-spring-boot-api`
3. ✅ **Image Scanning** - Automatic vulnerability scanning on push
4. ✅ **Lifecycle Policies** - Keep last 10 images, remove untagged images after 1 day
5. ✅ **Encryption** - AES-256 encryption at rest
6. ✅ **Dockerfile Created** - Multi-stage build for Spring Boot
7. ✅ **Build Script** - Automated build and push script

## ECR Configuration

- **Repository Name:** `ssg-spring-boot-api`
- **Image Tag Mutability:** Mutable (allows overwriting tags)
- **Image Scanning:** Enabled (automatic on push)
- **Encryption:** AES-256
- **Lifecycle Rules:**
  - Remove untagged images older than 1 day
  - Keep last 10 tagged images

## Stack Outputs (Exported)

The following outputs are exported and can be imported by other stacks:

- `SSG-ECR-RepositoryUri` - Full ECR repository URI
- `SSG-ECR-RepositoryName` - Repository name
- `SSG-ECR-RepositoryArn` - Repository ARN

## Dockerfile

Created multi-stage Dockerfile at `backend/nil-api/Dockerfile`:
- **Stage 1:** Maven build (Java 17, Maven 3.9)
- **Stage 2:** Runtime (Eclipse Temurin 17 JRE Alpine)
- **Security:** Runs as non-root user
- **Health Check:** Built-in actuator health check
- **Optimized:** Layer caching for faster builds

## Build and Push Script

Created `infrastructure/scripts/build-and-push.sh` for automated builds:

```bash
cd infrastructure/scripts
./build-and-push.sh [tag]
```

**Example:**
```bash
# Build and push with 'latest' tag
./build-and-push.sh

# Build and push with specific tag
./build-and-push.sh v1.0.0
```

## Verification Steps

Run these commands to verify everything is working:

```bash
cd infrastructure

# 1. Verify TypeScript compiles
npm run build

# 2. Verify CDK can synthesize
npx cdk synth SSGEcrStack

# 3. List stacks
npx cdk list
# Should show: SSGVpcStack, SSGRdsStack, SSGEcrStack

# 4. View stack outputs
npx cdk synth SSGEcrStack | grep -A 10 "Outputs:"
```

## Deployment

To deploy the ECR stack:

```bash
cd infrastructure

# Build
npm run build

# Deploy ECR stack
npx cdk deploy SSGEcrStack
```

**⚠️ Important:** 
- This creates an ECR repository (no cost until you push images)
- Storage costs: ~$0.10/GB/month
- Data transfer: Free within same region

## Building and Pushing Images

After deploying the stack:

```bash
# 1. Build and push image
cd infrastructure/scripts
./build-and-push.sh

# 2. Verify image in ECR
aws ecr describe-images \
  --repository-name ssg-spring-boot-api \
  --region us-east-2
```

## Cost Estimate

- **ECR Storage:** ~$0.10/GB/month (first 10 images ~$1-2/month)
- **Data Transfer:** Free within same region
- **Image Scanning:** Free (first 1M scans/month)
- **Total Phase 4 Cost: ~$1-2/month**

## Next Steps: Phase 5

Once the ECR stack is deployed and you've pushed an image, we can proceed to **Phase 5: ECS Stack** where we'll:
- Create ECS Fargate cluster
- Create task definition using ECR image
- Create ECS service with auto-scaling
- Configure Application Load Balancer

## Troubleshooting

### If synthesis fails:
1. Check that all imports are correct
2. Verify TypeScript compiles: `npm run build`
3. Check lifecycle rule priorities (ANY rule must be last)

### If build fails:
1. Ensure Docker is running: `docker ps`
2. Verify AWS credentials: `aws sts get-caller-identity`
3. Check ECR repository exists: `aws ecr describe-repositories --region us-east-2`

### If push fails:
1. Verify ECR login: `aws ecr get-login-password --region us-east-2 | docker login ...`
2. Check repository permissions
3. Verify image tag format

