"""
Application configuration module.
"""

import logging


def configure_logging():
 """Configure application logging."""
 logging.basicConfig(
 level=logging.INFO,
 format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
 handlers=[
 logging.StreamHandler(),
 logging.FileHandler('task_manager.log', mode='a')
 ]
 )
