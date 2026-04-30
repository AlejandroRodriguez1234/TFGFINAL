from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


class RecommendationRequest(BaseModel):
    goal:           str
    current_weight: float
    target_weight:  Optional[float] = None
    workouts_week:  int  = 3
    sleep_hours:    float = 7.0
    stress_level:   int  = 5   # 1-10
    diet_adherence: int  = 70  # percentage


@router.post("/workout")
def workout_recommendation(req: RecommendationRequest):
    recs = []

    if req.workouts_week < 3:
        recs.append({"type": "frequency", "priority": "high",
                     "message": "Entrena al menos 3-4 veces por semana para ver resultados consistentes",
                     "action": "Añade 1-2 sesiones más a tu rutina"})

    if req.sleep_hours < 7:
        recs.append({"type": "recovery", "priority": "high",
                     "message": "Duermes menos de 7 horas: el sueño es cuando tu músculo crece",
                     "action": "Prioriza dormir 7-9 horas; puede ser lo que más impacte tu progreso"})

    if req.stress_level >= 7:
        recs.append({"type": "stress", "priority": "medium",
                     "message": "Estrés elevado: el cortisol alto puede dificultar la pérdida de grasa",
                     "action": "Incluye meditación, yoga o cardio de baja intensidad"})

    if req.diet_adherence < 60:
        recs.append({"type": "nutrition", "priority": "high",
                     "message": "La dieta es el factor #1. Con un 60% de adherencia los resultados son lentos",
                     "action": "Simplifica tu plan: menos restricciones, más consistencia"})

    if req.goal == "lose_weight" and req.workouts_week >= 4:
        recs.append({"type": "cardio", "priority": "medium",
                     "message": "Añade 2-3 sesiones de cardio moderado (150-170 ppm) para acelerar el déficit",
                     "action": "30 min en bicicleta o caminata rápida en días de descanso"})

    if req.goal == "gain_muscle":
        recs.append({"type": "progressive_overload", "priority": "high",
                     "message": "La sobrecarga progresiva es la clave para ganar músculo",
                     "action": "Aumenta el peso o reps cada 1-2 semanas en tus ejercicios principales"})

    return {"success": True, "data": {"recommendations": recs, "total": len(recs)}}


@router.get("/exercise/{muscle_group}")
def exercise_recommendations(muscle_group: str):
    library = {
        "chest":     ["Press de banca", "Press inclinado", "Fondos", "Aperturas con mancuernas"],
        "back":      ["Dominadas", "Remo con barra", "Jalón al pecho", "Peso muerto rumano"],
        "shoulders": ["Press militar", "Elevaciones laterales", "Face pulls", "Press Arnold"],
        "legs":      ["Sentadilla", "Peso muerto", "Prensa", "Extensión de cuádriceps", "Curl femoral"],
        "arms":      ["Curl de bíceps", "Extensión de tríceps en polea", "Martillo", "Fondos cerrados"],
        "core":      ["Plancha", "Crunch con rueda", "Pallof press", "Plancha lateral"],
        "glutes":    ["Hip thrust", "Sentadilla búlgara", "Abductor en máquina", "Patada de glúteo"],
    }
    exercises = library.get(muscle_group.lower(), [])
    return {"success": True, "data": {"muscle_group": muscle_group, "exercises": exercises}}
