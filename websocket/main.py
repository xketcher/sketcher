from fastapi import FastAPI, Request, WebSocket

app = FastAPI()

WS_TOKEN = "C5IbPeBeQchue361FS9xhezq068LhOZJsm0CLt9HP06jKZONHuPSS3dibdNeE6CiwiOv7bwEAO7qN"
API_TOKEN = "x6caVK2JVyWs4vm3qx4_Ks5WHopR1jwpqAwDBp02IPvicdk46N9nwdGSUup_lAXQUpldUINjL3fhDUrJrmm07"
rooms = {}

def failed(message: str):
    return {"error": True, "message": message}

@app.websocket("/ws/{room}")
async def connect_ws(ws: WebSocket, room: str):
    token = ws.headers.get("authorization", "")
    if token != WS_TOKEN:
        await ws.close()
        return
    await ws.accept()
    rooms.setdefault(room, []).append(ws)
    try:
        while True:
            await ws.receive_text()
    except Exception as e:
        rooms[room].remove(ws)
        if not rooms[room]:
            del rooms[room]
            
@app.post("/send/{room}")
async def send_msg(req: Request, room: str):
    token = req.headers.get("authorization", "")
    if token != API_TOKEN:
        return failed("Invalid credentials.")
    if room not in rooms:
        return failed("Invalid room.")
    msg = await req.json()
    for ws in rooms[room].copy():
        try:
            await ws.send_json(msg)
        except Exception as e:
            rooms[room].remove(ws)
    return {
        "room": room,
        "total_client": len(rooms.get(room, []))
    }