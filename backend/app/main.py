from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.api.routes import auth, revenues, expenses, categories, dashboard, reports, goals, ai_assistant, radar

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Escritório Virtual Financeiro API",
    description="API do Escritório Virtual Financeiro - Família Carvalho",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(revenues.router, prefix="/revenues", tags=["revenues"])
app.include_router(expenses.router, prefix="/expenses", tags=["expenses"])
app.include_router(categories.router, prefix="/categories", tags=["categories"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
app.include_router(reports.router, prefix="/reports", tags=["reports"])
app.include_router(goals.router, prefix="/goals", tags=["goals"])
app.include_router(ai_assistant.router, prefix="/ai", tags=["ai"])
app.include_router(radar.router, prefix="/radar", tags=["radar"])


@app.get("/")
def root():
    return {"message": "Escritório Virtual Financeiro API", "status": "online", "version": "1.0.0"}
