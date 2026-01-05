#!/bin/bash

echo "🔍 Finding process on port 8080..."
PID=$(lsof -ti:8080)

if [ -z "$PID" ]; then
    echo "✅ Port 8080 is already free!"
    exit 0
fi

echo "🛑 Found process $PID on port 8080"
echo "💀 Killing process $PID..."
kill -9 $PID

sleep 2

# Verify it's killed
if lsof -ti:8080 > /dev/null 2>&1; then
    echo "❌ Process still running, trying harder..."
    killall -9 java 2>/dev/null
    sleep 1
fi

if lsof -ti:8080 > /dev/null 2>&1; then
    echo "❌ Port 8080 is still in use. Please manually kill the process."
    exit 1
else
    echo "✅ Port 8080 is now free!"
    exit 0
fi

