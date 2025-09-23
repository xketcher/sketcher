import subprocess
from fastapi import FastAPI, Query, HTTPException
from fastapi.responses import StreamingResponse

app = FastAPI()

@app.get("/video")
def get_video(url: str = Query(..., description="URL of the video to stream")):
    if not url:
        raise HTTPException(status_code=400, detail="URL parameter is required")

    cmd = [
        "ffmpeg",
        "-i", url,
        "-vf", "scale=1280:720",
        "-c:v", "libx264",
        "-c:a", "aac",
        "-f", "mpegts",  # MPEG-TS for streaming
        "pipe:1"
    ]

    try:
        process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start ffmpeg: {str(e)}")

    return StreamingResponse(process.stdout, media_type="video/MP2T")
