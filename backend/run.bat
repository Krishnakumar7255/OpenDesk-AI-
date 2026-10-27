@echo off
cd /d "%~dp0"
if not exist .venv (
  echo Creating Python virtual environment...
  py -m venv .venv
)
call .venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
pause
