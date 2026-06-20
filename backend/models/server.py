from pydantic import BaseModel

class Server(BaseModel):
    id: int
    name: str
    url: str
    healthy: bool = True
    active_connections: int = 0
    weight: int = 1