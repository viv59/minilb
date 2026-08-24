# server-a: fast, low variance, handles load well
SERVER_NAME=server-a BASE_LATENCY_MS=400 JITTER_MS=80 TAIL_CHANCE=0.05 LOAD_SENSITIVITY_MS=10 \
  uvicorn mock_backend.main:app --port 9001

$env:SERVER_NAME="server-a"; $env:BASE_LATENCY_MS="400"; $env:JITTER_MS="80"; $env:TAIL_CHANCE="0.05"; $env:LOAD_SENSITIVITY_MS="10"; uvicorn main:app --port 9001

# server-b: slower baseline, more prone to tail latency spikes
SERVER_NAME=server-b BASE_LATENCY_MS=900 JITTER_MS=200 TAIL_CHANCE=0.15 LOAD_SENSITIVITY_MS=15 \
  uvicorn mock_backend.main:app --port 9002

$env:SERVER_NAME="server-b"; $env:BASE_LATENCY_MS="900"; $env:JITTER_MS="200"; $env:TAIL_CHANCE="0.15"; $env:LOAD_SENSITIVITY_MS="15"; uvicorn main:app --port 9002

# server-c: fast when idle, but degrades sharply under concurrent load
# (simulates something like a small DB replica with limited connections)
SERVER_NAME=server-c BASE_LATENCY_MS=350 JITTER_MS=60 TAIL_CHANCE=0.05 LOAD_SENSITIVITY_MS=60 \
  uvicorn mock_backend.main:app --port 9003

$env:SERVER_NAME="server-c"; $env:BASE_LATENCY_MS="350"; $env:JITTER_MS="60"; $env:TAIL_CHANCE="0.05"; $env:LOAD_SENSITIVITY_MS="60"; uvicorn main:app --port 9003


python run_server.py server-a 400 80 0.05 10 50 9001
python run_server.py server-b 900 200 0.15 15 50 9002
python run_server.py server-c 350 60 0.05 60 50 9003