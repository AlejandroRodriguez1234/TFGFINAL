<?php

namespace App\Http\Controllers;

use App\Models\MealEntry;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;

class MealLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $entries = MealEntry::with('foodItem')
            ->where('user_id', $request->user_id)
            ->orderBy('logged_at', 'desc')
            ->paginate(50);

        return response()->json(['success' => true, 'data' => $entries]);
    }

    public function today(Request $request): JsonResponse
    {
        $entries = MealEntry::with('foodItem')
            ->where('user_id', $request->user_id)
            ->whereDate('logged_at', today())
            ->orderBy('logged_at')
            ->get();

        return response()->json(['success' => true, 'data' => $entries]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'food_item_id' => 'required|uuid|exists:food_items,id',
            'meal_type'    => 'required|in:breakfast,lunch,dinner,snack',
            'quantity'     => 'required|numeric|min:1',
            'logged_at'    => 'nullable|date',
        ]);

        $entry = MealEntry::create([
            ...$validated,
            'user_id'   => $request->user_id,
            'logged_at' => $validated['logged_at'] ?? now(),
        ]);

        return response()->json(['success' => true, 'data' => $entry->load('foodItem')], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $entry = MealEntry::where('id', $id)->where('user_id', $request->user_id)->firstOrFail();
        $entry->update($request->only(['quantity', 'meal_type', 'logged_at']));
        return response()->json(['success' => true, 'data' => $entry->fresh('foodItem')]);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        MealEntry::where('id', $id)->where('user_id', $request->user_id)->firstOrFail()->delete();
        return response()->json(['success' => true, 'data' => null]);
    }

    public function macrosSummary(Request $request): JsonResponse
    {
        $date    = $request->get('date', today()->toDateString());
        $entries = MealEntry::with('foodItem')
            ->where('user_id', $request->user_id)
            ->whereDate('logged_at', $date)
            ->get();

        $totals = ['calories' => 0, 'protein' => 0, 'carbs' => 0, 'fat' => 0];

        foreach ($entries as $entry) {
            $ratio = $entry->quantity / $entry->foodItem->serving_size;
            $totals['calories'] += $entry->foodItem->calories * $ratio;
            $totals['protein']  += $entry->foodItem->protein  * $ratio;
            $totals['carbs']    += $entry->foodItem->carbs    * $ratio;
            $totals['fat']      += $entry->foodItem->fat      * $ratio;
        }

        return response()->json([
            'success' => true,
            'data'    => [
                'date'   => $date,
                'totals' => array_map(fn($v) => round($v, 1), $totals),
                'byMeal' => $entries->groupBy('meal_type')->map(fn($g) => [
                    'calories' => round($g->sum(fn($e) => ($e->foodItem->calories / $e->foodItem->serving_size) * $e->quantity), 1),
                    'items'    => $g->count(),
                ]),
            ],
        ]);
    }
}
