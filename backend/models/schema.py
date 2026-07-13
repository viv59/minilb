from pydantic import BaseModel, Field
from typing import Optional

class ServerCreate(BaseModel):
    name: str
    hostname: Optional[str] = None
    ip_address: Optional[str] = None
    port: int = 8000

    weight: int = 1
    priority: int = 0

    max_connections: Optional[int] = None
    cpu: Optional[int]= None
    memory: Optional[int] = None

    region: Optional[str] = None
    country: Optional[str] = None
    datacenter: Optional[str] = None

    supports_sticky_session: bool = False

class ServerUpdate(BaseModel):
    name: Optional[str] = None
    hostname: Optional[str] = None
    ip_address: Optional[str] = None
    port: Optional[int] = None

    status: Optional[bool] = None
    maintenance_mode: Optional[bool] = None

    weight: Optional[int] = None
    priority: Optional[int] = None

    max_connections: Optional[int] = None
    cpu: Optional[int] = None
    memory: Optional[int] = None

    region: Optional[str] = None
    country: Optional[str] = None
    datacenter: Optional[str] = None

    supports_sticky_session: Optional[bool] = None

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ServerHealthOut(BaseModel):
    active_connections: int
    current_requests: int
    response_time_ms: Optional[float]
    average_latency_ms: Optional[float]
    error_rate: Optional[float]
    cpu_usage: Optional[float]
    memory_usage: Optional[float]
    network_usage: Optional[float]
    last_health_check: Optional[datetime]

    class Config:
        orm_mode = True  # orm_mode in Pydantic v1


class ServerOut(BaseModel):
    id: int
    name: str
    hostname: Optional[str]
    ip_address: Optional[str]
    port: int

    status: bool
    maintenance_mode: bool

    weight: int
    priority: int

    max_connections: Optional[int]
    cpu: Optional[int]
    memory: Optional[int]

    region: Optional[str]
    country: Optional[str]
    datacenter: Optional[str]

    supports_sticky_session: bool

    created_at: datetime
    updated_at: Optional[datetime]

    health: Optional[ServerHealthOut]

    class Config:
        orm_mode = True

class TrafficWave(BaseModel):
    wave: int
    requests: int = Field(gt=0, description="Number of simulated requests in this wave")
    interval_ms: int = Field(default=10, ge=0, description="Delay between each request in ms")


class SimulationCreate(BaseModel):
    simulation_name: str
    algorithm: str = "round_robin"
    traffic_waves: list[TrafficWave]


class SimulationOut(BaseModel):
    id: int
    name: str
    algorithm: str
    status: str
    traffic_waves: list
    result_summary: Optional[dict] = None

    class Config:
        orm_mode = True