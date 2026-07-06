import datetime

from sqlalchemy import Column, DateTime, Integer, String, Boolean, Enum, JSON
from database.database import Base
import enum

class Server(Base):
    __tablename__ = "servers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    url = Column(String, nullable=False)
    status = Column(Boolean, default=True)
    weight = Column(Integer, default=1)
    cpu = Column(Integer,nullable=False)
    memory = Column(Integer, nullable=False)

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