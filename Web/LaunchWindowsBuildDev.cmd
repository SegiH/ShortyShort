@echo off

if not exist node_modules (
    cmd /c npm install
)

cd ..\API

if not exist node_modules (
     cmd /c npm install
) 

cd ..\Web

concurrently "npm run api-windows" "npm run serve"