@echo off
title QA - Estude para Concursos (Backend + App Mobile)
echo ========================================================
echo   Iniciando QA - Estude para Concursos...
echo ========================================================

echo 1. Instalando dependencias do Backend...
cd backend
start cmd /k "npm install && npm run dev"

echo 2. Instalando dependencias do App Mobile...
cd ..\app-mobile
start cmd /k "npm install && npm run dev"

echo.
echo Tudo pronto! O Backend roda em http://localhost:3333
echo O App Mobile estara acessivel em http://localhost:5173
echo ========================================================
pause
