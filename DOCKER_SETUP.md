# WorkTrack - Docker Setup & Deployment Guide

## ✅ Cleanup Done

### Unnecessary Packages Removed
- ❌ **Client:** Removed `socket.io` (server-only package)
  - Client should only have `socket.io-client` ✅
  - Server correctly has `socket.io` ✅

---

## 🐳 Docker Quick Start

### Prerequisites
- **Docker Desktop** installed ([Download here](https://www.docker.com/products/docker-desktop))
- Docker running in background
- Minimum 4GB RAM allocated to Docker

### Step 1: Setup Environment
```bash
# .env file is already created with defaults
# Review .env file for your needs:
cat .env
```

**Environment Variables Set:**
- `MONGO_URI`: MongoDB connection (docker internal)
- `JWT_SECRET`: Authentication secret
- `NODE_ENV`: development
- `CLIENT_URL`: http://localhost:4173
- `VITE_API_URL`: http://localhost:5000/api

### Step 2: Run Docker Compose

**Windows (PowerShell):**
```powershell
# Run the batch script
.\docker-run.bat

# Or manual commands:
docker-compose build
docker-compose up -d
```

**Mac/Linux:**
```bash
# Run the shell script
chmod +x docker-run.sh
./docker-run.sh

# Or manual commands:
docker-compose build
docker-compose up -d
```

**Manual Docker Compose (All Platforms):**
```bash
docker-compose up -d
```

### Step 3: Verify Services

```bash
# Check if all services are running
docker-compose ps

# Expected output:
# NAME                   STATUS
# worktrack-mongo-1      healthy
# worktrack-server-1     healthy
# worktrack-client-1     healthy
```

### Step 4: Access Application

Open browser and navigate to:
- **Frontend:** http://localhost:4173
- **API:** http://localhost:5000
- **API Health:** http://localhost:5000/api/health

---

## 🔍 Docker Logs & Debugging

### View All Logs
```bash
docker-compose logs -f
```

### View Specific Service Logs
```bash
# Server logs
docker-compose logs -f server

# Client logs
docker-compose logs -f client

# MongoDB logs
docker-compose logs -f mongo
```

### Common Issues

#### Issue: "Cannot connect to Docker daemon"
**Solution:** Start Docker Desktop or Docker service

#### Issue: "Port 5000 already in use"
**Solution:** 
```bash
# Find what's using port 5000
lsof -i :5000  # Mac/Linux
netstat -ano | findstr :5000  # Windows

# Or change port in docker-compose.yml
# Change "5000:5000" to "5001:5000"
```

#### Issue: "MongoDB connection failed"
**Solution:** 
```bash
# Wait for MongoDB to be healthy (30-60 seconds)
docker-compose logs -f mongo

# Or restart containers
docker-compose restart
```

#### Issue: "Frontend shows blank/API error"
**Solution:** 
```bash
# Check CORS settings in server .env
# Verify CLIENT_URL=http://localhost:4173

# Rebuild client
docker-compose build client
docker-compose up -d client
```

---

## 🛑 Stop & Cleanup

### Stop Services (Keep Data)
```bash
docker-compose stop
```

### Restart Services
```bash
docker-compose restart
```

### Remove Everything (Delete Data)
```bash
docker-compose down -v
```

### Remove Only Containers (Keep MongoDB Data)
```bash
docker-compose down
```

---

## 📊 Data Persistence

### MongoDB Data
- Stored in Docker volume: `mongo-data`
- Persists across container restarts
- Remove with: `docker-compose down -v`

### Application Logs
- Streamed to console (stdout)
- View with: `docker-compose logs`

---

## 🔐 Production Deployment

### Before Deploying:

1. **Update .env with Production Values**
   ```env
   NODE_ENV=production
   JWT_SECRET=<generate-secure-random-key>
   MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/worktrack
   CLIENT_URL=https://your-domain.com
   ```

2. **Generate Secure JWT Secret**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Update CORS Origins**
   - Modify `CLIENT_URL` in .env
   - Update `VITE_API_URL` for client builds

4. **Use Production Compose File** (if available)
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

### Deploy to Cloud Platforms

#### Render.com
```bash
# Push to GitHub, connect Render
# Set environment variables in Render dashboard
# Deploy automatically on push
```

#### Docker Hub
```bash
# Push images to registry
docker tag worktrack-server:latest <username>/worktrack-server
docker push <username>/worktrack-server

# Then deploy on any Docker-supporting platform
```

#### Kubernetes
```bash
# Create k8s deployment YAML
# Reference: https://kubernetes.io/
```

---

## 📋 Docker Files Reference

### docker-compose.yml
Orchestrates 3 services:
- **mongo:7.0** - Database (port 27017)
- **server** - Backend API (port 5000)
- **client** - Frontend SPA (port 4173)

### server/Dockerfile
- Node.js 20 Alpine image
- Multi-stage build for production
- Non-root user for security
- Health checks enabled

### client/Dockerfile
- Node.js 20 Alpine builder
- Vite build optimization
- Multi-stage production image
- Health checks enabled

---

## ✨ Useful Docker Commands

```bash
# View running containers
docker ps

# View all containers (including stopped)
docker ps -a

# Execute command in container
docker-compose exec server npm run seed

# View container resource usage
docker stats

# Remove unused images/volumes
docker system prune

# View network
docker network ls

# View volumes
docker volume ls
```

---

## 🎯 Development Workflow with Docker

### 1. Make Code Changes
Edit files in `client/` or `server/` directly on host machine

### 2. Rebuild Services (if package.json changed)
```bash
docker-compose build
docker-compose up -d
```

### 3. View Live Logs
```bash
docker-compose logs -f
```

### 4. Restart on Changes
```bash
docker-compose restart server   # Restart server
docker-compose restart client   # Restart client
```

### 5. Access Database
```bash
# MongoDB Shell
docker-compose exec mongo mongosh

# Run queries
use worktrack
db.users.find()
```

---

## 🚀 Complete Setup Checklist

- [ ] Docker Desktop installed
- [ ] Docker daemon running
- [ ] .env file created with values
- [ ] socket.io removed from client package.json ✅
- [ ] docker-compose.yml is valid
- [ ] Run `docker-compose build`
- [ ] Run `docker-compose up -d`
- [ ] Wait for services to be healthy (30-60 seconds)
- [ ] Open http://localhost:4173
- [ ] Test login and real-time features
- [ ] Seed database if needed: `docker-compose exec server npm run seed`

---

## 📞 Support

### Check Service Health
```bash
docker-compose ps

# All should show "healthy" or "Up"
```

### Common Fixes
1. **Restart all services:** `docker-compose restart`
2. **Rebuild everything:** `docker-compose build --no-cache && docker-compose up -d`
3. **Clear volumes:** `docker-compose down -v && docker-compose up -d`
4. **View specific logs:** `docker-compose logs <service-name>`

### Next Steps
1. ✅ Packages cleaned up
2. ✅ .env configured
3. ✅ Docker scripts created
4. 👉 Run: `docker-compose up -d`
5. 👉 Open: http://localhost:4173

---

**Created:** 2024-08-19  
**Docker Compose Version:** 3.8  
**Services:** MongoDB 7.0, Node.js 20, React + Vite
