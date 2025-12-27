#!/usr/bin/env python3
"""
Simple startup script for the FastAPI inventory application
"""
import uvicorn
import logging

if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(level=logging.INFO)

    print("🚀 Starting Cosmetics Inventory API with Agentic AI")
    print("📍 Server will be available at: http://127.0.0.1:8000")
    print("📍 API Documentation at: http://127.0.0.1:8000/docs")
    print("📍 Agent endpoints at: http://127.0.0.1:8000/agents/")
    print("Press Ctrl+C to stop the server")
    print("-" * 60)

    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=False,  # Disable reload to avoid restart loops
        log_level="info"
    )