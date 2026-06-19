#!/bin/bash
echo "========================================"
echo " Movies Prediction App - Quick Start"
echo "========================================"

echo "[1/3] Training ML Models..."
cd "$(dirname "$0")/backend"
python app/ml/train.py
if [ $? -ne 0 ]; then
    echo "ERROR: Training failed!"
    exit 1
fi
echo ""

echo "[2/3] Starting Backend Server..."
cd "$(dirname "$0")/backend"
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
echo "Backend starting on http://localhost:8000"
echo ""

echo "[3/3] Starting Frontend Server..."
cd "$(dirname "$0")/frontend"
npm run dev &
FRONTEND_PID=$!
echo "Frontend starting on http://localhost:3000"
echo ""

echo "========================================"
echo " App is starting up!"
echo " Frontend: http://localhost:3000"
echo " Backend:  http://localhost:8000"
echo " API Docs: http://localhost:8000/docs"
echo ""
echo " Press Ctrl+C to stop all servers"
echo "========================================"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait
