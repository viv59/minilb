from pydantic import BaseModel, ConfigDict, Field, EmailStr
from typing import Optional
from datetime import datetime
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

class ServerHealthOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)


    active_connections: int
    current_requests: int
    response_time_ms: Optional[float]
    average_latency_ms: Optional[float]
    error_rate: Optional[float]
    cpu_usage: Optional[float]
    memory_usage: Optional[float]
    network_usage: Optional[float]
    last_health_check: Optional[datetime]

    # class Config:
    #     orm_mode = True  # orm_mode in Pydantic v1


class ServerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

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

    # class Config:
    #     orm_mode = True

class TrafficWave(BaseModel):
    wave: int
    requests: int = Field(gt=0, description="Number of simulated requests in this wave")
    interval_ms: int = Field(default=10, ge=0, description="Delay between each request in ms")


class SimulationCreate(BaseModel):
    simulation_name: str
    algorithm: str = "round_robin"
    traffic_waves: list[TrafficWave]


class SimulationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    algorithm: str
    status: str
    traffic_waves: list
    result_summary: Optional[dict] = None
    created_at: datetime

    # class Config:
    #     orm_mode = True
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"