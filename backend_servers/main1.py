import sys
from fastapi import FastAPI
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))
from backend.core.logger import logger


app = FastAPI()

@app.get("/")
def root():
    logger.info("Request received by backend-1")
    return {
        "server": "backend-1"
    }