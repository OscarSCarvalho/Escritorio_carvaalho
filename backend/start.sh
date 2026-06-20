#!/bin/bash
echo "Iniciando Escritorio Virtual Financeiro - Backend"
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
