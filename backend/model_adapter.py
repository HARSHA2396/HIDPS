import math
import os
from typing import Any, Dict, List, Optional


class BaseModelAdapter:
    runtime = "disabled"

    def predict(self, features: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        return None


class OnnxModelAdapter(BaseModelAdapter):
    runtime = "onnx"

    def __init__(self) -> None:
        self.enabled = False
        self.error: Optional[str] = None
        self.session = None
        self.input_name = ""
        self.feature_order: List[str] = []
        self.labels: List[str] = []

        model_path = os.getenv("ONNX_MODEL_PATH", "").strip()
        feature_order = [
            item.strip() for item in os.getenv("MODEL_FEATURE_ORDER", "").split(",") if item.strip()
        ]
        labels = [item.strip() for item in os.getenv("MODEL_LABELS", "").split(",") if item.strip()]

        if not model_path or not feature_order:
            self.error = "Missing ONNX_MODEL_PATH or MODEL_FEATURE_ORDER."
            return

        try:
            import numpy as np
            import onnxruntime as ort
        except ImportError:
            self.error = "onnxruntime and numpy must be installed for ONNX inference."
            return

        self.np = np
        self.ort = ort
        self.feature_order = feature_order
        self.labels = labels

        try:
            self.session = ort.InferenceSession(model_path, providers=["CPUExecutionProvider"])
        except Exception as exc:
            self.error = f"Could not load ONNX model: {exc}"
            return

        self.input_name = self.session.get_inputs()[0].name
        self.enabled = True

    def _softmax(self, values: List[float]) -> List[float]:
        if not values:
            return []
        highest = max(values)
        exponentials = [math.exp(value - highest) for value in values]
        total = sum(exponentials) or 1.0
        return [item / total for item in exponentials]

    def predict(self, features: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if not self.enabled or self.session is None:
            return None

        vector = [[float(features.get(name, 0.0)) for name in self.feature_order]]
        input_tensor = self.np.asarray(vector, dtype=self.np.float32)
        outputs = self.session.run(None, {self.input_name: input_tensor})
        if not outputs:
            return None

        raw_scores = outputs[0][0].tolist()
        if raw_scores and all(0.0 <= float(value) <= 1.0 for value in raw_scores):
            probabilities = [float(value) for value in raw_scores]
        else:
            probabilities = self._softmax([float(value) for value in raw_scores])

        predicted_index = max(range(len(probabilities)), key=probabilities.__getitem__)
        predicted_label = (
            self.labels[predicted_index]
            if predicted_index < len(self.labels)
            else f"class_{predicted_index}"
        )
        return {
            "attack_type": predicted_label,
            "confidence": round(float(probabilities[predicted_index]), 4),
            "runtime": self.runtime,
            "feature_order": self.feature_order,
        }


def build_model_adapter() -> BaseModelAdapter:
    runtime = os.getenv("MODEL_RUNTIME", "").strip().lower()
    if runtime == "onnx":
        return OnnxModelAdapter()
    return BaseModelAdapter()
