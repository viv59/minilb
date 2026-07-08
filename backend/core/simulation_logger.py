import logging
import os
from logging.handlers import RotatingFileHandler
from pathlib import Path
from datetime import datetime, timedelta
import threading

BASE_DIR = Path(__file__).resolve().parent.parent
LOG_DIR = BASE_DIR / "logs"
LOG_DIR.mkdir(exist_ok=True)

# Lock for thread-safe cleanup operations
_cleanup_lock = threading.Lock()


def get_simulation_logger(simulation_id: int) -> logging.Logger:
    """
    Create or retrieve a per-simulation logger.
    Logs are stored in logs/simulation_{simulation_id}.log
    """
    logger_name = f"simulation_{simulation_id}"
    logger = logging.getLogger(logger_name)
    
    # If logger already has handlers, return it (already configured)
    if logger.handlers:
        return logger
    
    logger.setLevel(logging.INFO)
    logger.propagate = False  # Don't propagate to root logger
    
    formatter = logging.Formatter(
        "%(asctime)s | %(levelname)s | %(message)s"
    )
    
    # Create a file handler for this simulation
    log_file = LOG_DIR / f"simulation_{simulation_id}.log"
    file_handler = RotatingFileHandler(
        str(log_file),
        maxBytes=5 * 1024 * 1024,  # 5MB per file
        backupCount=3
    )
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    
    return logger


def cleanup_old_logs(hours: int = 24):
    """
    Delete log files older than the specified hours.
    Typically called with 24 to delete logs older than 24 hours.
    """
    with _cleanup_lock:
        try:
            cutoff_time = datetime.now() - timedelta(hours=hours)
            
            for log_file in LOG_DIR.glob("simulation_*.log*"):
                try:
                    # Get file modification time
                    file_mtime = datetime.fromtimestamp(log_file.stat().st_mtime)
                    
                    if file_mtime < cutoff_time:
                        log_file.unlink()
                        logging.getLogger("minilb").info(
                            f"Deleted old simulation log: {log_file.name}"
                        )
                except Exception as e:
                    logging.getLogger("minilb").error(
                        f"Error deleting log file {log_file.name}: {e}"
                    )
        except Exception as e:
            logging.getLogger("minilb").error(f"Error during log cleanup: {e}")


def get_simulation_log_content(simulation_id: int) -> str:
    """
    Retrieve the content of a simulation's log file.
    Returns empty string if log file doesn't exist.
    """
    log_file = LOG_DIR / f"simulation_{simulation_id}.log"
    
    if not log_file.exists():
        return ""
    
    try:
        with open(log_file, "r") as f:
            return f.read()
    except Exception as e:
        return f"Error reading log file: {e}"


def delete_simulation_log(simulation_id: int) -> bool:
    """
    Delete a specific simulation's log file.
    Returns True if deleted, False otherwise.
    """
    log_file = LOG_DIR / f"simulation_{simulation_id}.log"
    
    if not log_file.exists():
        return False
    
    try:
        log_file.unlink()
        return True
    except Exception as e:
        logging.getLogger("minilb").error(
            f"Error deleting simulation log {simulation_id}: {e}"
        )
        return False
