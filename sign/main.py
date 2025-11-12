import os
import subprocess
import requests
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse

app = FastAPI()

# --- Signing info ---
KEYSTORE_PATH = "my.jks"
KEY_ALIAS = "sketcher"
STORE_PASS = "sketcher"
KEY_PASS = "sketcher"

# --- Output & remote upload URL ---
SIGNED_DIR = "signed_apks"
UPLOAD_URL = "https://lightblue-koala-805003.hostingersite.com/upload.php"
os.makedirs(SIGNED_DIR, exist_ok=True)


@app.post("/sign-apk")
async def sign_and_upload(file: UploadFile = File(...)):
    try:
        # Step 1: Save uploaded file
        input_path = f"/tmp/{file.filename}"
        with open(input_path, "wb") as f:
            f.write(await file.read())

        # Step 2: Define signed file path
        signed_path = os.path.join(SIGNED_DIR, f"signed_{file.filename}")

        # Step 3: Run jarsigner
        cmd = [
            "jarsigner",
            "-verbose",
            "-sigalg", "SHA256withRSA",
            "-digestalg", "SHA-256",
            "-keystore", KEYSTORE_PATH,
            "-storepass", STORE_PASS,
            "-keypass", KEY_PASS,
            input_path,
            KEY_ALIAS
        ]

        result = subprocess.run(cmd, capture_output=True, text=True)

        if result.returncode != 0:
            return JSONResponse(
                {"error": "Signing failed", "details": result.stderr},
                status_code=500
            )

        # Move to signed dir
        os.rename(input_path, signed_path)

        # Step 4: Upload signed APK to remote PHP server
        with open(signed_path, "rb") as f:
            upload_response = requests.post(UPLOAD_URL, files={"file": f})

        # Step 5: Check upload result
        if upload_response.status_code == 200:
            return {
                "message": "APK signed and uploaded successfully",
                "upload_response": upload_response.text
            }
        else:
            return JSONResponse(
                {"error": "Upload failed", "server_response": upload_response.text},
                status_code=500
            )

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
