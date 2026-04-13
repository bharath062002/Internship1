#!/bin/bash
# SmartHospital Quick Start Script

echo ""
echo "⊕ SmartHospital — Quick Start"
echo "==============================="
echo ""

# Check Java
if ! command -v java &> /dev/null; then
  echo "❌ Java 17+ is required. Please install it first."
  exit 1
fi

# Check Node
if ! command -v node &> /dev/null; then
  echo "❌ Node.js 18+ is required. Please install it first."
  exit 1
fi

echo "✅ Java found: $(java -version 2>&1 | head -1)"
echo "✅ Node found: $(node --version)"
echo ""

# Start backend
echo "🚀 Starting Spring Boot backend..."
cd backend
mvn spring-boot:run -q &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"
echo "   Waiting for backend to start..."
sleep 15

# Start frontend
echo ""
echo "🎨 Starting React frontend..."
cd ../frontend
npm install --silent
npm start &
FRONTEND_PID=$!

echo ""
echo "==============================="
echo "✅ SmartHospital is running!"
echo ""
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8080"
echo "   H2 DB:    http://localhost:8080/h2-console"
echo ""
echo "   Demo credentials:"
echo "   Admin:   admin / admin123"
echo "   Doctor:  dr.sharma / doctor123"
echo "   Patient: patient1 / patient123"
echo "==============================="
echo ""
echo "Press Ctrl+C to stop all services."

# Wait
trap "echo 'Stopping...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT
wait
