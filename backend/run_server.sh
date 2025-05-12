#!/bin/bash

# Exit on any error
set -e

# Get the absolute path of the script's directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Change to the script's directory
cd "$SCRIPT_DIR"

# Verify we're in the correct directory
if [ ! -f "requirements.txt" ]; then
    echo "Error: requirements.txt not found. Are we in the correct directory?"
    exit 1
fi

# Verify the virtual environment exists
if [ ! -d "../.venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv ../.venv
fi

# Activate the virtual environment
source ../.venv/bin/activate

# Verify Python version
PYTHON_VERSION=$(python --version)
echo "Using Python version: $PYTHON_VERSION"

# Install requirements
echo "Installing requirements..."
pip install -r requirements.txt

# Verify the scraper_api.py exists
if [ ! -f "scraper_api.py" ]; then
    echo "Error: scraper_api.py not found. Are we in the correct directory?"
    exit 1
fi

# Run the server
echo "Starting server..."
uvicorn scraper_api:app --reload --port 8000 