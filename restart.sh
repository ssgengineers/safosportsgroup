#!/bin/bash

echo "🛑 Stopping services..."

# Kill processes on ports 8080 and 3000
lsof -ti:8080 | xargs kill -9 2>/dev/null || echo "No process on port 8080"
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "No process on port 3000"

echo "⏳ Waiting 2 seconds..."
sleep 2

echo "🚀 Starting Backend (Spring Boot)..."
cd backend/nil-api
./mvnw spring-boot:run > /tmp/spring-boot.log 2>&1 &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"
echo "Backend logs: tail -f /tmp/spring-boot.log"

cd ../..

echo "⏳ Waiting 3 seconds for backend to start..."
sleep 3

echo "🚀 Starting Frontend (Vite)..."
npm run dev > /tmp/vite.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend started with PID: $FRONTEND_PID"
echo "Frontend logs: tail -f /tmp/vite.log"

echo ""
echo "✅ Services restarted!"
echo "📊 Backend PID: $BACKEND_PID"
echo "📊 Frontend PID: $FRONTEND_PID"
echo ""
echo "To view logs:"
echo "  Backend:  tail -f /tmp/spring-boot.log"
echo "  Frontend: tail -f /tmp/vite.log"
echo ""
echo "To stop services:"
echo "  kill $BACKEND_PID $FRONTEND_PID"

