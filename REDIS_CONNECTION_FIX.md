# Redis Connection Error - Fix Solutions

## Problem
Application fails with `ConnectionError: Error 111 connecting to localhost:6379. Connection refused` because Redis is not available in the deployment environment.

## Solutions (Choose one)

### Solution 1: Use Redis Cloud (Recommended)
Set up a free Redis instance and configure environment variables.

#### Steps:
1. **Create Redis Cloud Account**
   - Go to https://redis.com/try-free/
   - Create a free Redis instance (30MB limit, but sufficient for rate limiting)

2. **Get Connection Details**
   - Copy the connection string: `redis://default:password@host:port`
   - Example: `redis://default:abc123@redis-host:6379`

3. **Set Environment Variables in Render.com**
   ```
   REDIS_URL=redis://default:your-password@your-redis-host:6379
   REDIS_HOST=your-redis-host
   REDIS_PORT=6379
   REDIS_DB=0
   ```

### Solution 2: Use Alternative Rate Limiting (Fallback)
Modify Flask-Limiter to use memory-based storage instead of Redis.

#### Steps:
1. **Update jwt_service.py**
   - Change rate limiting storage from Redis to memory
   - Remove Redis dependency for rate limiting only

2. **Update other services to handle Redis gracefully**
   - Add try/catch blocks around Redis operations
   - Provide fallback behavior when Redis is unavailable

### Solution 3: Deploy Redis with Application (Complex)
Add Redis as a service in your deployment stack.

#### For Docker/Render.com:
1. **Add Redis to docker-compose.yml**
2. **Configure networking to connect to Redis container**
3. **Update environment variables**

## Immediate Fix (Solution 2 - Memory-based Rate Limiting)

### Update jwt_service.py
Replace the Limiter initialization:

```python
# OLD (causes the error):
self.limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["5000 per day", "500 per hour"],
    storage_uri=app.config.get('REDIS_URL', 'redis://localhost:6379/0')
)

# NEW (memory-based):
self.limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["5000 per day", "500 per hour"],
    storage_uri="memory://"
)
```

### Update Other Services
Add graceful Redis failure handling:

```python
# Example pattern for other services:
def init_redis(self):
    try:
        redis_url = self.app.config.get('REDIS_URL')
        if redis_url:
            self.redis_client = redis.from_url(redis_url, decode_responses=True)
        else:
            self.redis_client = redis.Redis(
                host=self.app.config.get('REDIS_HOST', 'localhost'),
                port=self.app.config.get('REDIS_PORT', 6379),
                decode_responses=True
            )
        self.redis_client.ping()  # Test connection
    except Exception as e:
        logging.warning(f"Redis not available: {str(e)}")
        self.redis_client = None
```

## Deployment Steps

### For Render.com:
1. **Add Environment Variables in Render Dashboard:**
   - REDIS_URL (if using Redis Cloud)
   - Or keep existing config if using Solution 2

2. **Deploy with Fix:**
   - Commit the code changes
   - Redeploy the service

### For Other Platforms:
- Set REDIS_URL environment variable
- Or implement Solution 2 for immediate fix

## Testing the Fix

After implementing the fix:

1. **Health Check**: Visit `/health` endpoint
2. **Test Rate Limiting**: Make multiple API calls
3. **Check Logs**: Verify no Redis connection errors

## Monitoring
- Watch application logs for Redis errors
- Monitor rate limiting effectiveness
- Check Redis connection if using cloud service

## Cost Considerations
- Redis Cloud free tier: $0/month (sufficient for most applications)
- Memory-based rate limiting: $0/month but less reliable across multiple instances
