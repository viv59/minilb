from fastapi import FastAPI
from core.load_balancer import LoadBalancer
from core.logger import logger
# import httpx
from database.database import Base,engine
from api.routes.server import router as server_router
from api.routes.simulation import router as simulation_router

from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Custom Load Balancer",
    description="A custom load balancer built with FastAPI",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(server_router)
app.include_router(simulation_router)

@app.get("/")
def root():
    return {"message": "minilb backend is running..."}

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