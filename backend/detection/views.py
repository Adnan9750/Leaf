import json
from pathlib import Path

import numpy as np
from PIL import Image
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from ai_edge_litert.interpreter import Interpreter
from rest_framework.permissions import AllowAny

MODELS_DIR = Path(__file__).resolve().parent / "ml_models"

with open(MODELS_DIR / "class_names.json", "r", encoding="utf-8") as f:
    CLASS_NAMES = json.load(f)

interpreter = Interpreter(model_path=str(MODELS_DIR / "my_model.tflite"))
interpreter.allocate_tensors()
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()


def preprocess_image(image: Image.Image) -> np.ndarray:
    height, width = input_details[0]["shape"][1:3]
    image = image.convert("RGB").resize((int(width), int(height)))
    arr = np.array(image, dtype=np.float32) / 255.0
    return np.expand_dims(arr, axis=0)


class PredictView(APIView):

    permission_classes = [AllowAny]          # <- allow any client
    authentication_classes = []     
    parser_classes = [MultiPartParser]

    def post(self, request):
        file = request.FILES.get("image")
        if file is None:
            return Response({"error": "No image provided (field name: image)"}, status=400)

        try:
            img = Image.open(file)
            interpreter.set_tensor(input_details[0]["index"], preprocess_image(img))
            interpreter.invoke()
            probs = np.squeeze(interpreter.get_tensor(output_details[0]["index"]))
        except Exception as e:
            return Response({"error": str(e)}, status=500)

        idx = int(np.argmax(probs))
        return Response({
            "prediction": CLASS_NAMES[idx],
            "confidence": round(float(probs[idx]), 4),
        })