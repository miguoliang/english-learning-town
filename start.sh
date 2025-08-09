#!/bin/bash

# English Learning Town - Convenient Start Script
# This script starts both the Go backend and React frontend

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1
}

# Function to kill processes on specific ports
cleanup_ports() {
    print_status "Cleaning up any existing processes..."
    
    if port_in_use 8080; then
        print_warning "Killing process on port 8080 (Go backend)"
        lsof -ti:8080 | xargs kill -9 2>/dev/null || true
    fi
    
    if port_in_use 5173; then
        print_warning "Killing process on port 5173 (React frontend)"
        lsof -ti:5173 | xargs kill -9 2>/dev/null || true
    fi
}

# Function to start the Go backend
start_backend() {
    print_status "Starting Go backend server..."
    
    if ! command_exists go; then
        print_error "Go is not installed. Please install Go 1.19+ and try again."
        exit 1
    fi
    
    cd backend-go
    
    if [ ! -f "go.mod" ]; then
        print_error "go.mod not found in backend-go directory"
        exit 1
    fi
    
    print_status "Installing Go dependencies..."
    go mod download
    
    print_status "Starting Go server on port 8080..."
    go run cmd/main.go &
    BACKEND_PID=$!
    
    # Wait a moment for the backend to start
    sleep 3
    
    if port_in_use 8080; then
        print_success "Go backend started successfully on http://localhost:8080"
    else
        print_error "Failed to start Go backend"
        exit 1
    fi
    
    cd ..
}

# Function to start the React frontend
start_frontend() {
    print_status "Starting React frontend..."
    
    if ! command_exists npm; then
        print_error "npm is not installed. Please install Node.js 16+ and try again."
        exit 1
    fi
    
    cd react-client
    
    if [ ! -f "package.json" ]; then
        print_error "package.json not found in react-client directory"
        exit 1
    fi
    
    print_status "Installing npm dependencies..."
    npm install
    
    print_status "Starting React development server on port 5173..."
    npm run dev &
    FRONTEND_PID=$!
    
    # Wait a moment for the frontend to start
    sleep 5
    
    if port_in_use 5173; then
        print_success "React frontend started successfully on http://localhost:5173"
    else
        print_error "Failed to start React frontend"
        exit 1
    fi
    
    cd ..
}

# Function to handle cleanup on exit
cleanup() {
    print_status "Shutting down services..."
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
        print_status "Stopped Go backend"
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
        print_status "Stopped React frontend"
    fi
    
    cleanup_ports
    print_success "Cleanup complete"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --backend-only    Start only the Go backend server"
    echo "  --frontend-only   Start only the React frontend"
    echo "  --cleanup         Clean up any existing processes and exit"
    echo "  --help           Show this help message"
    echo ""
    echo "Default: Start both backend and frontend servers"
}

# Main function
main() {
    print_success "🎓 English Learning Town - Development Server Startup"
    echo "=================================================="
    
    # Parse command line arguments
    case "${1:-}" in
        --backend-only)
            cleanup_ports
            start_backend
            print_success "Backend server is running. Press Ctrl+C to stop."
            wait $BACKEND_PID
            ;;
        --frontend-only)
            cleanup_ports
            start_frontend
            print_success "Frontend server is running. Press Ctrl+C to stop."
            wait $FRONTEND_PID
            ;;
        --cleanup)
            cleanup_ports
            print_success "Cleanup complete"
            exit 0
            ;;
        --help)
            show_usage
            exit 0
            ;;
        "")
            # Default: start both servers
            cleanup_ports
            
            # Set up signal handling for cleanup
            trap cleanup EXIT INT TERM
            
            start_backend
            start_frontend
            
            echo ""
            print_success "🚀 Both servers are running!"
            echo "🌐 Frontend: http://localhost:5173"
            echo "🔧 Backend:  http://localhost:8080"
            echo ""
            print_status "Press Ctrl+C to stop both servers"
            
            # Wait for both processes
            wait
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
}

# Check if we're in the right directory
if [ ! -d "backend-go" ] || [ ! -d "react-client" ]; then
    print_error "This script must be run from the root directory of English Learning Town"
    print_error "Expected directories: backend-go/ and react-client/"
    exit 1
fi

# Run main function
main "$@"