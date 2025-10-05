#!/bin/bash

echo "🔍 Checking Server Status..."
echo "======================================"

# Check Backend
if lsof -ti:8000 > /dev/null 2>&1; then
    echo "✅ Backend is running on http://localhost:8000"
    # Test health endpoint
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo "   └─ Health check: PASSED"
    else
        echo "   └─ Health check: FAILED"
    fi
else
    echo "❌ Backend is NOT running on port 8000"
fi

echo ""

# Check Frontend
if lsof -ti:5174 > /dev/null 2>&1; then
    echo "✅ Frontend is running on http://localhost:5174"
    echo "   └─ Open this URL in your browser!"
elif lsof -ti:5173 > /dev/null 2>&1; then
    echo "✅ Frontend is running on http://localhost:5173"
    echo "   └─ Open this URL in your browser!"
else
    echo "❌ Frontend is NOT running"
fi

echo ""
echo "======================================"
echo "📝 To access the application:"
echo "   1. Open your browser (Chrome/Firefox recommended)"
echo "   2. Navigate to http://localhost:5174/"
echo "   3. Clear cache if needed (Cmd+Shift+R)"
echo "======================================"
