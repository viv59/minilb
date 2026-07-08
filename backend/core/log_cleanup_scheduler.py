import asyncio
import threading
import time
from datetime import datetime
from core.simulation_logger import cleanup_old_logs
from core.logger import logger


class LogCleanupScheduler:
    """
    Background scheduler that periodically cleans up old simulation log files.
    Runs every 24 hours (or configurable interval).
    """
    
    def __init__(self, interval_hours: int = 24):
        self.interval_hours = interval_hours
        self.interval_seconds = interval_hours * 3600
        self._running = False
        self._thread = None
    
    def start(self):
        """Start the cleanup scheduler in a background thread"""
        if self._running:
            return
        
        self._running = True
        self._thread = threading.Thread(target=self._run_loop, daemon=True)
        self._thread.start()
        logger.info(f"Log cleanup scheduler started (interval: {self.interval_hours} hours)")
    
    def stop(self):
        """Stop the cleanup scheduler"""
        self._running = False
        if self._thread:
            self._thread.join(timeout=5)
        logger.info("Log cleanup scheduler stopped")
    
    def _run_loop(self):
        """Main loop that runs cleanup periodically"""
        while self._running:
            try:
                # Wait for the interval
                time.sleep(self.interval_seconds)
                
                if not self._running:
                    break
                
                # Run cleanup
                logger.info("Running scheduled log cleanup...")
                cleanup_old_logs(hours=24)
                logger.info("Log cleanup completed")
                
            except Exception as e:
                logger.error(f"Error in log cleanup scheduler: {e}")


# Global scheduler instance
_scheduler = LogCleanupScheduler(interval_hours=24)


def start_log_cleanup_scheduler():
    """Start the global log cleanup scheduler"""
    _scheduler.start()


def stop_log_cleanup_scheduler():
    """Stop the global log cleanup scheduler"""
    _scheduler.stop()
