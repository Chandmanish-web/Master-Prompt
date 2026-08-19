@echo off
REM WorkTrack Docker Setup & Run Script for Windows

echo.
echo ========================================
echo WorkTrack - Docker Setup
echo ========================================
echo.

REM Check if Docker is installed
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [X] Docker is not installed. Please install Docker Desktop.
    echo    Visit: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo [OK] Docker detected

REM Check if Docker Compose is installed
where docker-compose >nul 2>nul
if %errorlevel% neq 0 (
    echo [X] Docker Compose is not installed.
    pause
    exit /b 1
)

echo [OK] Docker Compose detected
echo.

REM Check if .env exists
if not exist ".env" (
    echo [!] .env file not found. Creating from .env.example...
    copy .env.example .env
    echo [OK] .env file created
    echo.
)

REM Clean up old containers
echo [*] Cleaning up old containers...
docker-compose down 2>nul
echo.

REM Build and start services
echo [*] Building Docker images...
docker-compose build

echo.
echo [*] Starting services...
docker-compose up -d

echo.
echo [*] Waiting for services to start (30 seconds)...
timeout /t 30 /nobreak

echo.
echo ========================================
echo [OK] Services Started!
echo ========================================
echo.

echo Access the application:
echo   Frontend:  http://localhost:4173
echo   API:       http://localhost:5000
echo   MongoDB:   mongodb://localhost:27017
echo.

echo View logs:
echo   All:      docker-compose logs -f
echo   Server:   docker-compose logs -f server
echo   Client:   docker-compose logs -f client
echo   MongoDB:  docker-compose logs -f mongo
echo.

echo Stop services:
echo   docker-compose down
echo.

echo Restart services:
echo   docker-compose restart
echo.

echo.
echo [OK] Setup complete! Open http://localhost:4173 in your browser
echo.

pause
