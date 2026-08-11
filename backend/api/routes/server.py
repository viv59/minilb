from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session, joinedload

from services.filter_engine import FilterError, FilterInput, _allowed_ops_for_column, build_filter, describe_model_fields
from database.database import SessionLocal, get_db
from models.db_model import Server, ServerHealth, User, UserRole
from models.schema import ServerCreate, ServerUpdate

from core.logger import logger
from core.load_balancer import LoadBalancer, build_runtime_servers
from typing import Dict, List

from core.auth import get_current_user, require_admin

import httpx

router = APIRouter(prefix="/servers", tags=["Servers"])

load_balancer = LoadBalancer()

@router.post("/")
def create_server(server: ServerCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    new_server = Server(**server.dict(), status=True)

    db.add(new_server)
    db.flush()

    health = ServerHealth(server_id=new_server.id)
    db.add(health)

    db.commit()
    db.refresh(new_server)

    return {
        "message": "Server created successfully",
        "server": new_server
    }

@router.get("/")
def get_servers(db: Session = Depends(get_db), _: User = Depends(get_current_user)):

    logger.info("Get all servers")

    # drop_table(User)
    # User.__table__.drop(bind=db.bind)

    servers = (
        db.query(Server)
        .options(joinedload(Server.health))
        .order_by(Server.id.desc())
        .all()
    )

    if not servers:
        return {
            "message": "No server found!"
        }
    
    return {
        "count": len(servers),
        "servers": servers
    }

@router.put("/{server_id}")
def update_server(server_id: int, server: ServerUpdate, db: Session = Depends(get_db)):

    db_server = db.query(Server).filter(Server.id == server_id).first()

    if not db_server:
        raise HTTPException(status_code=404, detail="Server not found")
    
    # update_data = server.model_dump(exclude_unset=True)
    update_data = server.dict(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_server, key, value)

    db.commit()
    db.refresh(db_server)

    logger.info(f"Server with server id {server_id} updated successfully")

    return {
        "message": "Server updated successfully",
        "server": db_server
    }

@router.delete("/{server_id}")
def delete_server(server_id: int, db: Session = Depends(get_db)):

    # Can use soft delete??
    server = db.query(Server).filter(Server.id == server_id).first()

    if not server:
        raise HTTPException(status_code=404, detail="Server not found")
    
    db.query(ServerHealth).filter(ServerHealth.server_id == server_id).delete()
    
    db.delete(server)
    db.commit()

    logger.info(f"Server with server id {server_id} deleted successfully")

    return {
        "message": "Server deleted successfully"
    }

# @router.post("/route-request")
# def route_request(db: Session = Depends(get_db)):
#     db_servers = db.query(Server).filter(Server.status == True).all()  # noqa: E712
#     runtime_servers = build_runtime_servers(db_servers)
#     load_balancer.set_servers(runtime_servers)
#     server = load_balancer.get_next_server()

#     if server is None:
#         logger.info("No healthy servers available for routing")
#         raise HTTPException(status_code=404, detail="No healthy servers available")

#     return {
#         "selected_server": server.name,
#         "server_id": server.id
#     }

@router.post("/route-request")
async def route_request( request: Request, db: Session = Depends(get_db)):

    client_ip = request.client.host

    db_servers = (
        db.query(Server)
        .options(joinedload(Server.health))
        .filter(Server.status == True, Server.maintenance_mode == False)  # noqa: E712
        .all()
    )

    runtime_servers = build_runtime_servers(db_servers)
    load_balancer.set_servers(runtime_servers)
    server = load_balancer.get_next_server(client_ip=client_ip)

    if server is None:
        raise HTTPException(status_code=404, detail="No healthy servers available")

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(f"{server.url}/handle")
            resp.raise_for_status()
            backend_data = resp.json()
    except httpx.HTTPError as e:
        logger.error(f"Server {server.name} failed to handle request: {e}")
        raise HTTPException(status_code=502, detail=f"Backend {server.name} error")
    finally:
        load_balancer.release_connection(server.id)

    return {
        "selected_server": server.name,
        "server_id": server.id,
        "backend_response": backend_data,
    }

@router.post("/filter")
def filter_servers(
    payload: FilterInput,
    limit: int = Query(50, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    try:
        expr = build_filter(Server, payload)
    except FilterError as e:
        raise HTTPException(status_code=422, detail=str(e))
 
    query = db.query(Server).options(joinedload(Server.health)).filter(expr)
    servers = query.order_by(Server.id.desc()).offset(offset).limit(limit).all()
 
    if not servers:
        return {"message": "No server found!", "count": 0, "servers": []}
 
    return {
        "count": len(servers),
        "servers": servers,
    }
 
 
@router.get("/filter/fields")
def list_filterable_fields():
    """
    Tells your frontend which fields exist, each field's type (boolean /
    number / string / date), and which operators are valid for it, so it
    can render a ServiceNow-style "field -> operator -> value" picker
    dynamically instead of hardcoding it.
    """
    return describe_model_fields(Server)

# db = SessionLocal()
# user = db.query(User).filter(User.email == "admin@example.com").first()
# if user:
#     user.role = UserRole.ADMIN
#     db.commit()
#     print(f"{user.email} is now admin")
# else:
#     print("No user found with that email")
# db.close()