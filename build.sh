#!/bin/bash
# Build script for Render deployment
# This script builds the frontend and sets up the backend

set -e  # Exit on error

echo "🔨 Building frontend..."
cd frontend
npm install
npm run build
cd ..

echo "🔨 Setting up backend..."
cd backend/newbackend
npm install
cd ../..

echo "✅ Build complete!"
echo "Frontend build is at: frontend/dist"
echo "Backend is ready at: backend/newbackend"

