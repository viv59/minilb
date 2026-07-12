import asyncio

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy import text
from sqlalchemy.orm import Session

from core.load_balancer import build_runtime_servers
from core.simulation_engine import SimulationEngine
from core.simulation_logger import get_simulation_log_content, delete_simulation_log
from core.websocket_manager import WebSocketManager
from database.database import SessionLocal, get_db
from models.db_model import Server, Simulation, SimulationStatus
from models.schema import SimulationCreate, SimulationOut

router = APIRouter(prefix="/simulations", tags=["simulations"])

# Single shared instances — module-level so state survives across requests.
ws_manager = WebSocketManager()
running_engines: dict[int, SimulationEngine] = {}


@router.post("/", response_model=SimulationOut)
def create_simulation(payload: SimulationCreate, db: Session = Depends(get_db)):
    sim = Simulation(
        name=payload.simulation_name,
        algorithm=payload.algorithm,
        traffic_waves=[w.dict() for w in payload.traffic_waves],
        status=SimulationStatus.CREATED,
    )
    db.add(sim)
    db.commit()
    db.refresh(sim)
    return sim


@router.get("/", response_model=list[SimulationOut])
def list_simulations(db: Session = Depends(get_db)):
    return db.query(Simulation).all()


@router.get("/{sim_id}", response_model=SimulationOut)
def get_simulation(sim_id: int, db: Session = Depends(get_db)):
    sim = db.query(Simulation).get(sim_id)
    if not sim:
        raise HTTPException(404, "Simulation not found")
    return sim


@router.post("/{sim_id}/start")
async def start_simulation(sim_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    sim = db.query(Simulation).get(sim_id)
    if not sim:
        raise HTTPException(404, "Simulation not found")

    if sim.status == SimulationStatus.RUNNING:
        raise HTTPException(400, "Simulation already running")

    db_servers = db.query(Server).filter(Server.status == True).all()  # noqa: E712
    if not db_servers:
        raise HTTPException(400, "No healthy servers available")

    # Snapshot servers now — this list won't change for the rest of this run,
    # even if someone edits /servers/ mid-simulation.
    runtime_servers = build_runtime_servers(db_servers)

    engine = SimulationEngine(
        simulation_id=sim_id,
        servers=runtime_servers,
        waves=sim.traffic_waves,
        ws_manager=ws_manager,
        db_session_factory=SessionLocal,
        algorithm=sim.algorithm
    )
    running_engines[sim_id] = engine

    sim.status = SimulationStatus.RUNNING
    db.commit()

    # Fire-and-forget: the HTTP response returns immediately, the engine
    # keeps running in the background and pushes updates via WebSocket.
    asyncio.create_task(_run_and_cleanup(sim_id, engine))

    return {"message": "Simulation started", "simulation_id": sim_id}


async def _run_and_cleanup(sim_id: int, engine: SimulationEngine):
    try:
        await engine.run()
    finally:
        running_engines.pop(sim_id, None)


@router.post("/{sim_id}/stop")
def stop_simulation(sim_id: int):
    engine = running_engines.get(sim_id)
    if not engine:
        raise HTTPException(400, "Simulation is not currently running")

    engine.cancel()
    return {"message": "Stop signal sent"}


@router.get("/{sim_id}/logs")
def get_simulation_logs(sim_id: int, db: Session = Depends(get_db)):
    """Fetch logs for a specific simulation"""
    sim = db.query(Simulation).get(sim_id)
    if not sim:
        raise HTTPException(404, "Simulation not found")
    
    logs = get_simulation_log_content(sim_id)
    return {"simulation_id": sim_id, "logs": logs}


@router.delete("/{sim_id}/logs")
def delete_logs(sim_id: int, db: Session = Depends(get_db)):
    """Delete logs for a specific simulation"""
    sim = db.query(Simulation).get(sim_id)
    if not sim:
        raise HTTPException(404, "Simulation not found")
    
    if delete_simulation_log(sim_id):
        return {"message": "Logs deleted successfully"}
    else:
        raise HTTPException(404, "No logs found for this simulation")


@router.delete("/")
def delete_all_simulations(db: Session = Depends(get_db)):
    deleted_count = db.query(Simulation).count()
    db.query(Simulation).delete(synchronize_session=False)
    db.commit()

    return {"message": "All simulations deleted", "deleted_count": deleted_count}

@router.delete("/{sim_id}")
def delete_simulation(sim_id: int, db: Session = Depends(get_db)):
    """Delete a specific simulation"""

    sim = db.query(Simulation).filter(Simulation.id == sim_id).first()

    if not sim:
        raise HTTPException(404, "Simulation not found")
    
    # Try to delete logs if they exist, but don't fail if they don't
    delete_simulation_log(sim_id)
    
    db.delete(sim)
    db.commit()

    return {
        "message": f"Simulation {sim_id} deleted successfully"
    }

@router.websocket("/ws/{sim_id}")
async def simulation_ws(websocket: WebSocket, sim_id: int):
    await ws_manager.connect(sim_id, websocket)
    try:
        while True:
            # We don't expect the client to send anything meaningful; this
            # just keeps the connection open and detects disconnects.
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(sim_id, websocket)