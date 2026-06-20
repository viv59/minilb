import logging
import os
from logging.handlers import RotatingFileHandler
from pathlib import Path

# LOG_DIR = "logs"
# os.makedirs(LOG_DIR, exist_ok=True)

BASE_DIR = Path(__file__).resolve().parent.parent
LOG_DIR = BASE_DIR / "logs"

LOG_DIR.mkdir(exist_ok=True)

logger = logging.getLogger("minilb")
logger.setLevel(logging.INFO)

formatter = logging.Formatter(
    "%(asctime)s | %(levelname)s | %(name)s | %(filename)s:%(lineno)d | %(message)s"
)

# Console logs
console_handler = logging.StreamHandler()
console_handler.setFormatter(formatter)

# Application logs
app_handler = RotatingFileHandler(
    f"{LOG_DIR}/app.log",
    maxBytes=10 * 1024 * 1024,  # 10MB
    backupCount=5
)
app_handler.setFormatter(formatter)

# Error logs
error_handler = RotatingFileHandler(
    f"{LOG_DIR}/error.log",
    maxBytes=10 * 1024 * 1024,
    backupCount=5
)
error_handler.setLevel(logging.ERROR)
error_handler.setFormatter(formatter)

logger.addHandler(console_handler)
logger.addHandler(app_handler)
logger.addHandler(error_handler)