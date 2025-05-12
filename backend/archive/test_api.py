from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class TestRequest(BaseModel):
    name: str

@app.post("/test")
async def test_endpoint(request: TestRequest):
    return {
        "message": f"Hello, {request.name}!"
    } 