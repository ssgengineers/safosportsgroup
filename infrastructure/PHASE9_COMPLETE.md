# Phase 9: Stack Integration - Complete ✅

## Overview
Phase 9 integrates all infrastructure stacks together, ensuring ECS tasks have proper access to S3, Redis, and all necessary environment variables are configured for the Spring Boot application.

## What Was Completed

### 1. ECS Stack Integration (`lib/ecs-stack.ts`)
- ✅ Added S3Stack and CacheStack as dependencies to ECS stack
- ✅ Granted ECS task role read/write access to S3 bucket
- ✅ Added Redis endpoint and port as environment variables
- ✅ Added S3 bucket name and AWS region as environment variables
- ✅ All environment variables now available to Spring Boot application

### 2. Infrastructure App Updates (`bin/infrastructure.ts`)
- ✅ Reordered stack instantiation to ensure dependencies are created first
- ✅ S3 and Cache stacks created before ECS stack
- ✅ ECS stack now receives S3 and Cache stack references
- ✅ Proper dependency order maintained

### 3. Environment Variables Added

The following environment variables are now available to ECS tasks:

#### Redis Configuration
- `REDIS_HOST`: ElastiCache Redis endpoint
- `REDIS_PORT`: Redis port (6379)

#### S3 Configuration
- `S3_BUCKET_NAME`: S3 media bucket name
- `AWS_REGION`: AWS region (us-east-2)

#### Existing Variables (from previous phases)
- `DB_HOST`: RDS PostgreSQL endpoint
- `DB_PORT`: RDS PostgreSQL port
- `DB_NAME`: Database name (nil_db)
- `DB_USERNAME`: Database username (nil_admin)
- `DB_PASSWORD`: From Secrets Manager (secure)
- `SPRING_PROFILES_ACTIVE`: prod
- `SERVER_PORT`: 8080

### 4. IAM Permissions

#### ECS Task Role Permissions
- ✅ **S3 Access**: Read and write access to media bucket
  - `s3:GetObject`
  - `s3:PutObject`
  - `s3:DeleteObject`
  - `s3:ListBucket`

#### ECS Task Execution Role Permissions (existing)
- ✅ **Secrets Manager**: Read database credentials
- ✅ **ECR**: Pull container images
- ✅ **CloudWatch Logs**: Write application logs

## Deployment

### Deploy Updated ECS Stack

Since we've updated the ECS stack, you'll need to redeploy it:

```bash
cd infrastructure
npx cdk deploy SSGEcsStack
```

**Note**: This will update the existing ECS service with new environment variables and IAM permissions. The service will perform a rolling update.

### Expected Deployment Time
- **Update deployment**: ~5-10 minutes (rolling update)
- **No downtime**: Rolling update ensures service availability

### Verify Integration

```bash
# Check ECS task environment variables
aws ecs describe-task-definition \
  --task-definition ssgecsstack-taskdefinition \
  --query 'taskDefinition.containerDefinitions[0].environment' \
  --output table

# Verify S3 permissions
aws iam get-role-policy \
  --role-name SSGEcsStack-TaskRole \
  --policy-name SSGS3Stack-MediaBucketPolicy

# Check Redis endpoint is accessible from ECS
# (This requires the Redis stack to be deployed first)
aws cloudformation describe-stacks --stack-name SSGCacheStack \
  --query 'Stacks[0].Outputs[?OutputKey==`RedisEndpoint`].OutputValue' \
  --output text
```

## Spring Boot Application Configuration

### 1. Update application.yml

Your Spring Boot application can now use these environment variables:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
  
  redis:
    host: ${REDIS_HOST}
    port: ${REDIS_PORT:6379}
    timeout: 2000ms
    lettuce:
      pool:
        max-active: 8
        max-idle: 8
        min-idle: 0

aws:
  s3:
    bucket-name: ${S3_BUCKET_NAME}
    region: ${AWS_REGION}
```

### 2. Add Dependencies (if not already added)

Add to `backend/nil-api/pom.xml`:

```xml
<!-- Redis -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>

<!-- AWS S3 -->
<dependency>
    <groupId>io.awspring.cloud</groupId>
    <artifactId>spring-cloud-aws-starter-s3</artifactId>
    <version>3.0.0</version>
</dependency>
```

### 3. Configure Redis Cache

Example Spring Boot configuration:

```java
@Configuration
@EnableCaching
public class CacheConfig {
    @Value("${spring.redis.host}")
    private String redisHost;
    
    @Value("${spring.redis.port}")
    private int redisPort;
    
    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        RedisStandaloneConfiguration config = new RedisStandaloneConfiguration();
        config.setHostName(redisHost);
        config.setPort(redisPort);
        return new LettuceConnectionFactory(config);
    }
    
    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(10))
            .serializeValuesWith(RedisSerializationContext.SerializationPair
                .fromSerializer(new GenericJackson2JsonRedisSerializer()));
        
        return RedisCacheManager.builder(connectionFactory)
            .cacheDefaults(config)
            .build();
    }
}
```

### 4. Configure S3 Service

Example S3 service:

```java
@Service
public class S3Service {
    @Value("${aws.s3.bucket-name}")
    private String bucketName;
    
    @Autowired
    private AmazonS3 s3Client;
    
    public String uploadFile(MultipartFile file, String key) {
        try {
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentType(file.getContentType());
            metadata.setContentLength(file.getSize());
            
            s3Client.putObject(
                new PutObjectRequest(bucketName, key, file.getInputStream(), metadata)
                    .withCannedAcl(CannedAccessControlList.Private)
            );
            
            return s3Client.getUrl(bucketName, key).toString();
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file", e);
        }
    }
    
    public void deleteFile(String key) {
        s3Client.deleteObject(bucketName, key);
    }
    
    public String generatePresignedUrl(String key, Duration expiration) {
        GeneratePresignedUrlRequest request = new GeneratePresignedUrlRequest(bucketName, key)
            .withMethod(HttpMethod.GET)
            .withExpiration(Date.from(Instant.now().plus(expiration)));
        
        return s3Client.generatePresignedUrl(request).toString();
    }
}
```

## Testing Integration

### 1. Test Redis Connection

```bash
# Connect to ECS task and test Redis
aws ecs execute-command \
  --cluster ssg-cluster \
  --task TASK_ID \
  --container SpringBootContainer \
  --command "redis-cli -h $REDIS_HOST -p $REDIS_PORT ping"
```

### 2. Test S3 Access

```bash
# Test S3 access from ECS task
aws ecs execute-command \
  --cluster ssg-cluster \
  --task TASK_ID \
  --container SpringBootContainer \
  --command "aws s3 ls s3://$S3_BUCKET_NAME"
```

### 3. Verify Environment Variables

```bash
# Check environment variables in running task
aws ecs describe-tasks \
  --cluster ssg-cluster \
  --tasks TASK_ID \
  --query 'tasks[0].containers[0].environment'
```

## Troubleshooting

### Redis Connection Issues

1. **Check Security Group**: Ensure ECS security group can access cache security group
   ```bash
   # Verify security group rules
   aws ec2 describe-security-groups \
     --group-ids <ECS_SECURITY_GROUP_ID> \
     --query 'SecurityGroups[0].IpPermissions'
   ```

2. **Check Redis Endpoint**: Verify endpoint is correct
   ```bash
   aws cloudformation describe-stacks --stack-name SSGCacheStack \
     --query 'Stacks[0].Outputs[?OutputKey==`RedisEndpoint`].OutputValue'
   ```

3. **Check Network**: Ensure ECS tasks are in private subnets with NAT Gateway access

### S3 Access Issues

1. **Check IAM Permissions**: Verify task role has S3 permissions
   ```bash
   aws iam get-role-policy \
     --role-name SSGEcsStack-TaskRole \
     --policy-name SSGS3Stack-MediaBucketPolicy
   ```

2. **Check Bucket Name**: Verify bucket name is correct
   ```bash
   aws cloudformation describe-stacks --stack-name SSGS3Stack \
     --query 'Stacks[0].Outputs[?OutputKey==`MediaBucketName`].OutputValue'
   ```

3. **Test from ECS Task**: Use ECS Exec to test S3 access directly

### Environment Variable Issues

1. **Check Task Definition**: Verify environment variables are set
   ```bash
   aws ecs describe-task-definition \
     --task-definition ssgecsstack-taskdefinition \
     --query 'taskDefinition.containerDefinitions[0].environment'
   ```

2. **Restart Service**: If variables were added after deployment, restart service
   ```bash
   aws ecs update-service \
     --cluster ssg-cluster \
     --service ssg-spring-boot-api-service \
     --force-new-deployment
   ```

## Verification Checklist

- [x] ECS stack compiles without errors
- [x] ECS stack synthesizes correctly
- [x] S3 and Cache stacks are dependencies of ECS stack
- [x] ECS task role has S3 permissions
- [x] Environment variables are configured
- [ ] ECS stack deployed successfully
- [ ] ECS tasks can access S3 bucket
- [ ] ECS tasks can connect to Redis
- [ ] Spring Boot application can use Redis
- [ ] Spring Boot application can upload to S3
- [ ] All environment variables are accessible in containers

## Files Modified

### Modified Files
- `infrastructure/lib/ecs-stack.ts` - Added S3 and Cache integration
- `infrastructure/bin/infrastructure.ts` - Reordered stack instantiation

## Summary

Phase 9 successfully integrates all infrastructure stacks. ECS tasks now have:
- ✅ Access to S3 for media storage
- ✅ Access to Redis for caching
- ✅ All necessary environment variables configured
- ✅ Proper IAM permissions for AWS services

**Status**: ✅ Ready for deployment

**Next Steps**: 
1. Deploy updated ECS stack
2. Update Spring Boot application to use Redis and S3
3. Test integration end-to-end
4. Monitor CloudWatch logs and metrics

