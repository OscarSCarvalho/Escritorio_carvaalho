@echo off
echo Iniciando Escritorio Virtual Financeiro - Backend
echo.
pip install -r requirements.txt
echo.
uvicorn app.main:app --reload --port 8000
