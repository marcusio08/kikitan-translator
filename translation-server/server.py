from dotenv import load_dotenv
from fastapi import FastAPI, Response, Request
from transcribers.deepgram import DeepgramTranscriber

import os

load_dotenv()

app = FastAPI()
deepgram = DeepgramTranscriber(os.getenv("DG_API_KEY"))

@app.middleware("http")
async def add_cors_header(request, call_next):
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"
    return response

@app.post("/recognize/deepgram")
async def whisper_recognize(src: str, request: Request, response: Response):
    data = deepgram.transcribe(await request.body(), src)
    print(data)

    return {"transcription": data}
    
@app.options("/recognize/deepgram")
def whisper_recognize():
    return Response(status_code=200)