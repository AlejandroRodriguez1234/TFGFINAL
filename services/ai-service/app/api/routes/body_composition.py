from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Literal, Optional
from app.services.body_composition import calculate_body_composition

router = APIRouter()


class BodyCompositionRequest(BaseModel):
    weight_kg:    float = Field(..., ge=30, le=300, description="Peso en kg")
    height_cm:    float = Field(..., ge=100, le=250, description="Altura en cm")
    age:          int   = Field(..., ge=10,  le=100)
    gender:       Literal["male", "female"]
    activity:     Literal["sedentary", "light", "moderate", "active", "very_active"]
    body_fat_pct: Optional[float] = Field(None, ge=3, le=60, description="% grasa corporal (opcional)")


@router.post("/calculate")
def calculate_composition(req: BodyCompositionRequest):
    result = calculate_body_composition(
        weight_kg    = req.weight_kg,
        height_cm    = req.height_cm,
        age          = req.age,
        gender       = req.gender,
        activity     = req.activity,
        body_fat_pct = req.body_fat_pct,
    )
    return {
        "success": True,
        "data": {
            "bmr":              result.bmr,
            "tdee":             result.tdee,
            "bmi":              result.bmi,
            "bmi_category":     result.bmi_category,
            "body_fat_pct":     result.body_fat_estimate,
            "lean_mass_kg":     result.lean_mass,
            "fat_mass_kg":      result.fat_mass,
            "calorie_targets":  result.target_calories,
            "macro_targets":    result.macro_targets,
        },
    }
