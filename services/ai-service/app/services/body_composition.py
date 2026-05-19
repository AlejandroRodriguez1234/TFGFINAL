"""
Body composition calculations:
BMR, TDEE, body fat estimates, macro targets.
"""
from dataclasses import dataclass
from typing import Literal


@dataclass
class BodyCompositionResult:
    bmr:              float
    tdee:             float
    bmi:              float
    bmi_category:     str
    body_fat_estimate: float
    lean_mass:        float
    fat_mass:         float
    target_calories:  dict[str, int]   # lose / maintain / gain
    macro_targets:    dict[str, dict]  # calories / protein / carbs / fat per goal


ActivityLevel = Literal["sedentary", "light", "moderate", "active", "very_active"]
Gender        = Literal["male", "female"]
Goal          = Literal["lose_weight", "gain_muscle", "maintain", "performance"]

ACTIVITY_MULTIPLIERS: dict[str, float] = {
    "sedentary":   1.2,
    "light":       1.375,
    "moderate":    1.55,
    "active":      1.725,
    "very_active": 1.9,
}


def calculate_body_composition(
    weight_kg: float,
    height_cm: float,
    age:       int,
    gender:    Gender,
    activity:  ActivityLevel,
    body_fat_pct: float | None = None,
) -> BodyCompositionResult:

    # ── BMR (Mifflin-St Jeor) ─────────────────────────────────────────────
    bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age
    bmr = bmr + 5 if gender == "male" else bmr - 161

    # ── TDEE ─────────────────────────────────────────────────────────────
    tdee = bmr * ACTIVITY_MULTIPLIERS[activity]

    # ── BMI ──────────────────────────────────────────────────────────────
    height_m = height_cm / 100
    bmi      = round(weight_kg / (height_m ** 2), 1)
    bmi_cat  = (
        "Bajo peso"       if bmi < 18.5 else
        "Normal"          if bmi < 25   else
        "Sobrepeso"       if bmi < 30   else
        "Obesidad"
    )

    # ── Body fat estimate (Navy/BMI-based if not provided) ────────────────
    if body_fat_pct is None:
        # Deurenberg formula (rough estimate)
        body_fat_pct = 1.20 * bmi + 0.23 * age - (10.8 if gender == "male" else 0) - 5.4
        body_fat_pct = max(5.0, min(50.0, round(body_fat_pct, 1)))

    fat_mass  = round(weight_kg * body_fat_pct / 100, 1)
    lean_mass = round(weight_kg - fat_mass, 1)

    # ── Calorie targets ───────────────────────────────────────────────────
    calorie_targets = {
        "lose_weight": int(tdee - 500),
        "maintain":    int(tdee),
        "gain_muscle": int(tdee + 300),
    }

    # ── Macro targets per goal ────────────────────────────────────────────
    macro_targets = {}
    protein_g = weight_kg * 2.0  # 2g per kg

    for goal, cal in calorie_targets.items():
        prot_kcal = protein_g * 4
        fat_kcal  = cal * 0.25
        carb_kcal = cal - prot_kcal - fat_kcal
        macro_targets[goal] = {
            "calories": cal,
            "protein":  round(protein_g, 0),
            "carbs":    round(carb_kcal / 4, 0),
            "fat":      round(fat_kcal  / 9, 0),
        }

    return BodyCompositionResult(
        bmr=round(bmr, 0),
        tdee=round(tdee, 0),
        bmi=bmi,
        bmi_category=bmi_cat,
        body_fat_estimate=body_fat_pct,
        lean_mass=lean_mass,
        fat_mass=fat_mass,
        target_calories=calorie_targets,
        macro_targets=macro_targets,
    )
