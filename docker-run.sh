#!/bin/bash
# WorkTrack Docker Setup & Run Script

echo "🚀 WorkTrack - Docker Setup"
echo "================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker & Docker Compose detected"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ .env file created. Please update with your values if needed."
    echo ""
fi

# Clean up old containers (optional)
echo "🧹 Cleaning up old containers..."
docker-compose down 2>/dev/null || true
echo ""

# Build and start services
echo "🏗️  Building Docker images..."
docker-compose build

echo ""
echo "🚀 Starting services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to start (30 seconds)..."
sleep 30

echo ""
echo "================================"
echo "✅ Services Started!"
echo "================================"
echo ""
echo "📱 Access the application:"
echo "   Frontend:  http://localhost:4173"
echo "   API:       http://localhost:5000"
echo "   MongoDB:   mongodb://localhost:27017"
echo ""
echo "📊 View logs:"
echo "   All:      docker-compose logs -f"
echo "   Server:   docker-compose logs -f server"
echo "   Client:   docker-compose logs -f client"
echo "   MongoDB:  docker-compose logs -f mongo"
echo ""
echo "🛑 Stop services:"
echo "   docker-compose down"
echo ""
echo "♻️  Restart services:"
echo "   docker-compose restart"
echo ""

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
for i in {1..30}; do
    if docker-compose exec -T mongo mongosh localhost:27017 --eval "db.adminCommand('ping')" &> /dev/null; then
        echo "✅ MongoDB is ready"
        break
    fi
    echo -n "."
    sleep 1
done

echo ""
echo "🎉 Setup complete! Open http://localhost:4173 in your browser"
