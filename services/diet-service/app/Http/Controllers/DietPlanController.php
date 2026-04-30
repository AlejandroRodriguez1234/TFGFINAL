<?php

namespace App\Http\Controllers;

use App\Models\DietPlan;
use App\Services\DietPlanGeneratorService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DietPlanController extends Controller
{
    public function __construct(private DietPlanGeneratorService $generator) {}

    public function index(Request $request): JsonResponse
    {
        $plans = DietPlan::where('user_id', $request->user_id)->orderBy('created_at', 'desc')->get();
        return response()->json(['success' => true, 'data' => $plans]);
    }

    public function active(Request $request): JsonResponse
    {
        $plan = DietPlan::where('user_id', $request->user_id)->where('is_active', true)->first();
        return response()->json(['success' => true, 'data' => $plan]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'            => 'required|string',
            'target_calories' => 'required|integer|min:500',
            'target_protein'  => 'required|numeric|min:0',
            'target_carbs'    => 'required|numeric|min:0',
            'target_fat'      => 'required|numeric|min:0',
            'start_date'      => 'required|date',
            'end_date'        => 'nullable|date|after:start_date',
        ]);

        $plan = DietPlan::create([...$validated, 'user_id' => $request->user_id]);
        return response()->json(['success' => true, 'data' => $plan], 201);
    }

    public function generate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'goal'           => 'required|in:lose_weight,gain_muscle,maintain,performance',
            'weight'         => 'required|numeric',
            'height'         => 'required|numeric',
            'age'            => 'required|integer',
            'gender'         => 'required|in:male,female',
            'activity_level' => 'required|in:sedentary,light,moderate,active,very_active',
        ]);

        $plan = $this->generator->generate($validated);
        return response()->json(['success' => true, 'data' => $plan]);
    }

    public function activate(Request $request, string $id): JsonResponse
    {
        DietPlan::where('user_id', $request->user_id)->update(['is_active' => false]);
        $plan = DietPlan::where('id', $id)->where('user_id', $request->user_id)->firstOrFail();
        $plan->update(['is_active' => true]);
        return response()->json(['success' => true, 'data' => $plan]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $plan = DietPlan::where('id', $id)->where('user_id', $request->user_id)->firstOrFail();
        $plan->update($request->only(['name', 'target_calories', 'target_protein', 'target_carbs', 'target_fat', 'end_date']));
        return response()->json(['success' => true, 'data' => $plan]);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        DietPlan::where('id', $id)->where('user_id', $request->user_id)->firstOrFail()->delete();
        return response()->json(['success' => true, 'data' => null]);
    }
}
