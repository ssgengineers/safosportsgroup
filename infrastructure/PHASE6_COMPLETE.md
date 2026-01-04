# Phase 6: ElastiCache Redis Stack - Complete ✅

## Overview
Phase 6 adds Amazon ElastiCache Redis for application caching, improving performance by reducing database load and speeding up frequently accessed data.

## What Was Completed

### 1. ElastiCache Stack (`lib/cache-stack.ts`)
- ✅ Created `CacheStack` class with Redis replication group
- ✅ Configured subnet group in private subnets
- ✅ Created Redis 7 parameter group with LRU eviction policy
- ✅ Single-node Redis cluster (cache.t3.micro) for Phase 1
- ✅ Encryption at rest enabled
- ✅ Security group integration with VPC stack
- ✅ Stack outputs for endpoint, port, and cluster ID

### 2. Stack Configuration
- **Instance Type**: `cache.t3.micro` (smallest for Phase 1)
- **Node Count**: 1 (single node, no replication)
- **Multi-AZ**: Disabled (Phase 1 cost optimization)
- **Automatic Failover**: Disabled (Phase 1)
- **Encryption**: At rest enabled, in transit disabled (Phase 1)
- **Snapshot Retention**: 1 snapshot
- **Snapshot Window**: 03:00-05:00 UTC

### 3. Security
- ✅ Redis deployed in private subnets (no public access)
- ✅ Security group allows access only from ECS tasks
- ✅ Encryption at rest enabled
- ✅ Transit encryption can be enabled in Phase 2

### 4. Integration
- ✅ Added `CacheStack` to main app (`bin/infrastructure.ts`)
- ✅ Stack depends on VPC stack for networking
- ✅ Uses existing cache security group from VPC stack

## Stack Outputs

The stack exports the following values:

1. **RedisEndpoint**: Primary endpoint address
2. **RedisPort**: Port number (6379)
3. **RedisClusterId**: Replication group ID

## Deployment

### Deploy the Cache Stack

```bash
cd infrastructure
npx cdk deploy SSGCacheStack
```

### Expected Deployment Time
- **Initial deployment**: ~15-20 minutes
- **Updates**: ~10-15 minutes

### Verify Deployment

```bash
# Check stack status
aws cloudformation describe-stacks --stack-name SSGCacheStack --query 'Stacks[0].StackStatus'

# Get Redis endpoint
aws cloudformation describe-stacks --stack-name SSGCacheStack \
  --query 'Stacks[0].Outputs[?OutputKey==`RedisEndpoint`].OutputValue' \
  --output text

# Check ElastiCache cluster status
aws elasticache describe-replication-groups \
  --replication-group-id ssg-redis-cluster \
  --query 'ReplicationGroups[0].Status'
```

## Cost Estimate

### Phase 1 (Current)
- **ElastiCache cache.t3.micro**: ~$15/month
- **Data Transfer**: Minimal (internal VPC traffic)
- **Total**: ~$15/month

### Phase 2 (Growth)
- **ElastiCache cache.t3.small** (cluster mode): ~$30/month
- **Multi-AZ**: Additional cost
- **Total**: ~$30-60/month

## Next Steps

### 1. Integrate Redis with Spring Boot Application

Update `backend/nil-api/src/main/resources/application.yml`:

```yaml
spring:
  redis:
    host: ${REDIS_HOST}
    port: ${REDIS_PORT:6379}
    password: ${REDIS_PASSWORD:}  # Only if transit encryption enabled
    timeout: 2000ms
    lettuce:
      pool:
        max-active: 8
        max-idle: 8
        min-idle: 0
```

### 2. Add Redis Dependencies

Add to `backend/nil-api/pom.xml`:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

### 3. Update ECS Task Definition

Update `lib/ecs-stack.ts` to pass Redis endpoint as environment variable:

```typescript
environment: {
  // ... existing env vars
  REDIS_HOST: cacheStack.redisEndpoint,
  REDIS_PORT: cacheStack.redisPort.toString(),
},
```

### 4. Implement Caching in Application

Example Spring Boot cache configuration:

```java
@Configuration
@EnableCaching
public class CacheConfig {
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

### 5. Use Caching in Controllers

```java
@Cacheable(value = "athletes", key = "#id")
public Athlete getAthlete(Long id) {
    return athleteRepository.findById(id);
}

@CacheEvict(value = "athletes", key = "#athlete.id")
public Athlete updateAthlete(Athlete athlete) {
    return athleteRepository.save(athlete);
}
```

## Phase 2 Enhancements

When ready to scale, consider:

1. **Enable Multi-AZ**: High availability with automatic failover
2. **Enable Transit Encryption**: Encrypt data in transit
3. **Add Read Replicas**: Scale read operations
4. **Cluster Mode**: Enable for larger datasets
5. **Upgrade Instance**: Move to cache.t3.small or larger
6. **Enable Automatic Failover**: Reduce downtime

## Troubleshooting

### Connection Issues

1. **Check Security Group**: Ensure ECS security group can access cache security group
2. **Check Subnet**: Verify Redis is in private subnets
3. **Check Endpoint**: Use the correct endpoint from stack outputs

### Performance Issues

1. **Monitor Memory Usage**: Check CloudWatch metrics
2. **Review Eviction Policy**: Adjust `maxmemory-policy` if needed
3. **Scale Up**: Upgrade to larger instance type

### Common Errors

- **"Connection refused"**: Security group not allowing ECS access
- **"Timeout"**: Network connectivity issue or security group misconfiguration
- **"Memory limit reached"**: Need to scale up or adjust eviction policy

## Verification Checklist

- [x] Stack compiles without errors
- [x] Stack synthesizes correctly
- [ ] Stack deployed successfully
- [ ] Redis cluster is in "available" status
- [ ] Security group allows ECS access
- [ ] Endpoint is accessible from ECS tasks
- [ ] Application can connect to Redis
- [ ] Caching is working in application

## Files Created/Modified

### New Files
- `infrastructure/lib/cache-stack.ts` - ElastiCache Redis stack definition

### Modified Files
- `infrastructure/bin/infrastructure.ts` - Added CacheStack instantiation

## Summary

Phase 6 successfully adds ElastiCache Redis caching infrastructure. The stack is ready to deploy and can be integrated with the Spring Boot application to improve performance and reduce database load.

**Status**: ✅ Ready for deployment

