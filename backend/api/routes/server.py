from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.database import get_db
from models.db_model import Server
from models.schema import ServerCreate, ServerUpdate

from core.logger import logger

router = APIRouter(prefix="/servers", tags=["Servers"])

@router.post("/")
def create_server(server: ServerCreate, db: Session = Depends(get_db)):
    new_server = Server(
        name=server.name,
        cpu=server.cpu,
        memory=server.memory,
        weight=server.weight,
        url=f"http://localhost:{8000}",
        status=True
    )

    db.add(new_server)
    db.commit()
    db.refresh(new_server)

    logger.info(f"New server added - {new_server.name}")

    return{
        "message": "Server created successfully!",
        "server": new_server
    }

@router.get("/")
def get_servers(db: Session = Depends(get_db)):

    logger.info("Get all servers!!!!")

    servers = (
        db.query(Server).order_by(Server.id.desc()).all()
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
        return {
            "message": "Server not found"
        }
    
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
        return {"message": "Server not found"}
    
    db.delete(server)
    db.commit()

    logger.info(f"Server with server id {server_id} deleted successfully")

    return {
        "message": "Server deleted successfully"
    }