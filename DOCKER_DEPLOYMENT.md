# Docker Deployment Guide

## Local Development with Docker Compose

### Prerequisites
- Docker and Docker Compose installed
- Git repository cloned

### Setup

1. **Create .env file** from template:
```bash
cp .env.example .env
```

2. **Update .env with your settings:**
```env
MONGO_URI=mongodb://mongo:27017/worktrack
JWT_SECRET=your-generated-secret-here
NODE_ENV=development
CLIENT_URL=http://localhost:4173
VITE_API_URL=http://localhost:5000/api
```

3. **Start services:**
```bash
docker-compose up --build
```

Services will be available at:
- Frontend: http://localhost:4173
- Backend: http://localhost:5000
- MongoDB: mongodb://127.0.0.1:27017

### Common Commands

```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f server  # Backend logs
docker-compose logs -f client  # Frontend logs
docker-compose logs -f mongo   # MongoDB logs

# Stop services
docker-compose down

# Remove volumes (deletes database)
docker-compose down -v

# Rebuild images
docker-compose build --no-cache

# Run one-off command
docker-compose exec server npm run seed
```

## Production Deployment on Render

### Using Render's Docker Support

1. **Go to render.com dashboard**

2. **Create New → Web Service → GitHub repository**

3. **Configure Server Service:**
   - Name: worktrack-server
   - Environment: Docker
   - Root Directory: server
   - Dockerfile Path: Dockerfile
   - Build Command: (leave empty)

4. **Configure Environment Variables:**
   ```
   MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/worktrack
   JWT_SECRET=<generate-secure-secret>
   CLIENT_URL=https://worktrack-client.onrender.com
   NODE_ENV=production
   PORT=5000
   ```

5. **Create Client Service:**
   - Name: worktrack-client
   - Environment: Docker
   - Root Directory: client
   - Build Command: `docker build -t worktrack-client --build-arg VITE_API_URL=https://worktrack-server.onrender.com/api .`

6. **Configure Client Environment Variables:**
   ```
   VITE_API_URL=https://worktrack-server.onrender.com/api
   ```

## Docker Image Optimization

Both Dockerfiles are optimized for production:

### Server (Node.js)
- Multi-stage build (unnecessary build files removed)
- Alpine Linux (small base image)
- Non-root user for security
- Health checks configured
- Production dependencies only

### Client (React/Vite)
- Multi-stage build (builder → production)
- Alpine Linux
- Pre-built dist directory
- Vite preview server for serving static files
- Non-root user for security
- Health checks configured

## Troubleshooting

### Services won't start
```bash
# Check logs
docker-compose logs

# Rebuild without cache
docker-compose build --no-cache
docker-compose up
```

### MongoDB connection fails
```bash
# Verify MongoDB is running
docker-compose ps

# Check MongoDB logs
docker-compose logs mongo

# Restart MongoDB
docker-compose restart mongo
```

### CORS errors
- Verify `CLIENT_URL` matches your frontend URL
- Check `VITE_API_URL` in client environment

### Port already in use
```bash
# Use different ports in docker-compose.yml
# Or stop other services using those ports
```

## Security Best Practices

✅ **Implemented:**
- Non-root users in containers
- Health checks configured
- Environment variables for secrets (not hardcoded)
- Multi-stage builds (reduced attack surface)
- Alpine Linux (minimal OS)
- Read-only root filesystem (optional)

⚠️ **Additional for Production:**
- Use Docker secrets for sensitive data
- Enable Docker image scanning
- Implement container resource limits
- Use Docker registry authentication
- Regular image updates and patching

## Network Security

For production, consider:
1. Private networks between services
2. API gateway/load balancer
3. WAF (Web Application Firewall)
4. Rate limiting at container level
5. Encrypted communication between services

## Monitoring & Logging

Render provides:
- Deployment logs
- Container metrics (CPU, memory, disk)
- Error tracking

For advanced monitoring:
- Integrate with DataDog, New Relic, or similar
- Use container log drivers
- Set up alerting

## Performance Tuning

### Memory Optimization
```yaml
# In docker-compose.yml or Render config
deploy:
  resources:
    limits:
      memory: 512M
      cpus: '0.5'
    reservations:
      memory: 256M
      cpus: '0.25'
```

### Database Optimization
- Enable indexes (automatic via createIndexes.js)
- Use connection pooling
- Monitor slow queries
- Archive old data

## Backup & Recovery

### MongoDB Backup in Docker
```bash
# Backup database
docker-compose exec mongo mongodump --out /backup

# Restore database
docker-compose exec mongo mongorestore /backup
```

For Render, use MongoDB Atlas backups in your cluster settings.
