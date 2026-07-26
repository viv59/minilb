from collections import defaultdict
from sqlalchemy import case, func
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.database import get_db
from core.logger import logger
from models.db_model import Server, ServerHealth, Simulation

router = APIRouter(prefix="/stats", tags=["Statistics"])

@router.get("/")
def get_server_stats(db: Session = Depends(get_db)):
    logger.info("Fetching dashboard statistics")

    # Server statistics (single query)
    stats = (
        db.query(
            func.count(Server.id).label("total"),
            func.sum(
                case(
                    ((Server.status == True) & (Server.maintenance_mode == False), 1),
                    else_=0,
                )
            ).label("healthy"),
            func.sum(
                case(
                    (Server.status == False, 1),
                    else_=0,
                )
            ).label("unhealthy"),
            func.sum(
                case(
                    (Server.maintenance_mode == True, 1),
                    else_=0,
                )
            ).label("maintenance"),
        )
        .one()
    )

    # Initialize every server with 0 handled requests
    server_distribution = {
        name: 0
        for (name,) in db.query(Server.name).all()
    }

    total_requests = 0

    # Only fetch the JSON column
    simulation_summaries = (
        db.query(Simulation.result_summary)
        .filter(Simulation.result_summary.isnot(None))
        .all()
    )

    for (summary,) in simulation_summaries:
        total_requests += summary.get("total_requests", 0)

        for server_name, count in summary.get("distribution", {}).items():
            server_distribution[server_name] = (
                server_distribution.get(server_name, 0) + count
            )

    return {
        "total_servers": stats.total or 0,
        "healthy_servers": stats.healthy or 0,
        "unhealthy_servers": stats.unhealthy or 0,
        "maintenance_servers": stats.maintenance or 0,
        "distribution": server_distribution,
        "total_requests": total_requests,
    }