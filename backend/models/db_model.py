from sqlalchemy import Column, Integer, String, Boolean
from database.database import Base

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