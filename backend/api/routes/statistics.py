import statistics

from sqlalchemy import case, func
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from database.database import get_db
from core.logger import logger
from models.db_model import Server, ServerHealth, Simulation, User
from core.auth import require_admin

from core.rate_limiter import limiter

router = APIRouter(prefix="/stats", tags=["Statistics"])

ERROR_RATE_THRESHOLD = 0.05


@router.get("/")
@limiter.limit("30/minute")
def get_server_stats(
    request: Request,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    logger.info("Fetching dashboard statistics")

    # ============================================================
    # SERVER HEALTH / STATUS COUNTS
    # ============================================================

    stats = (
        db.query(
            func.count(Server.id).label("total"),

            func.sum(
                case(
                    (
                        (Server.status == True)
                        & (Server.maintenance_mode == False),
                        1,
                    ),
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

    # ============================================================
    # CAPACITY / RESOURCE INFORMATION
    # ============================================================

    capacity = (
        db.query(
            func.avg(Server.cpu).label("avg_cpu"),
            func.avg(Server.memory).label("avg_memory"),
            func.sum(Server.max_connections).label("total_max_connections"),
            func.avg(Server.weight).label("avg_weight"),
        )
        .one()
    )

    # ============================================================
    # SERVER HEALTH METRICS
    # ============================================================

    health_stats = (
        db.query(
            func.count(ServerHealth.server_id).label("reporting_count"),

            func.avg(ServerHealth.response_time_ms).label(
                "avg_response_time_ms"
            ),

            func.avg(ServerHealth.error_rate).label(
                "avg_error_rate"
            ),

            func.avg(ServerHealth.cpu_usage).label(
                "avg_cpu_usage"
            ),

            func.avg(ServerHealth.memory_usage).label(
                "avg_memory_usage"
            ),

            func.sum(
                case(
                    (
                        ServerHealth.error_rate > ERROR_RATE_THRESHOLD,
                        1,
                    ),
                    else_=0,
                )
            ).label("servers_high_error_rate"),
        )
        .one()
    )

    # ============================================================
    # REQUEST DISTRIBUTION
    # ============================================================

    # Initialize every server with 0 handled requests
    server_distribution = {
        name: 0
        for (name,) in db.query(Server.name).all()
    }

    total_requests = 0

    # Only fetch the JSON result_summary column
    simulation_summaries = (
        db.query(Simulation.result_summary)
        .filter(Simulation.result_summary.isnot(None))
        .all()
    )

    for (summary,) in simulation_summaries:

        # Defensive check in case result_summary is None / malformed
        if not isinstance(summary, dict):
            continue

        total_requests += summary.get("total_requests", 0)

        distribution = summary.get("distribution", {})

        if not isinstance(distribution, dict):
            continue

        for server_name, count in distribution.items():
            server_distribution[server_name] = (
                server_distribution.get(server_name, 0) + count
            )

    # ============================================================
    # LOAD BALANCE / FAIRNESS
    # ============================================================

    counts = list(server_distribution.values())

    busiest_server = (
        max(
            server_distribution,
            key=server_distribution.get,
        )
        if counts
        else None
    )

    idle_servers = sorted(
        name
        for name, count in server_distribution.items()
        if count == 0
    )

    if counts:
        avg_requests = round(
            statistics.mean(counts),
            2,
        )

        max_count = max(counts)

        min_positive = min(
            (
                count
                for count in counts
                if count > 0
            ),
            default=0,
        )

        # None when:
        # - there is no traffic
        # - only one server has received traffic
        imbalance_ratio = (
            round(max_count / min_positive, 2)
            if min_positive > 0
            else None
        )

    else:
        avg_requests = 0
        imbalance_ratio = None

    # ============================================================
    # RESPONSE
    # ============================================================

    return {
        # --------------------------------------------------------
        # Server status
        # --------------------------------------------------------
        "total_servers": stats.total or 0,
        "healthy_servers": stats.healthy or 0,
        "unhealthy_servers": stats.unhealthy or 0,
        "maintenance_servers": stats.maintenance or 0,

        # --------------------------------------------------------
        # Request distribution
        # --------------------------------------------------------
        "distribution": server_distribution,
        "total_requests": total_requests,

        # --------------------------------------------------------
        # Load balancing
        # --------------------------------------------------------
        "load_balance": {
            "busiest_server": busiest_server,

            "busiest_server_requests": (
                server_distribution.get(
                    busiest_server,
                    0,
                )
                if busiest_server
                else 0
            ),

            "idle_servers": idle_servers,

            "idle_server_count": len(idle_servers),

            "avg_requests_per_server": avg_requests,

            "imbalance_ratio": imbalance_ratio,
        },

        # --------------------------------------------------------
        # Capacity
        # --------------------------------------------------------
        "capacity": {
            "avg_cpu_cores": (
                round(capacity.avg_cpu, 2)
                if capacity.avg_cpu is not None
                else None
            ),

            "avg_memory_mb": (
                round(capacity.avg_memory, 2)
                if capacity.avg_memory is not None
                else None
            ),

            "total_max_connections": (
                capacity.total_max_connections or 0
            ),

            "avg_weight": (
                round(capacity.avg_weight, 2)
                if capacity.avg_weight is not None
                else None
            ),
        },

        # --------------------------------------------------------
        # Health metrics
        # --------------------------------------------------------
        "health": {
            "servers_reporting": (
                health_stats.reporting_count or 0
            ),

            "avg_response_time_ms": (
                round(
                    health_stats.avg_response_time_ms,
                    2,
                )
                if health_stats.avg_response_time_ms is not None
                else None
            ),

            "avg_error_rate": (
                round(
                    health_stats.avg_error_rate,
                    4,
                )
                if health_stats.avg_error_rate is not None
                else None
            ),

            "avg_cpu_usage_percent": (
                round(
                    health_stats.avg_cpu_usage,
                    2,
                )
                if health_stats.avg_cpu_usage is not None
                else None
            ),

            "avg_memory_usage_percent": (
                round(
                    health_stats.avg_memory_usage,
                    2,
                )
                if health_stats.avg_memory_usage is not None
                else None
            ),

            "servers_high_error_rate": (
                health_stats.servers_high_error_rate or 0
            ),
        },
    }