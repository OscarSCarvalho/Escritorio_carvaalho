@echo off
echo =============================================
echo  Escritorio Virtual Financeiro - BACKEND
echo =============================================
cd backend
pip install -r requirements.txt
echo.
echo Backend iniciando em http://localhost:8000
echo Documentacao: http://localhost:8000/docs
echo.
uvicorn app.main:app --reload --port 8000
