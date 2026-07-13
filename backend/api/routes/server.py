from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from database.database import get_db
from models.db_model import Server, ServerHealth
from models.schema import ServerCreate, ServerUpdate

from core.logger import logger
from core.load_balancer import LoadBalancer, build_runtime_servers

router = APIRouter(prefix="/servers", tags=["Servers"])

load_balancer = LoadBalancer()

@router.post("/")
def create_server(server: ServerCreate, db: Session = Depends(get_db)):
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
def get_servers(db: Session = Depends(get_db)):

    logger.info("Get all servers!!!!")

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