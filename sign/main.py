from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import tempfile, os, requests
from pyapksigner import Signer

app = FastAPI()

KEYSTORE_PATH = "my.jks"
STORE_PASS = "sketcher"
ALIAS = "sketcher"
KEY_PASS = "sketcher"
UPLOAD_URL = "https://lightblue-koala-805003.hostingersite.com/upload.php"

@app.post("/sign")
async def sign_apk(apk: UploadFile = File(...)):
    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            input_path = os.path.join(tmpdir, apk.filename)
            signed_path = os.path.join(tmpdir, "signed_" + apk.filename)

            with open(input_path, "wb") as f:
                f.write(await apk.read())

            signer = Signer(
                keystore=KEYSTORE_PATH,
                storepass=STORE_PASS,
                keypass=KEY_PASS,
                alias=ALIAS
            )
            signer.sign(input_path, signed_path)

            with open(signed_path, "rb") as f:
                res = requests.post(UPLOAD_URL, files={"file": f})
            
            return {"success": True, "upload_response": res.text}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
