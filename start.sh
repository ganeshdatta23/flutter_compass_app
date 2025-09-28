#!/bin/bash

echo "Starting Swamiji Compass App..."
echo

echo "[1/3] Starting Backend Server..."
cd backend
gnome-terminal --title="Backend Server" -- bash -c "python -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload; exec bash" &
cd ..

echo "[2/3] Waiting for backend to start..."
sleep 3

echo "[3/3] Starting Frontend Development Server..."
cd frontend
gnome-terminal --title="Frontend Server" -- bash -c "npx expo start; exec bash" &
cd ..

echo
echo "✅ Both servers are starting!"
echo
echo "Backend: http://localhost:8000"
echo "Frontend: Follow instructions in the Expo CLI terminal"
echo
echo "Press Enter to continue..."
read