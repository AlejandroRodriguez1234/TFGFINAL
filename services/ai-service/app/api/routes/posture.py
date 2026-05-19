from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.posture_analyzer import analyze_posture, PostureAnalysisResult
from app.core.config import settings

router = APIRouter()


@router.post("/analyze", response_model=dict)
async def analyze_posture_endpoint(image: UploadFile = File(...)):
    """
    Upload an image (JPG/PNG) to analyze posture using MediaPipe.
    Returns score (0-100), detected issues and correction tips.
    """
    if image.content_type not in ("image/jpeg", "image/png", "image/webp"):
        raise HTTPException(400, "Formato no soportado. Usa JPG, PNG o WebP.")

    content = await image.read()
    if len(content) > settings.max_image_size_mb * 1024 * 1024:
        raise HTTPException(413, f"Imagen demasiado grande (máx {settings.max_image_size_mb}MB)")

    try:
        result: PostureAnalysisResult = analyze_posture(content)
    except ValueError as e:
        raise HTTPException(422, str(e))

    return {
        "success": True,
        "data": {
            "score":               result.score,
            "overall":             result.overall,
            "landmarks_detected":  result.landmarks_detected,
            "issues": [
                {
                    "name":        i.name,
                    "severity":    i.severity,
                    "description": i.description,
                    "correction":  i.correction,
                }
                for i in result.issues
            ],
            "recommendations": result.recommendations,
        },
    }
