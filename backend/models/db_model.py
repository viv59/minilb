import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Boolean, Enum, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database.database import Base
import enum

class Server(Base):
    __tablename__ = "servers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    hostname = Column(String, nullable=True)
    ip_address = Column(String, nullable=True)
    port = Column(Integer, nullable=False, default=8000)
    
    status = Column(Boolean, default=True)
    maintenance_mode = Column(Boolean, default=False)

    weight = Column(Integer, default=1)
    priority = Column(Integer, default=0)
    
    max_connections = Column(Integer, nullable=True)
    cpu = Column(Integer, nullable=True) # cores
    memory = Column(Integer, nullable=True)

    region = Column(String, nullable=True)
    country = Column(String, nullable=True)
    datacenter = Column(String, nullable=True)

    supports_sticky_session = Column(Boolean, default=False)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    health = relationship("ServerHealth", uselist=False, back_populates="server")

class ServerHealth(Base):
    """Dynamic runtime state - written frequently, ideally NOT on every request"""
    __tablename__ = "server_health"

    server_id = Column(Integer, ForeignKey("servers.id"), primary_key=True)

    active_connections = Column(Integer, default=0)
    current_requests = Column(Integer, default=0)

    response_time_ms = Column(Float, nullable=True)
    average_latency_ms = Column(Float, nullable=True)
    error_rate = Column(Float, nullable=True)

    cpu_usage = Column(Float, nullable=True)
    memory_usage = Column(Float, nullable=True)
    network_usage = Column(Float, nullable=True)

    last_health_check = Column(DateTime, nullable=True)

    server = relationship("Server", back_populates="health")
class User(Base):
    __tablename__ = "user"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)

class SimulationStatus(str, enum.Enum):
    CREATED = "CREATED"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    STOPPED = "STOPPED"
    FAILED = "FAILED"

class Simulation(Base):
    __tablename__ = "simulations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    algorithm = Column(String, nullable=False, default="round_robin")

    traffic_waves = Column(JSON, nullable=False)

    status = Column(Enum(SimulationStatus), default=SimulationStatus.CREATED)

    result_summary = Column(JSON, nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)