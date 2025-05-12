#!/bin/bash

# Set variables
MAX_RETRIES=5
RETRY_DELAY=10
RETRY_COUNT=0
SCRAPER_PORT=${PORT:-3001}
LOG_FILE="./server/scraper.log"

# Ensure log directory exists
mkdir -p "$(dirname "$LOG_FILE")"

echo "Starting eBay Scraper Server on port $SCRAPER_PORT..."
echo "Logs will be written to $LOG_FILE"
echo "$(date): Starting eBay scraper server" >> "$LOG_FILE"

# Function to start the server
start_server() {
  node server/scraper.js >> "$LOG_FILE" 2>&1 &
  SERVER_PID=$!
  echo "Server started with PID: $SERVER_PID"
  echo "$(date): Server started with PID: $SERVER_PID" >> "$LOG_FILE"
  
  # Wait for server to start up
  sleep 3
  
  # Check if server is running
  if kill -0 $SERVER_PID 2>/dev/null; then
    echo "Server successfully started"
    echo "$(date): Server successfully started" >> "$LOG_FILE"
    
    # Set trap to ensure clean shutdown on exit signals
    trap "echo 'Shutting down server...'; kill $SERVER_PID; exit" SIGINT SIGTERM EXIT
    
    # Keep script running and monitor server
    while kill -0 $SERVER_PID 2>/dev/null; do
      sleep 5
    done
    
    echo "Server process ended unexpectedly"
    echo "$(date): Server process ended unexpectedly" >> "$LOG_FILE"
    return 1
  else
    echo "Failed to start server"
    echo "$(date): Failed to start server" >> "$LOG_FILE"
    return 1
  fi
}

# Retry loop
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  start_server
  
  if [ $? -eq 0 ]; then
    break
  fi
  
  RETRY_COUNT=$((RETRY_COUNT+1))
  
  if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
    echo "Retrying in $RETRY_DELAY seconds... (Attempt $RETRY_COUNT of $MAX_RETRIES)"
    echo "$(date): Retrying in $RETRY_DELAY seconds... (Attempt $RETRY_COUNT of $MAX_RETRIES)" >> "$LOG_FILE"
    sleep $RETRY_DELAY
  else
    echo "Maximum retry attempts reached. Server failed to start."
    echo "$(date): Maximum retry attempts reached. Server failed to start." >> "$LOG_FILE"
    exit 1
  fi
done

# Keep the script running until the server stops
wait $SERVER_PID 