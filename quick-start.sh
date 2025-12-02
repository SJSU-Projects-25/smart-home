#!/bin/bash
# Quick start script - fastest way to start the app (no builds, hot reload enabled)

set -e

echo "⚡ Quick Start - Smart Home Cloud Platform"
echo ""

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null && ! command -v docker &> /dev/null; then
    echo "❌ Error: docker-compose or docker is not installed"
    exit 1
fi

# Use docker compose (v2) if available, otherwise docker-compose (v1)
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

# Check if images exist
if ! docker images | grep -q "smart-home.*api" || ! docker images | grep -q "smart-home.*frontend"; then
    echo "⚠️  Docker images not found. Please run ./setup-local.sh first to build images."
    exit 1
fi

echo "🚀 Starting services (no rebuild, hot reload enabled)..."
$COMPOSE_CMD -f docker-compose.local.yml up -d

echo ""
echo "✅ Services started!"
echo ""
echo "📝 Services are running:"
echo "  - API: http://localhost:8000 (hot reload enabled)"
echo "  - Frontend: http://localhost:3000 (hot reload enabled)"
echo "  - API Docs: http://localhost:8000/docs"
echo ""
echo "💡 Changes to code will automatically reload!"
echo "   To view logs: $COMPOSE_CMD -f docker-compose.local.yml logs -f"
echo "   To stop: $COMPOSE_CMD -f docker-compose.local.yml down"

