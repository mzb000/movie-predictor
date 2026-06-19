@echo off
echo ========================================
echo  Movies Prediction App - Quick Start
echo ========================================
echo.

echo [1/3] Training ML Models...
cd /d "%~dp0backend"
python app\ml\train.py
if %errorlevel% neq 0 (
    echo ERROR: Training failed!
    pause
    exit /b 1
)
echo.

echo [2/3] Starting Backend Server...
start "Backend" cmd /c "uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
echo Backend starting on http://localhost:8000
echo.

echo [3/3] Starting Frontend Server...
cd /d "%~dp0frontend"
start "Frontend" cmd /c "npm run dev"
echo Frontend starting on http://localhost:3000
echo.

echo ========================================
echo  App is starting up!
echo  Frontend: http://localhost:3000
echo  Backend:  http://localhost:8000
echo  API Docs: http://localhost:8000/docs
echo ========================================
pause
