from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import tempfile, subprocess, shutil, os, requests

app = FastAPI()

# config
KEYSTORE_PATH = "my.jks"
KEY_ALIAS = "sketcher"
STORE_PASS = "sketcher"
KEY_PASS = "sketcher"
UPLOAD_URL = "https://lightblue-koala-805003.hostingersite.com/upload.php"


@app.post("/sign")
async def sign_apk(apk: UploadFile = File(...)):
    try:
        # Step 1: Save uploaded APK
        with tempfile.TemporaryDirectory() as tmpdir:
            input_path = os.path.join(tmpdir, apk.filename)
            output_path = os.path.join(tmpdir, f"signed_{apk.filename}")

            with open(input_path, "wb") as f:
                f.write(await apk.read())

            # Step 2: Check if zipalign & apksigner exist
            if shutil.which("apksigner") is None:
                return JSONResponse({"error": "apksigner not found in environment"}, status_code=500)

            # Step 3: Sign APK
            cmd = [
                "apksigner", "sign",
                "--ks", KEYSTORE_PATH,
                "--ks-pass", f"pass:{STORE_PASS}",
                "--key-pass", f"pass:{KEY_PASS}",
                "--ks-key-alias", KEY_ALIAS,
                "--out", output_path,
                input_path
            ]
            subprocess.run(cmd, check=True)

            # Step 4: Upload signed APK
            with open(output_path, "rb") as signed_file:
                response = requests.post(UPLOAD_URL, files={"file": signed_file})

            if response.status_code != 200:
                return JSONResponse({"error": f"Upload failed: {response.text}"}, status_code=500)

            return {"success": True, "upload_response": response.text}

    except subprocess.CalledProcessError as e:
        return JSONResponse({"error": f"Signing failed: {e}"}, status_code=500)
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
