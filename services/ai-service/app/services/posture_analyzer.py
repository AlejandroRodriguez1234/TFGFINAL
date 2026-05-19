"""
Posture analysis using MediaPipe Pose.
Detects key landmarks and evaluates postural alignment.
"""
import io
import math
from dataclasses import dataclass, field
from typing import Optional

import cv2
import mediapipe as mp
import numpy as np
from PIL import Image


mp_pose = mp.solutions.pose


@dataclass
class PostureIssue:
    name: str
    severity: str          # low | medium | high
    description: str
    correction: str


@dataclass
class PostureAnalysisResult:
    score: int             # 0-100
    overall: str           # good | fair | poor
    issues: list[PostureIssue] = field(default_factory=list)
    recommendations: list[str] = field(default_factory=list)
    landmarks_detected: bool = True


def _angle(a, b, c) -> float:
    """Calculate angle at point b formed by a-b-c."""
    ax, ay = a.x - b.x, a.y - b.y
    cx, cy = c.x - b.x, c.y - b.y
    dot    = ax * cx + ay * cy
    mag    = math.sqrt(ax**2 + ay**2) * math.sqrt(cx**2 + cy**2)
    if mag == 0:
        return 0.0
    return math.degrees(math.acos(max(-1, min(1, dot / mag))))


def analyze_posture(image_bytes: bytes) -> PostureAnalysisResult:
    """Analyze posture from an image and return structured results."""
    img_array = np.frombuffer(image_bytes, np.uint8)
    img_bgr   = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    if img_bgr is None:
        raise ValueError("No se pudo decodificar la imagen")

    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)

    with mp_pose.Pose(static_image_mode=True, model_complexity=2, min_detection_confidence=0.5) as pose:
        results = pose.process(img_rgb)

    if not results.pose_landmarks:
        return PostureAnalysisResult(
            score=0, overall="poor",
            issues=[PostureIssue("Sin detección", "high", "No se detectó ninguna persona en la imagen", "Asegúrate de que el cuerpo completo sea visible")],
            landmarks_detected=False,
        )

    lm = results.pose_landmarks.landmark
    issues: list[PostureIssue] = []
    deductions = 0

    # ── Shoulder symmetry ─────────────────────────────────────────────────
    l_shoulder = lm[mp_pose.PoseLandmark.LEFT_SHOULDER]
    r_shoulder = lm[mp_pose.PoseLandmark.RIGHT_SHOULDER]
    shoulder_diff = abs(l_shoulder.y - r_shoulder.y)
    if shoulder_diff > 0.04:
        severity = "high" if shoulder_diff > 0.08 else "medium"
        issues.append(PostureIssue(
            "Hombros desnivelados",
            severity,
            f"Diferencia de altura: {shoulder_diff:.2%}",
            "Trabaja la movilidad y fortalece el trapecio con ejercicios unilaterales",
        ))
        deductions += 20 if severity == "high" else 10

    # ── Head forward posture ───────────────────────────────────────────────
    nose = lm[mp_pose.PoseLandmark.NOSE]
    mid_shoulder_x = (l_shoulder.x + r_shoulder.x) / 2
    head_forward = abs(nose.x - mid_shoulder_x)
    if head_forward > 0.05:
        issues.append(PostureIssue(
            "Cabeza adelantada",
            "medium",
            "La cabeza está proyectada hacia delante respecto a los hombros",
            "Fortalece los flexores profundos del cuello y trabaja la retracción escapular",
        ))
        deductions += 15

    # ── Hip symmetry ──────────────────────────────────────────────────────
    l_hip = lm[mp_pose.PoseLandmark.LEFT_HIP]
    r_hip = lm[mp_pose.PoseLandmark.RIGHT_HIP]
    hip_diff = abs(l_hip.y - r_hip.y)
    if hip_diff > 0.03:
        issues.append(PostureIssue(
            "Caderas desniveladas",
            "medium" if hip_diff < 0.06 else "high",
            "Las caderas no están alineadas horizontalmente",
            "Trabaja los glúteos medios y el cuadrado lumbar de forma unilateral",
        ))
        deductions += 15

    # ── Knee valgus (squat-like) ───────────────────────────────────────────
    try:
        l_knee = lm[mp_pose.PoseLandmark.LEFT_KNEE]
        r_knee = lm[mp_pose.PoseLandmark.RIGHT_KNEE]
        l_ankle = lm[mp_pose.PoseLandmark.LEFT_ANKLE]
        knee_angle = _angle(l_hip, l_knee, l_ankle)
        if knee_angle < 160:
            issues.append(PostureIssue(
                "Flexión de rodilla detectada",
                "low",
                f"Ángulo de rodilla izquierda: {knee_angle:.0f}°",
                "Para análisis de sentadilla: mantén las rodillas alineadas con los pies",
            ))
            deductions += 5
    except Exception:
        pass

    score   = max(0, 100 - deductions)
    overall = "good" if score >= 75 else "fair" if score >= 50 else "poor"

    recommendations = [
        "Realiza 10 min de movilidad antes de entrenar",
        "Fortalece el core con planchas y ejercicios anti-rotacionales",
    ]
    if score < 75:
        recommendations.insert(0, "Considera consultar con un fisioterapeuta para un análisis detallado")

    return PostureAnalysisResult(
        score=score,
        overall=overall,
        issues=issues,
        recommendations=recommendations,
    )
