"""
routes.py — FastAPI route definitions for the Colorization API.

Endpoints:
    GET  /          → Health check.
    POST /colorize  → Upload an image and receive a colourised PNG.
"""

import io

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse, StreamingResponse

from app.inference import predict

router = APIRouter()


# ── Health check ─────────────────────────────────────────────────────────

@router.get("/", response_class=JSONResponse)
async def health_check() -> dict:
    """Return a simple status message to confirm the server is running."""
    return {"status": "server running"}


# ── Colorize endpoint ───────────────────────────────────────────────────

@router.post("/colorize")
async def colorize(file: UploadFile = File(...)):
    """
    Accept an image upload, run the colorization model, and return
    the colourised result as a PNG image.

    **Request**: ``multipart/form-data`` with field ``file`` (image).

    **Response**: ``image/png`` — the colourised output.
    """
    # Validate content type
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail=f"Expected an image file, got '{file.content_type}'.",
        )

    try:
        image_bytes = await file.read()
        colorized_image = predict(image_bytes)

        # Encode the PIL Image as PNG into an in-memory buffer
        buffer = io.BytesIO()
        colorized_image.save(buffer, format="PNG")
        buffer.seek(0)

        return StreamingResponse(
            buffer,
            media_type="image/png",
            headers={"Content-Disposition": "inline; filename=colorized.png"},
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Inference failed: {exc}",
        )
