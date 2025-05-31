@echo off

if not exist node_modules (
    cmd /c npm install
)

cmd /c npm run build

copy public\favicon.ico dist

cd ..\API

if not exist node_modules (
    cmd /c npm install
)

nodemon ShortyShortAPI.js