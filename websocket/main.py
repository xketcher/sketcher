from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
import os, asyncio, httpx

app = FastAPI()

AUTH_TOKEN = os.getenv("AUTH_TOKEN", "")
VERIFY_URL = "https://xketcher.x10.mx/chat/v1/user/verify"
STATUS_URL = "https://xketcher.x10.mx/chat/v1/user/changeStatus"
users = {}
lock = asyncio.Lock()

def failed(message: str):
    return {"error": True, "message": message}

async def userVerify(auth: str, token: str, userId: str):
    headers = {
        "Authorization": auth,
        "Token": token,
        "Content-Type": "application/x-www-form-urlencoded"
    }
    body = {
        "user_id": userId
    }
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            resp = await client.post(VERIFY_URL, headers=headers, data=body)
            if resp.status_code != 200:
                return False
            data = resp.json()
            if data.get("status", "failed") == "failed":
                return False
            return True
    except Exception as e:
        return False
        
async def changeStatus(token: str, status: str):
    headers = {
        "Authorization": AUTH_TOKEN,
        "Token": token,
        "Content-Type": "application/x-www-form-urlencoded"
    }
    body = {
        "status": status
    }
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            resp = await client.post(STATUS_URL, headers=headers, data=body)
            if resp.status_code != 200:
                return False
            data = resp.json()
            if data.get("status", "failed") == "failed":
                return False
            return True
    except Exception as e:
        return False
        
@app.websocket("/ws/{userId}")
async def connectWs(ws: WebSocket, userId: str):
    auth = ws.headers.get("authorization", "")
    token = ws.headers.get("token", "")
    if not await userVerify(auth, token, userId):
        await ws.close()
        return
    await ws.accept()
    async with lock:
        users[userId] = ws
    await changeStatus(token, "online")
    try:
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        pass
    except Exception as e:
        pass
    finally:
        async with lock:
            if userId in users:
                del users[userId]
        await changeStatus(token, "offline")
        
@app.post("/send")
async def sendMsg(req: Request):
    auth = req.headers.get("authorization", "")
    if auth != AUTH_TOKEN:
        return failed("Invalid credentials.")
    try:
        reqq = await req.json()
    except Exception as e:
        return failed("Invalid body.")
    receivers = reqq.get("receivers", [])
    message = reqq.get("message", {})
    totalReceivers = len(receivers)
    totalSent = 0
    totalFailed = 0
    for userId in receivers:
        async with lock:
            ws = users.get(userId, False)
        if ws:
            try:
                await ws.send_json(message)
                totalSent += 1
            except Exception as e:
                async with lock:
                    if userId in users:
                        del users[userId]
    async with lock:
        totalUsers = len(users)
    return {
        "total_users": totalUsers,
        "total_receivers": totalReceivers,
        "total_sent": totalSent,
        "total_failed": totalReceivers - totalSent
    }
    