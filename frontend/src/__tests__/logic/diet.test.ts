/**
 * Tests for diet/nutrition logic:
 * macro calculations, water tracking, diet plan generation.
 */
import { describe, it, expect } from 'vitest'

// ── Macro calculation helpers ────────────────────────────────────────────────

interface FoodEntry {
  calories: number
  protein: number
  carbs: number
  fat: number
  quantity: number
}

function calcMacros(entries: FoodEntry[]) {
  return entries.reduce(
    (acc, e) => {
      const factor = e.quantity / 100
      return {
        calories: acc.calories + Math.round(e.calories * factor),
        protein:  acc.protein  + Math.round(e.protein  * factor),
        carbs:    acc.carbs    + Math.round(e.carbs    * factor),
        fat:      acc.fat      + Math.round(e.fat      * factor),
      }
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  )
}

function glassesFromMl(ml: number): number {
  return Math.floor(ml / 250)
}

function remainingGlasses(waterMl: number, targetMl: number): number {
  const remaining = targetMl - waterMl
  return Math.max(0, Math.ceil(remaining / 250))
}

function waterPercent(waterMl: number, targetMl: number): number {
  return Math.min(100, Math.round((waterMl / targetMl) * 100))
}

// Diet plan macros from TDEE
function planMacros(calories: number, weightKg: number) {
  return {
    protein: Math.round(weightKg * 2),
    carbs:   Math.round((calories * 0.4) / 4),
    fat:     Math.round((calories * 0.25) / 9),
  }
}

function mealSplit(calories: number) {
  return {
    breakfast: Math.round(calories * 0.25),
    lunch:     Math.round(calories * 0.35),
    snack:     Math.round(calories * 0.15),
    dinner:    Math.round(calories * 0.25),
  }
}

// ─────────────────────────────────────────────────────────────────────────────

describe('calcMacros — entry aggregation', () => {
  it('sums calories from multiple entries', () => {
    const entries: FoodEntry[] = [
      { calories: 200, protein: 20, carbs: 10, fat: 5, quantity: 100 },
      { calories: 300, protein: 30, carbs: 20, fat: 8, quantity: 100 },
    ]
    expect(calcMacros(entries).calories).toBe(500)
  })

  it('scales by quantity (150g of 100kcal/100g = 150kcal)', () => {
    const entries: FoodEntry[] = [
      { calories: 100, protein: 10, carbs: 10, fat: 2, quantity: 150 },
    ]
    expect(calcMacros(entries).calories).toBe(150)
    expect(calcMacros(entries).protein).toBe(15)
  })

  it('returns zeros for empty list', () => {
    const result = calcMacros([])
    expect(result).toEqual({ calories: 0, protein: 0, carbs: 0, fat: 0 })
  })

  it('sums protein correctly', () => {
    const entries: FoodEntry[] = [
      { calories: 165, protein: 31, carbs: 0, fat: 3.6, quantity: 100 },
      { calories: 148, protein: 9,  carbs: 11, fat: 8,  quantity: 100 },
    ]
    expect(calcMacros(entries).protein).toBe(40)
  })

  it('handles fractional quantities', () => {
    const entries: FoodEntry[] = [
      { calories: 100, protein: 10, carbs: 5, fat: 2, quantity: 50 },
    ]
    expect(calcMacros(entries).calories).toBe(50)
    expect(calcMacros(entries).protein).toBe(5)
  })
})

describe('water tracking', () => {
  it('converts ml to glasses (250ml each)', () => {
    expect(glassesFromMl(0)).toBe(0)
    expect(glassesFromMl(250)).toBe(1)
    expect(glassesFromMl(1000)).toBe(4)
    expect(glassesFromMl(2500)).toBe(10)
  })

  it('floors partial glasses', () => {
    expect(glassesFromMl(300)).toBe(1)
    expect(glassesFromMl(749)).toBe(2)
  })

  it('calculates remaining glasses correctly', () => {
    expect(remainingGlasses(0, 2500)).toBe(10)
    expect(remainingGlasses(2500, 2500)).toBe(0)
    expect(remainingGlasses(2000, 2500)).toBe(2)
  })

  it('remaining glasses never goes negative', () => {
    expect(remainingGlasses(3000, 2500)).toBe(0)
  })

  it('calculates water percentage', () => {
    expect(waterPercent(0, 2500)).toBe(0)
    expect(waterPercent(1250, 2500)).toBe(50)
    expect(waterPercent(2500, 2500)).toBe(100)
  })

  it('water percentage caps at 100', () => {
    expect(waterPercent(3000, 2500)).toBe(100)
  })
})

describe('planMacros — diet plan macro targets', () => {
  it('protein = 2g per kg of bodyweight', () => {
    expect(planMacros(2000, 80).protein).toBe(160)
    expect(planMacros(2000, 60).protein).toBe(120)
  })

  it('carbs = 40% of calories / 4 kcal per gram', () => {
    const { carbs } = planMacros(2000, 80)
    expect(carbs).toBe(Math.round((2000 * 0.4) / 4)) // 200g
  })

  it('fat = 25% of calories / 9 kcal per gram', () => {
    const { fat } = planMacros(2000, 80)
    expect(fat).toBe(Math.round((2000 * 0.25) / 9)) // ~56g
  })
})

describe('mealSplit — calorie distribution', () => {
  const cals = 2000

  it('breakfast = 25% of daily calories', () => {
    expect(mealSplit(cals).breakfast).toBe(500)
  })

  it('lunch = 35% of daily calories', () => {
    expect(mealSplit(cals).lunch).toBe(700)
  })

  it('snack = 15% of daily calories', () => {
    expect(mealSplit(cals).snack).toBe(300)
  })

  it('dinner = 25% of daily calories', () => {
    expect(mealSplit(cals).dinner).toBe(500)
  })

  it('all meals sum to 100% (±1 due to rounding)', () => {
    const s = mealSplit(cals)
    const total = s.breakfast + s.lunch + s.snack + s.dinner
    expect(total).toBeCloseTo(cals, -1)
  })
})
