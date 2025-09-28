@echo off
echo Starting Swamiji Compass App...
echo.

echo [1/3] Starting Backend Server...
cd backend
start "Backend Server" cmd /k "python -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload"
cd ..

echo [2/3] Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo [3/3] Starting Frontend Development Server...
cd frontend
start "Frontend Server" cmd /k "npx expo start"
cd ..

echo.
echo ✅ Both servers are starting!
echo.
echo Backend: http://localhost:8000
echo Frontend: Follow instructions in the Expo CLI terminal
echo.
echo Press any key to exit...
pause > nul