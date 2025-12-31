# Spring Boot Application - Redis & S3 Integration Complete ✅

## Overview
The Spring Boot application has been updated to integrate with Redis caching and AWS S3 for media storage, using the environment variables provided by the ECS infrastructure.

## Changes Made

### 1. Dependencies Added (`pom.xml`)

#### Redis
- `spring-boot-starter-data-redis` - Spring Boot Redis integration

#### AWS S3
- `software.amazon.awssdk:s3` (v2.21.46) - AWS S3 SDK
- `software.amazon.awssdk:url-connection-client` (v2.21.46) - For presigned URLs

### 2. Configuration Files

#### `application.yml`
Added Redis and S3 configuration:

```yaml
spring:
  data:
    redis:
      host: ${REDIS_HOST:localhost}
      port: ${REDIS_PORT:6379}
      timeout: 2000ms
      lettuce:
        pool:
          max-active: 8
          max-idle: 8
          min-idle: 0

aws:
  s3:
    bucket-name: ${S3_BUCKET_NAME:ssg-media-bucket}
    region: ${AWS_REGION:us-east-2}
```

### 3. New Configuration Classes

#### `RedisConfig.java`
- Configures Redis connection factory
- Sets up Redis template with JSON serialization
- Configures cache manager with 10-minute TTL
- Enables Spring Cache abstraction

#### `S3Config.java`
- Creates S3Client bean using AWS credentials from ECS task role
- Configures region from application properties

### 4. New Service Classes

#### `S3Service.java`
Provides methods for:
- `uploadFile()` - Upload files to S3
- `uploadAthleteMedia()` - Upload athlete media files
- `uploadBrandLogo()` - Upload brand logos
- `deleteFile()` - Delete files from S3
- `generatePresignedUrl()` - Generate secure presigned URLs
- `fileExists()` - Check if file exists
- `getFileMetadata()` - Get file metadata

### 5. Updated Service Classes

#### `AthleteService.java`
Added Redis caching:
- `@Cacheable("athletes")` on `getProfile()` - Caches athlete profiles for 10 minutes
- `@CacheEvict("athletes")` on `updateProfile()` - Evicts cache on update
- `@CacheEvict("athletes")` on `deleteProfile()` - Evicts cache on delete

### 6. New Controller

#### `MediaController.java`
REST endpoints for media management:
- `POST /api/media/upload/athlete` - Upload athlete media
- `POST /api/media/upload/brand` - Upload brand logo
- `GET /api/media/presigned-url` - Generate presigned URL
- `DELETE /api/media/{key}` - Delete media file
- `GET /api/media/exists/{key}` - Check if file exists

## Environment Variables Used

The application now uses these environment variables (set by ECS):

- `REDIS_HOST` - ElastiCache Redis endpoint
- `REDIS_PORT` - Redis port (6379)
- `S3_BUCKET_NAME` - S3 media bucket name
- `AWS_REGION` - AWS region (us-east-2)

## Usage Examples

### Using Redis Cache

```java
@Service
public class MyService {
    
    @Cacheable(value = "athletes", key = "#id")
    public AthleteProfileResponse getAthlete(UUID id) {
        // This will be cached for 10 minutes
        return athleteRepository.findById(id);
    }
    
    @CacheEvict(value = "athletes", key = "#id")
    public void updateAthlete(UUID id, AthleteProfileRequest request) {
        // Cache will be evicted on update
        athleteRepository.save(profile);
    }
}
```

### Using S3 Service

```java
@RestController
public class MyController {
    
    @Autowired
    private S3Service s3Service;
    
    @PostMapping("/upload")
    public ResponseEntity<String> upload(@RequestParam MultipartFile file) {
        String key = s3Service.uploadAthleteMedia(file);
        String url = s3Service.generatePresignedUrl(key);
        return ResponseEntity.ok(url);
    }
}
```

## Testing

### Test Redis Connection

```bash
# Check if Redis is accessible from ECS task
aws ecs execute-command \
  --cluster ssg-cluster \
  --task TASK_ID \
  --container SpringBootContainer \
  --command "redis-cli -h $REDIS_HOST -p $REDIS_PORT ping"
```

### Test S3 Access

```bash
# Test S3 access from ECS task
aws ecs execute-command \
  --cluster ssg-cluster \
  --task TASK_ID \
  --container SpringBootContainer \
  --command "aws s3 ls s3://$S3_BUCKET_NAME"
```

### Test Application

1. **Upload Media**:
   ```bash
   curl -X POST http://your-alb-url/api/media/upload/athlete \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "file=@photo.jpg"
   ```

2. **Get Presigned URL**:
   ```bash
   curl http://your-alb-url/api/media/presigned-url?key=athletes/123.jpg
   ```

3. **Check Cache**:
   - First request to `/api/athletes/{id}` will hit database
   - Subsequent requests within 10 minutes will be served from Redis cache

## Next Steps

1. **Deploy Updated Application**:
   ```bash
   cd backend/nil-api
   mvn clean package
   # Build and push Docker image to ECR
   ```

2. **Update ECS Service**:
   - The ECS stack already has the environment variables configured
   - Just deploy the new Docker image

3. **Monitor**:
   - Check CloudWatch logs for Redis connection
   - Check CloudWatch logs for S3 operations
   - Monitor cache hit rates

## Troubleshooting

### Redis Connection Issues

1. Check security groups allow ECS → Redis traffic
2. Verify `REDIS_HOST` and `REDIS_PORT` environment variables
3. Check Redis cluster is in "available" state

### S3 Access Issues

1. Verify ECS task role has S3 permissions
2. Check `S3_BUCKET_NAME` environment variable
3. Verify bucket exists and is accessible

### Cache Not Working

1. Check Redis connection in logs
2. Verify `@EnableCaching` is present
3. Check cache configuration in `RedisConfig`

## Files Modified/Created

### Modified
- `pom.xml` - Added Redis and S3 dependencies
- `application.yml` - Added Redis and S3 configuration
- `AthleteService.java` - Added caching annotations

### Created
- `config/RedisConfig.java` - Redis configuration
- `config/S3Config.java` - S3 configuration
- `service/S3Service.java` - S3 service implementation
- `controller/MediaController.java` - Media upload endpoints

## Summary

✅ Redis caching integrated with Spring Cache
✅ S3 media storage service implemented
✅ Media upload/download endpoints created
✅ Environment variables configured
✅ All code compiles successfully

The application is now ready to use Redis for caching and S3 for media storage!

