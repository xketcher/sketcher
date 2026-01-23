FROM python:3.11-slim

WORKDIR /app

RUN apt-get update -y && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .

RUN mkdir -p /app/download

ENV PORT=10000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]
