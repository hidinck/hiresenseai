from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import ingest, auth
from app.db import create_tables


app = FastAPI(title="HireSense MVP")

# Create DB tables
create_tables()

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(ingest.router)
app.include_router(auth.router)


@app.get("/")
def home():
    return {"message": "HireSense is running!"}
