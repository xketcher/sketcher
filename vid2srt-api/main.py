import os
import uuid
import asyncio
import subprocess
from pathlib import Path

import requests
import whisper
from fastapi import FastAPI, Query
from fastapi.responses import JSONResponse, FileResponse


DOWNLOAD_DIR = Path("download")
DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)

WHISPER_MODEL = os.getenv("WHISPER_MODEL", "small")
LANGUAGE = os.getenv("LANGUAGE", "en")
DELETE_AFTER_SECONDS = int(os.getenv("DELETE_AFTER_SECONDS", "300"))

app = FastAPI(title="vid2srt", version="1.0.0")

_model = None


def get_model():
    global _model
    if _model is None:
        _model = whisper.load_model(WHISPER_MODEL)
    return _model


def format_time(seconds: float) -> str:
    ms = int((seconds - int(seconds)) * 1000)
    s = int(seconds) % 60
    m = (int(seconds) // 60) % 60
    h = int(seconds) // 3600
    return f"{h:02}:{m:02}:{s:02},{ms:03}"


def write_srt(segments, out_path: Path):
    i = 1
    with out_path.open("w", encoding="utf-8") as f:
        for seg in segments:
            text = (seg.get("text") or "").strip()
            if not text:
                continue
            start = format_time(seg["start"])
            end = format_time(seg["end"])
            f.write(f"{i}\n")
            f.write(f"{start} --> {end}\n")
            f.write(f"{text}\n\n")
            i += 1


async def schedule_delete(path: Path, seconds: int):
    await asyncio.sleep(seconds)
    try:
        if path.exists():
            path.unlink()
    except:
        pass


def download_video(url: str, out_path: Path):
    with requests.get(url, stream=True, timeout=90) as r:
        r.raise_for_status()
        with out_path.open("wb") as f:
            for chunk in r.iter_content(chunk_size=1024 * 1024):
                if chunk:
                    f.write(chunk)


def to_wav(video_path: Path, wav_path: Path):
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(video_path),
            "-ac",
            "1",
            "-ar",
            "16000",
            str(wav_path),
        ],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


@app.get("/download/{file_name}")
def download_srt(file_name: str):
    file_path = DOWNLOAD_DIR / file_name
    if not file_path.exists():
        return JSONResponse(
            status_code=404,
            content={"status": "failed", "message": "File not found"},
        )

    return FileResponse(
        path=str(file_path),
        media_type="application/x-subrip",
        filename=file_name,
    )


@app.get("/vid2srt")
def vid2srt(url: str = Query(...)):
    uid = str(uuid.uuid4())

    video_file = Path(f"/tmp/{uid}.mp4")
    wav_file = Path(f"/tmp/{uid}.wav")
    srt_file = DOWNLOAD_DIR / f"{uid}.srt"

    try:
        download_video(url, video_file)
        to_wav(video_file, wav_file)

        model = get_model()
        result = model.transcribe(
            str(wav_file),
            language=LANGUAGE,
            task="transcribe",
            fp16=False,
            verbose=False,
        )

        write_srt(result.get("segments", []), srt_file)

        asyncio.create_task(schedule_delete(srt_file, DELETE_AFTER_SECONDS))

        base_url = os.getenv("BASE_URL", "").rstrip("/")
        if base_url:
            download_url = f"{base_url}/download/{srt_file.name}"
        else:
            download_url = f"/download/{srt_file.name}"

        return JSONResponse(
            content={
                "status": "success",
                "message": "SRT created successfully",
                "data": {"download_url": download_url},
            }
        )

    except Exception as e:
        if srt_file.exists():
            try:
                srt_file.unlink()
            except:
                pass

        return JSONResponse(
            status_code=500,
            content={"status": "failed", "message": str(e)},
        )

    finally:
        for p in [video_file, wav_file]:
            try:
                if p.exists():
                    p.unlink()
            except:
                pass
