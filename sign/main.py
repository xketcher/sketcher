import os
import requests
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from pyapksigner import Signer

app = FastAPI()

# --- Signing configuration ---
KEYSTORE_PATH = "my.jks"
KEY_ALIAS = "sketcher"
STORE_PASS = "sketcher"
KEY_PASS = "sketcher"

# --- Output & remote upload ---
SIGNED_DIR = "signed_apks"
UPLOAD_URL = "https://lightblue-koala-805003.hostingersite.com/upload.php"
os.makedirs(SIGNED_DIR, exist_ok=True)


@app.post("/sign-apk")
async def sign_and_upload(file: UploadFile = File(...)):
    try:
        # Step 1: Save uploaded APK temporarily
        input_path = f"/tmp/{file.filename}"
        with open(input_path, "wb") as f:
            f.write(await file.read())

        # Step 2: Define signed output path
        signed_path = os.path.join(SIGNED_DIR, f"signed_{file.filename}")

        # Step 3: Sign APK using pyapksigner
        signer = Signer(
            keystore=KEYSTORE_PATH,
            keystore_pass=STORE_PASS,
            key_pass=KEY_PASS,
            alias=KEY_ALIAS
        )
        signer.sign(input_path, signed_path)

        # Step 4: Upload signed APK to remote PHP server
        with open(signed_path, "rb") as f:
            upload_response = requests.post(UPLOAD_URL, files={"file": f})

        # Step 5: Handle response
        if upload_response.status_code == 200:
            return {
                "message": "APK signed and uploaded successfully ✅",
                "upload_response": upload_response.text
            }
        else:
            return JSONResponse(
                {"error": "Upload failed", "server_response": upload_response.text},
                status_code=500
            )

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
