import os
import shutil
import subprocess
import zipfile
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

BASE_DIR = os.getcwd()
WORK_DIR = os.path.join(BASE_DIR, "work")
DOWNLOAD_DIR = os.path.join(BASE_DIR, "download")

os.makedirs(WORK_DIR, exist_ok=True)
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

class NDKBuildRequest(BaseModel):
    name: str
    c_name: str
    c_code: str
    android_mk: str
    application_mk: str


@app.post("/ndk-build")
def ndk_build(req: NDKBuildRequest):
    project_dir = os.path.join(WORK_DIR, req.name)
    jni_dir = os.path.join(project_dir, "jni")

    try:
        # clean old
        if os.path.exists(project_dir):
            shutil.rmtree(project_dir)

        os.makedirs(jni_dir, exist_ok=True)

        # write C file
        with open(os.path.join(jni_dir, req.c_name), "w") as f:
            f.write(req.c_code)

        # write Android.mk
        with open(os.path.join(jni_dir, "Android.mk"), "w") as f:
            f.write(req.android_mk)

        # write Application.mk
        with open(os.path.join(jni_dir, "Application.mk"), "w") as f:
            f.write(req.application_mk)

        # run ndk-build
        subprocess.check_output(
            ["ndk-build"],
            cwd=project_dir,
            stderr=subprocess.STDOUT
        )

        libs_dir = os.path.join(project_dir, "libs")
        if not os.path.exists(libs_dir):
            return {
                "status": "failed",
                "message": "Build failed: libs folder not found"
            }

        # zip libs
        zip_path = os.path.join(DOWNLOAD_DIR, f"{req.name}.zip")
        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
            for root, _, files in os.walk(libs_dir):
                for file in files:
                    full_path = os.path.join(root, file)
                    arc_name = os.path.relpath(full_path, libs_dir)
                    zipf.write(full_path, arc_name)

        # delete project folder
        shutil.rmtree(project_dir)

        return {
            "status": "success",
            "message": "NDK build successful",
            "data": {
                "download_url": f"https://apk-signer.onrender.com/download/{req.name}.zip"
            }
        }

    except subprocess.CalledProcessError as e:
        return {
            "status": "failed",
            "message": e.output.decode(errors="ignore")
        }
    except Exception as e:
        return {
            "status": "failed",
            "message": str(e)
}
