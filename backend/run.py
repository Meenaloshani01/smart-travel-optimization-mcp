#!/usr/bin/env python3
"""
Smart Travel Optimization System - Backend Server
Run this script to start the Flask API server with all MCP tools
"""

import os
import sys
import logging
from pathlib import Path

# Add backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('smart_travel.log')
    ]
)

logger = logging.getLogger(__name__)

def main():
    """Main entry point for the application"""
    try:
        logger.info("Starting Smart Travel Optimization System...")
        
        # Import and run the Flask app
        from app import app, socketio
        
        # Configuration
        host = os.getenv('HOST', '0.0.0.0')
        port = int(os.getenv('PORT', 5000))
        debug = os.getenv('DEBUG', 'True').lower() == 'true'
        
        logger.info(f"Server starting on {host}:{port}")
        logger.info(f"Debug mode: {debug}")
        logger.info("MCP Tools initialized and ready")
        
        # Start the server
        socketio.run(
            app, 
            host=host, 
            port=port, 
            debug=debug,
            allow_unsafe_werkzeug=True
        )
        
    except Exception as e:
        logger.error(f"Failed to start server: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    main()