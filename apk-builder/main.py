import os
import shutil
import uuid
import subprocess
import threading
import time

from fastapi import FastAPI, UploadFile, File
from fastapi.responses import FileResponse, JSONResponse

app = FastAPI()

BASE_DIR = os.getcwd()
TEMP_DIR = os.path.join(BASE_DIR, "temp")
DOWNLOAD_DIR = os.path.join(BASE_DIR, "downloads")

os.makedirs(TEMP_DIR, exist_ok=True)
os.makedirs(DOWNLOAD_DIR, exist_ok=True)


# -------------------------
# Auto delete APK after 5 min
# -------------------------
def auto_delete(path, delay=300):
    def task():
        time.sleep(delay)
        if os.path.exists(path):
            os.remove(path)
    threading.Thread(target=task, daemon=True).start()


# -------------------------
# Build APK
# -------------------------
@app.post("/build-apk")
async def build_apk(file: UploadFile = File(...)):
    uid = str(uuid.uuid4())
    work_dir = os.path.join(TEMP_DIR, uid)
    os.makedirs(work_dir)

    zip_path = os.path.join(work_dir, "project.zip")

    try:
        # save zip
        with open(zip_path, "wb") as f:
            f.write(await file.read())

        # unzip
        subprocess.check_call(["unzip", zip_path, "-d", work_dir])

        # project root (SampleApp)
        project_root = os.path.join(work_dir, "SampleApp")
        if not os.path.exists(project_root):
            return {
                "status": "failed",
                "message": "SampleApp folder not found in zip"
            }

        # build with system gradle
        subprocess.check_call(
            ["gradle", "assembleDebug"],
            cwd=project_root
        )

        apk_src = os.path.join(
            project_root,
            "app/build/outputs/apk/debug/app-debug.apk"
        )

        if not os.path.exists(apk_src):
            return {
                "status": "failed",
                "message": "APK not found after build"
            }

        apk_name = f"{uid}.apk"
        apk_dest = os.path.join(DOWNLOAD_DIR, apk_name)
        shutil.copy(apk_src, apk_dest)

        auto_delete(apk_dest)

        return {
            "status": "success",
            "message": "APK build successful",
            "data": {
                "download_url": f"/download/{apk_name}"
            }
        }

    except subprocess.CalledProcessError as e:
        return JSONResponse(
            status_code=500,
            content={
                "status": "failed",
                "message": f"Build error: {e}"
            }
        )

    finally:
        shutil.rmtree(work_dir, ignore_errors=True)


# -------------------------
# Download APK
# -------------------------
@app.get("/download/{apk_name}")
def download_apk(apk_name: str):
    path = os.path.join(DOWNLOAD_DIR, apk_name)
    if not os.path.exists(path):
        return {
            "status": "failed",
            "message": "File expired or not found"
        }
    return FileResponse(path, filename=apk_name)
