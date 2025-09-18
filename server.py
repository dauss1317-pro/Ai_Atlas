from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

app = FastAPI()
model = SentenceTransformer('all-MiniLM-L6-v2')  # fast & small

class TextRequest(BaseModel):
    text: str

@app.post("/embed")
async def embed(req: TextRequest):
    vec = model.encode(req.text).tolist()
    return {"embedding": vec}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
