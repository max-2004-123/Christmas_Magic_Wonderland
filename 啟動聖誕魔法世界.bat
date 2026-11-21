@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo 🎄 正在啟動 Christmas Magic Wonderland 夢幻聖誕互動網頁...
echo.
start "" http://localhost:5173
call npm.cmd run dev
pause
