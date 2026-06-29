from pydantic import BaseModel
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
