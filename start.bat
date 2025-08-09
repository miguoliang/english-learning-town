@echo off
setlocal enabledelayedexpansion

REM English Learning Town - Convenient Start Script (Windows)
REM This script starts both the Go backend and React frontend

title English Learning Town - Development Servers

echo.
echo [32m🎓 English Learning Town - Development Server Startup[0m
echo ==================================================

REM Check if we're in the right directory
if not exist "backend-go" (
    echo [31m[ERROR] This script must be run from the root directory of English Learning Town[0m
    echo [31m[ERROR] Expected directories: backend-go\ and react-client\[0m
    pause
    exit /b 1
)

if not exist "react-client" (
    echo [31m[ERROR] This script must be run from the root directory of English Learning Town[0m
    echo [31m[ERROR] Expected directories: backend-go\ and react-client\[0m
    pause
    exit /b 1
)

REM Parse command line arguments
if "%1"=="--help" goto :show_usage
if "%1"=="--backend-only" goto :start_backend_only
if "%1"=="--frontend-only" goto :start_frontend_only
if "%1"=="--cleanup" goto :cleanup_ports

REM Default: start both servers
goto :start_both

:show_usage
echo Usage: %0 [OPTIONS]
echo.
echo Options:
echo   --backend-only    Start only the Go backend server
echo   --frontend-only   Start only the React frontend
echo   --cleanup         Clean up any existing processes and exit
echo   --help           Show this help message
echo.
echo Default: Start both backend and frontend servers
pause
exit /b 0

:cleanup_ports
echo [33m[INFO] Cleaning up any existing processes...[0m
taskkill /f /im "go.exe" 2>nul
taskkill /f /im "node.exe" 2>nul
echo [32m[SUCCESS] Cleanup complete[0m
if "%1"=="--cleanup" (
    pause
    exit /b 0
)
goto :eof

:check_go
where go >nul 2>&1
if errorlevel 1 (
    echo [31m[ERROR] Go is not installed. Please install Go 1.19+ and try again.[0m
    pause
    exit /b 1
)
goto :eof

:check_npm
where npm >nul 2>&1
if errorlevel 1 (
    echo [31m[ERROR] npm is not installed. Please install Node.js 16+ and try again.[0m
    pause
    exit /b 1
)
goto :eof

:start_backend_only
call :cleanup_ports
call :check_go

echo [34m[INFO] Starting Go backend server...[0m
cd backend-go

if not exist "go.mod" (
    echo [31m[ERROR] go.mod not found in backend-go directory[0m
    pause
    exit /b 1
)

echo [34m[INFO] Installing Go dependencies...[0m
go mod download

echo [34m[INFO] Starting Go server on port 3000...[0m
echo [32m[SUCCESS] Go backend started successfully on http://localhost:3000[0m
go run cmd/main.go
cd ..
pause
exit /b 0

:start_frontend_only
call :cleanup_ports
call :check_npm

echo [34m[INFO] Starting React frontend...[0m
cd react-client

if not exist "package.json" (
    echo [31m[ERROR] package.json not found in react-client directory[0m
    pause
    exit /b 1
)

echo [34m[INFO] Installing npm dependencies...[0m
npm install

echo [34m[INFO] Starting React development server on port 5173...[0m
echo [32m[SUCCESS] React frontend started successfully on http://localhost:5173[0m
npm run dev
cd ..
pause
exit /b 0

:start_both
call :cleanup_ports
call :check_go
call :check_npm

REM Start backend in a new window
echo [34m[INFO] Starting Go backend server...[0m
cd backend-go
if not exist "go.mod" (
    echo [31m[ERROR] go.mod not found in backend-go directory[0m
    pause
    exit /b 1
)

echo [34m[INFO] Installing Go dependencies...[0m
go mod download

start "English Learning Town - Go Backend" cmd /k "echo [32m[SUCCESS] Go backend started on http://localhost:3000[0m && go run cmd/main.go"
cd ..

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend in a new window  
echo [34m[INFO] Starting React frontend...[0m
cd react-client
if not exist "package.json" (
    echo [31m[ERROR] package.json not found in react-client directory[0m
    pause
    exit /b 1
)

echo [34m[INFO] Installing npm dependencies...[0m
npm install

start "English Learning Town - React Frontend" cmd /k "echo [32m[SUCCESS] React frontend started on http://localhost:5173[0m && npm run dev"
cd ..

echo.
echo [32m🚀 Both servers are starting in separate windows![0m
echo 🌐 Frontend: http://localhost:5173
echo 🔧 Backend:  http://localhost:3000
echo.
echo [34m[INFO] Close the terminal windows to stop the servers[0m
pause
exit /b 0