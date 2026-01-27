import os
import shutil
import uuid
import subprocess
import threading
import time
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse, FileResponse

APP = FastAPI()

BASE_DIR = os.getcwd()
TEMP_DIR = os.path.join(BASE_DIR, "temp")
DOWNLOAD_DIR = os.path.join(BASE_DIR, "downloads")

os.makedirs(TEMP_DIR, exist_ok=True)
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

# ---------- Auto delete after 5 minutes ----------
def auto_delete(path: str, delay=300):
    def task():
        time.sleep(delay)
        if os.path.exists(path):
            os.remove(path)
    threading.Thread(target=task, daemon=True).start()


# ---------- Build APK ----------
@APP.post("/build-apk")
async def build_apk(file: UploadFile = File(...)):
    uid = str(uuid.uuid4())
    work_dir = os.path.join(TEMP_DIR, uid)
    os.makedirs(work_dir)

    zip_path = os.path.join(work_dir, "project.zip")

    try:
        # Save zip
        with open(zip_path, "wb") as f:
            f.write(await file.read())

        # Unzip
        subprocess.check_call(["unzip", zip_path, "-d", work_dir])

        # Find project root
        project_root = work_dir
        if os.path.exists(os.path.join(work_dir, "SampleApp")):
            project_root = os.path.join(work_dir, "SampleApp")

        # Build APK
        subprocess.check_call(
            ["chmod", "+x", "./gradlew"],
            cwd=project_root
        )

        subprocess.check_call(
            ["./gradlew", "assembleDebug"],
            cwd=project_root
        )

        apk_src = os.path.join(
            project_root,
            "app/build/outputs/apk/debug/app-debug.apk"
        )

        if not os.path.exists(apk_src):
            return JSONResponse(
                status_code=400,
                content={"status": "failed", "message": "APK not found"}
            )

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

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"status": "failed", "message": str(e)}
        )

    finally:
        shutil.rmtree(work_dir, ignore_errors=True)


# ---------- Download ----------
@APP.get("/download/{apk_name}")
def download_apk(apk_name: str):
    path = os.path.join(DOWNLOAD_DIR, apk_name)
    if not os.path.exists(path):
        return JSONResponse(
            status_code=404,
            content={"status": "failed", "message": "File expired or not found"}
        )
    return FileResponse(path, filename=apk_name)
