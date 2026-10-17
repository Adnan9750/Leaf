import json
import logging
import threading
from pathlib import Path

import numpy as np
from PIL import Image
from asgiref.sync import sync_to_async
from adrf.decorators import api_view
from rest_framework.decorators import (
    authentication_classes, parser_classes, permission_classes,
)
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import AllowAny
from ai_edge_litert.interpreter import Interpreter

from .utils import success, error   # your helpers (small versions at the bottom)

logger = logging.getLogger(__name__)

MODELS_DIR = Path(__file__).resolve().parent / "ml_models"
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_SIZE = 5 * 1024 * 1024        # 5 MB
LOW_CONFIDENCE = 60               # percent

CLASS_NAMES = json.loads((MODELS_DIR / "class_names.json").read_text(encoding="utf-8"))
DISEASE_INFO = json.loads((MODELS_DIR / "disease_info.json").read_text(encoding="utf-8"))

_missing = [c for c in CLASS_NAMES if c not in DISEASE_INFO]
if _missing:
    logger.warning("disease_info.json has no entry for: %s", _missing)

interpreter = Interpreter(model_path=str(MODELS_DIR / "my_model.tflite"))
interpreter.allocate_tensors()
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()
_lock = threading.Lock()          # one interpreter must not run two images at once


def preprocess_image(image: Image.Image) -> np.ndarray:
    height, width = input_details[0]["shape"][1:3]
    image = image.convert("RGB").resize((int(width), int(height)))
    arr = np.array(image, dtype=np.float32) / 255.0   # must match training
    return np.expand_dims(arr, axis=0)


def run_inference(image: Image.Image) -> np.ndarray:
    arr = preprocess_image(image)
    with _lock:
        interpreter.set_tensor(input_details[0]["index"], arr)
        interpreter.invoke()
        return np.squeeze(interpreter.get_tensor(output_details[0]["index"])).copy()


@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
@parser_classes([MultiPartParser])
async def predict_view(request):
    try:
        file = request.FILES.get("image")
        if file is None:
            return error("No image provided (field name: image)", 400)
        if file.content_type not in ALLOWED_TYPES:
            return error("Only JPG, PNG or WEBP images are allowed", 400)
        if file.size > MAX_SIZE:
            return error("Image must be under 5 MB", 400)

        try:
            img = Image.open(file)
            img.load()
        except Exception:
            return error("Invalid image file", 400)

        probs = await sync_to_async(run_inference)(img)

        top = np.argsort(probs)[::-1][:3]
        top3 = [
            {"label": CLASS_NAMES[int(i)], "confidence": round(float(probs[i]) * 100, 2)}
            for i in top
        ]
        label = top3[0]["label"]
        confidence = top3[0]["confidence"]
        crop = label.partition("_")[0]

        # Low confidence: don't give treatment advice for a guess
        if confidence < LOW_CONFIDENCE:
            return success(
                {
                    "low_confidence": True,
                    "confidence": confidence,
                    "possible_matches": top3,
                },
                message="Not sure about this image. Please upload a clear photo of a single leaf.",
            )

        info = DISEASE_INFO.get(label, {})
        is_healthy = info.get("type") == "Healthy"

        data = {
            "low_confidence": False,
            "crop": info.get("crop", crop),
            "disease": info.get("name", label),
            "is_healthy": is_healthy,
            "confidence": confidence,
            "type": info.get("type"),
            "symptoms": info.get("symptoms", []),
            "causes": info.get("causes", ""),
            "treatment": info.get("treatment", []),
            "prevention": info.get("prevention", []),
            "other_possibilities": top3[1:],
            "disclaimer": "This is an AI suggestion, not a confirmed diagnosis. "
                          "For treatment and dosage, ask your local agriculture office.",
        }
        message = "Leaf looks healthy" if is_healthy else f"{data['disease']} detected in {data['crop']}"
        return success(data, message=message)

    except Exception:
        logger.exception("Prediction failed")
        return error("Something went wrong while analysing the image", 500)