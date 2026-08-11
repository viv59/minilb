# mock_backend/run_server.py
import os
import sys
import uvicorn

os.environ["SERVER_NAME"] = sys.argv[1]
os.environ["BASE_LATENCY_MS"] = sys.argv[2]
os.environ["JITTER_MS"] = sys.argv[3]
os.environ["TAIL_CHANCE"] = sys.argv[4]
os.environ["LOAD_SENSITIVITY_MS"] = sys.argv[5]
os.environ["CPU_BASELINE_OFFSET"] = sys.argv[6]
port = int(sys.argv[7])

uvicorn.run("main:app", port=port)