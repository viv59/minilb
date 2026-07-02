from fastapi import FastAPI
from core.load_balancer import LoadBalancer
from core.logger import logger
# import httpx
from database.database import Base,engine
from api.routes.server import router as server_router

from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Custom Load Balancer",
    description="A custom load balancer built with FastAPI",
    version="1.0.0"
)

app.include_router(server_router)
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173"], allow_methods=["*"], allow_headers=["*"])

# # Initialize Load Balancer
# lb = LoadBalancer()

# # Register sample servers
# lb.add_server(
#     Server(
#         id=1,
#         name="backend-1",
#         url="http://localhost:8001"
#     )
# )

# lb.add_server(
#     Server(
#         id=2,
#         name="backend-2",
#         url="http://localhost:8002"
#     )
# )

# lb.add_server(
#     Server(
#         id=3,
#         name="backend-3",
#         url="http://localhost:8003"
#     )
# )


# @app.get("/")
# def root():
#     return {
#         "application": "Custom Load Balancer",
#         "status": "running"
#     }


# @app.get("/servers")
# def get_servers():
#     return {
#         "servers": lb.servers
#     }


# @app.get("/route")
# async def route_request():

#     server = lb.get_next_server()

#     async with httpx.AsyncClient() as client:

#         response = await client.get(
#             f"{server.url}/"
#         )
#         print("response",response.json())
#         return response.json()