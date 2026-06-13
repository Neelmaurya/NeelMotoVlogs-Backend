#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Starting backend (FastAPI)..."
cd /app/backend
# Run uvicorn on localhost only, so it isn't directly exposed
python -m uvicorn main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

echo "Starting frontend (Next.js)..."
cd /app/frontend
# Run next.js start on localhost only
npm run start -- --port 3000 &
FRONTEND_PID=$!

echo "Starting reverse proxy (Caddy)..."
cd /app
caddy run --config Caddyfile --adapter caddyfile &
CADDY_PID=$!

# Helper function to handle shutdown signals
cleanup() {
    echo "Shutting down services..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    kill $CADDY_PID 2>/dev/null || true
    exit 0
}

# Trap SIGTERM and SIGINT
trap cleanup SIGTERM SIGINT

# Monitor processes
while true; do
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        echo "Backend process died!"
        cleanup
        exit 1
    fi
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "Frontend process died!"
        cleanup
        exit 1
    fi
    if ! kill -0 $CADDY_PID 2>/dev/null; then
        echo "Caddy process died!"
        cleanup
        exit 1
    fi
    sleep 2
done
