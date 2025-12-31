# Phase 7: S3 Media Storage Stack - Complete ✅

## Overview
Phase 7 adds Amazon S3 bucket infrastructure for storing media assets (athlete photos, brand logos, campaign assets, etc.) with versioning, lifecycle policies, and security configurations.

## What Was Completed

### 1. S3 Stack (`lib/s3-stack.ts`)
- ✅ Created `S3Stack` class with media storage bucket
- ✅ Configured bucket with versioning enabled
- ✅ Server-side encryption (S3-managed keys)
- ✅ Block all public access by default (security best practice)
- ✅ CORS configuration for frontend access
- ✅ Lifecycle policies for cost optimization:
  - Transition to Infrequent Access after 90 days
  - Transition to Glacier after 365 days
  - Delete old versions after 30 days
- ✅ Bucket retention policy (retain on stack deletion)
- ✅ Stack outputs for bucket name, ARN, and domain name

### 2. Bucket Configuration
- **Bucket Name**: `ssg-media-{account}-{region}` (globally unique)
- **Versioning**: Enabled (for backup and recovery)
- **Encryption**: S3-managed server-side encryption
- **Public Access**: Blocked (all access through IAM/CloudFront)
- **CORS**: Configured for frontend access (can be restricted in Phase 2)
- **Lifecycle**: Automated tier transitions for cost savings

### 3. Security
- ✅ All public access blocked
- ✅ Server-side encryption enabled
- ✅ Versioning for data protection
- ✅ Access controlled through IAM policies (to be configured in application)

### 4. Integration
- ✅ Added `S3Stack` to main app (`bin/infrastructure.ts`)
- ✅ No dependencies on other stacks (standalone)

## Stack Outputs

The stack exports the following values:

1. **MediaBucketName**: S3 bucket name
2. **MediaBucketArn**: S3 bucket ARN
3. **MediaBucketDomainName**: S3 bucket domain name

## Deployment

### Deploy the S3 Stack

```bash
cd infrastructure
npx cdk deploy SSGS3Stack
```

### Expected Deployment Time
- **Initial deployment**: ~2-3 minutes
- **Updates**: ~1-2 minutes

### Verify Deployment

```bash
# Check stack status
aws cloudformation describe-stacks --stack-name SSGS3Stack --query 'Stacks[0].StackStatus'

# Get bucket name
aws cloudformation describe-stacks --stack-name SSGS3Stack \
  --query 'Stacks[0].Outputs[?OutputKey==`MediaBucketName`].OutputValue' \
  --output text

# List bucket contents (should be empty initially)
BUCKET_NAME=$(aws cloudformation describe-stacks --stack-name SSGS3Stack \
  --query 'Stacks[0].Outputs[?OutputKey==`MediaBucketName`].OutputValue' \
  --output text)
aws s3 ls s3://${BUCKET_NAME}/
```

## Cost Estimate

### Phase 1 (Current)
- **Storage**: $0.023/GB/month (first 50TB)
- **PUT requests**: $0.005 per 1,000 requests
- **GET requests**: $0.0004 per 1,000 requests
- **Infrequent Access**: $0.0125/GB/month (after 90 days)
- **Glacier**: $0.004/GB/month (after 365 days)
- **Estimated Phase 1**: $5-50/month (depending on usage)

### Phase 2 (Growth)
- **Storage**: ~$0.023/GB/month
- **CloudFront integration**: Additional cost
- **Estimated Phase 2**: $30-100/month

## Next Steps

### 1. Grant ECS Tasks Access to S3

Update `lib/ecs-stack.ts` to grant ECS tasks permission to access S3:

```typescript
// In EcsStack constructor, after taskRole is created
import { S3Stack } from './s3-stack';

// Add to EcsStackProps
export interface EcsStackProps extends cdk.StackProps {
  vpcStack: VpcStack;
  rdsStack: RdsStack;
  ecrStack: EcrStack;
  s3Stack: S3Stack; // Add this
}

// In constructor
const { vpcStack, rdsStack, ecrStack, s3Stack } = props;

// Grant read/write access to S3 bucket
s3Stack.mediaBucket.grantReadWrite(taskRole);
```

### 2. Add S3 Dependencies to Spring Boot

Add to `backend/nil-api/pom.xml`:

```xml
<dependency>
    <groupId>com.amazonaws</groupId>
    <artifactId>aws-java-sdk-s3</artifactId>
    <version>1.12.470</version>
</dependency>
```

Or use Spring Cloud AWS:

```xml
<dependency>
    <groupId>io.awspring.cloud</groupId>
    <artifactId>spring-cloud-aws-starter-s3</artifactId>
    <version>3.0.0</version>
</dependency>
```

### 3. Configure S3 in Spring Boot

Update `backend/nil-api/src/main/resources/application.yml`:

```yaml
aws:
  s3:
    bucket-name: ${S3_BUCKET_NAME}
    region: ${AWS_REGION:us-east-2}
```

### 4. Update ECS Task Definition

Add environment variable to ECS task:

```typescript
environment: {
  // ... existing env vars
  S3_BUCKET_NAME: s3Stack.mediaBucketName,
  AWS_REGION: this.region,
},
```

### 5. Implement File Upload Service

Example Spring Boot service:

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
}
```

### 6. Create Presigned URLs for Secure Access

For secure file access without making bucket public:

```java
public String generatePresignedUrl(String key, Duration expiration) {
    GeneratePresignedUrlRequest request = new GeneratePresignedUrlRequest(bucketName, key)
        .withMethod(HttpMethod.GET)
        .withExpiration(Date.from(Instant.now().plus(expiration)));
    
    return s3Client.generatePresignedUrl(request).toString();
}
```

## Phase 2 Enhancements

When ready to scale, consider:

1. **CloudFront Distribution**: Add CDN for faster global access
2. **Bucket Policies**: Fine-grained access control
3. **Access Logging**: Enable server access logging
4. **Intelligent-Tiering**: Automatic cost optimization
5. **Cross-Region Replication**: For disaster recovery
6. **S3 Transfer Acceleration**: Faster uploads globally
7. **Restrict CORS**: Update CORS to specific frontend domains

## Security Best Practices

### Current Implementation
- ✅ All public access blocked
- ✅ Server-side encryption enabled
- ✅ Versioning for data protection
- ✅ Access through IAM roles only

### Additional Recommendations
1. **Enable MFA Delete**: Require MFA for bucket deletion
2. **Bucket Policies**: Add specific access policies
3. **Access Logging**: Monitor who accesses what
4. **CloudTrail**: Track S3 API calls
5. **Encryption Keys**: Use KMS for customer-managed keys (Phase 2)

## Troubleshooting

### Access Denied Errors

1. **Check IAM Role**: Ensure ECS task role has S3 permissions
2. **Check Bucket Policy**: Verify bucket allows access from your role
3. **Check CORS**: If accessing from browser, verify CORS configuration

### Upload Failures

1. **Check File Size**: S3 has limits (5GB for single PUT, use multipart for larger)
2. **Check Permissions**: Verify IAM role has `s3:PutObject` permission
3. **Check Network**: Ensure ECS tasks can reach S3 (VPC endpoint recommended)

### Cost Optimization

1. **Monitor Storage**: Use CloudWatch metrics to track usage
2. **Review Lifecycle Policies**: Adjust transition times based on access patterns
3. **Use Intelligent-Tiering**: Automatic cost optimization (Phase 2)

## Verification Checklist

- [x] Stack compiles without errors
- [x] Stack synthesizes correctly
- [ ] Stack deployed successfully
- [ ] Bucket is accessible from AWS console
- [ ] IAM role has S3 permissions
- [ ] Application can upload files
- [ ] Application can download files
- [ ] Lifecycle policies are working
- [ ] Versioning is enabled

## Files Created/Modified

### New Files
- `infrastructure/lib/s3-stack.ts` - S3 media storage stack definition

### Modified Files
- `infrastructure/bin/infrastructure.ts` - Added S3Stack instantiation

## Summary

Phase 7 successfully adds S3 media storage infrastructure. The bucket is configured with security best practices, lifecycle policies for cost optimization, and ready for integration with the Spring Boot application.

**Status**: ✅ Ready for deployment

**Next Phase**: Integrate S3 with ECS tasks and implement file upload/download functionality in the Spring Boot application.

