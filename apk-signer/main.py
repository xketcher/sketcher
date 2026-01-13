import os
import uuid
import shutil
import subprocess
import threading
import time

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

# =====================
# CONFIG
# =====================
BASE_URL = "https://apk-signer.onrender.com"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DOWNLOAD_DIR = os.path.join(BASE_DIR, "download")
AUTO_DELETE_TIME = 900  # 15 minutes

os.makedirs(DOWNLOAD_DIR, exist_ok=True)

app = FastAPI(title="APK Signer API")

# Serve download folder
app.mount("/download", StaticFiles(directory=DOWNLOAD_DIR), name="download")


# =====================
# AUTO DELETE FUNCTION
# =====================
def auto_delete(path: str, delay: int = AUTO_DELETE_TIME):
    def _delete():
        time.sleep(delay)
        if os.path.exists(path):
            os.remove(path)
    threading.Thread(target=_delete, daemon=True).start()


# =====================
# CREATE KEYSTORE
# =====================
@app.post("/create-keystore")
def create_keystore(
    type: str = Form(...),              # PKCS12 or JKS
    name: str = Form(...),
    password: str = Form(...),
    alias_name: str = Form(...),
    alias_password: str = Form(...),
    validity: int = Form(...),
    code: str = Form(...)
):
    try:
        keystore_path = os.path.join(DOWNLOAD_DIR, f"{name}.jks")

        cmd = [
            "keytool",
            "-genkeypair",
            "-alias", alias_name,
            "-keyalg", "RSA",
            "-keysize", "2048",
            "-validity", str(validity),
            "-keystore", keystore_path,
            "-storepass", password,
            "-keypass", alias_password,
            "-storetype", type,
            "-dname", f"CN={code}, OU=Dev, O=Company, L=City, S=State, C={code}"
        ]

        subprocess.run(cmd, check=True)

        auto_delete(keystore_path)

        return {
            "status": "success",
            "message": "Keystore created successfully",
            "data": {
                "download_url": f"{BASE_URL}/download/{name}.jks"
            }
        }

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"status": "failed", "message": str(e)}
        )


# =====================
# SIGN APK
# =====================
@app.post("/sign-apk")
def sign_apk(
    jks: UploadFile = File(...),
    apk: UploadFile = File(...)
):
    try:
        uid = str(uuid.uuid4())

        jks_path = os.path.join(DOWNLOAD_DIR, f"{uid}.jks")
        in_apk_path = os.path.join(DOWNLOAD_DIR, f"{uid}_in.apk")
        out_apk_path = os.path.join(DOWNLOAD_DIR, f"{uid}_signed.apk")

        # Save uploaded files
        with open(jks_path, "wb") as f:
            shutil.copyfileobj(jks.file, f)

        with open(in_apk_path, "wb") as f:
            shutil.copyfileobj(apk.file, f)

        # Sign APK
        cmd = [
            "apksigner", "sign",
            "--ks", jks_path,
            "--ks-pass", "pass:keystore113",
            "--key-pass", "pass:keystore113",
            "--out", out_apk_path,
            in_apk_path
        ]

        subprocess.run(cmd, check=True)

        # Auto delete
        auto_delete(jks_path)
        auto_delete(in_apk_path)
        auto_delete(out_apk_path)

        return {
            "status": "success",
            "message": "APK signed successfully",
            "data": {
                "download_url": f"{BASE_URL}/download/{uid}_signed.apk"
            }
        }

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"status": "failed", "message": str(e)}
        )
