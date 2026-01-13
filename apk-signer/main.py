from fastapi import FastAPI, UploadFile, File
from fastapi.responses import FileResponse, JSONResponse
import subprocess, os, uuid, time, threading

app = FastAPI()

TMP = "/tmp"

# Keystore config
KEYSTORE = "keystore.jks"
STOREPASS = "123456"
KEYALIAS = "mykey"
KEYPASS = "123456"

ZIPALIGN = "zipalign"
APKSIGNER = "/opt/android-sdk/android-14/apksigner"


@app.post("/sign-apk")
async def sign_apk(file: UploadFile = File(...)):
    uid = str(uuid.uuid4())

    in_apk = f"{TMP}/{uid}_in.apk"
    aligned_apk = f"{TMP}/{uid}_aligned.apk"
    out_apk = f"{TMP}/{uid}_out.apk"

    # Save uploaded APK
    with open(in_apk, "wb") as f:
        f.write(await file.read())

    try:
        # zipalign
        subprocess.check_call([
            ZIPALIGN, "-f", "4", in_apk, aligned_apk
        ])

        # apksigner
        subprocess.check_call([
            APKSIGNER, "sign",
            "--ks", KEYSTORE,
            "--ks-pass", f"pass:{STOREPASS}",
            "--ks-key-alias", KEYALIAS,
            "--key-pass", f"pass:{KEYPASS}",
            "--out", out_apk,
            aligned_apk
        ])

    except subprocess.CalledProcessError as e:
        return JSONResponse(
            status_code=500,
            content={"error": "APK sign failed", "detail": str(e)}
        )

    return {
        "status": "success",
        "download_url": f"/download/{uid}",
        "expire_minutes": 10
    }


@app.get("/download/{uid}")
def download(uid: str):
    apk = f"{TMP}/{uid}_out.apk"

    if not os.path.exists(apk):
        return JSONResponse(
            status_code=404,
            content={"error": "file expired or not found"}
        )

    return FileResponse(
        apk,
        media_type="application/vnd.android.package-archive",
        filename="signed.apk"
    )


# 🔥 Auto cleanup thread (10 minutes expiry)
def cleanup():
    while True:
        now = time.time()
        for f in os.listdir(TMP):
            if f.endswith(".apk"):
                path = os.path.join(TMP, f)
                if now - os.path.getmtime(path) > 600:
                    try:
                        os.remove(path)
                    except:
                        pass
        time.sleep(300)


threading.Thread(target=cleanup, daemon=True).start()
