from pydantic import BaseModel, Field
from typing import Optional

class ServerCreate(BaseModel):
    name: str
    cpu: int
    memory: int
    weight: int = 1

class ServerUpdate(BaseModel):
    name: Optional[str] = None
    cpu: Optional[int] = None
    memory: Optional[int] = None
    weight: Optional[int] = None
    status: Optional[int] = None

class ServerOut(BaseModel):
    id: int
    name: str
    url: str
    status: bool
    weight: int
    cpu: Optional[int] = None
    memory: Optional[int] = None

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