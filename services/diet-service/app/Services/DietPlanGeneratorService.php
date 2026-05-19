<?php

namespace App\Services;

class DietPlanGeneratorService
{
    private array $activityMultipliers = [
        'sedentary'  => 1.2,
        'light'      => 1.375,
        'moderate'   => 1.55,
        'active'     => 1.725,
        'very_active'=> 1.9,
    ];

    public function generate(array $params): array
    {
        $bmr  = $this->calculateBMR($params);
        $tdee = $bmr * $this->activityMultipliers[$params['activity_level']];

        [$calories, $protein, $carbs, $fat] = $this->adjustForGoal($tdee, $params['weight'], $params['goal']);

        return [
            'name'            => $this->getPlanName($params['goal']),
            'target_calories' => (int) round($calories),
            'target_protein'  => round($protein, 1),
            'target_carbs'    => round($carbs, 1),
            'target_fat'      => round($fat, 1),
            'bmr'             => (int) round($bmr),
            'tdee'            => (int) round($tdee),
            'goal'            => $params['goal'],
            'meal_split'      => $this->getMealSplit($calories),
            'tips'            => $this->getTips($params['goal']),
        ];
    }

    private function calculateBMR(array $p): float
    {
        // Mifflin-St Jeor equation
        $base = 10 * $p['weight'] + 6.25 * $p['height'] - 5 * $p['age'];
        return $p['gender'] === 'male' ? $base + 5 : $base - 161;
    }

    private function adjustForGoal(float $tdee, float $weight, string $goal): array
    {
        return match ($goal) {
            'lose_weight'  => [$tdee - 500, $weight * 2.2, ($tdee - 500) * 0.35 / 4, ($tdee - 500) * 0.25 / 9],
            'gain_muscle'  => [$tdee + 300, $weight * 2.0, ($tdee + 300) * 0.45 / 4, ($tdee + 300) * 0.25 / 9],
            'performance'  => [$tdee + 200, $weight * 1.8, ($tdee + 200) * 0.50 / 4, ($tdee + 200) * 0.25 / 9],
            default        => [$tdee,       $weight * 1.6, $tdee * 0.40 / 4,          $tdee * 0.30 / 9],
        };
    }

    private function getMealSplit(float $calories): array
    {
        return [
            'breakfast' => (int) round($calories * 0.25),
            'lunch'     => (int) round($calories * 0.35),
            'snack'     => (int) round($calories * 0.10),
            'dinner'    => (int) round($calories * 0.30),
        ];
    }

    private function getPlanName(string $goal): string
    {
        return match ($goal) {
            'lose_weight' => 'Plan de pérdida de grasa',
            'gain_muscle' => 'Plan de ganancia muscular',
            'performance' => 'Plan de rendimiento deportivo',
            default       => 'Plan de mantenimiento',
        };
    }

    private function getTips(string $goal): array
    {
        $common = ['Bebe al menos 2.5L de agua al día', 'Prioriza alimentos mínimamente procesados'];
        return match ($goal) {
            'lose_weight' => [...$common, 'Aumenta el consumo de fibra para mayor saciedad', 'Consume proteína en cada comida'],
            'gain_muscle' => [...$common, 'Come cada 3-4 horas para maximizar síntesis proteica', 'No te saltes el post-entreno'],
            default       => $common,
        };
    }
}
