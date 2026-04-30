<?php

namespace App\Http\Controllers;

use App\Models\FoodItem;
use App\Services\OpenFoodFactsService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;

class FoodController extends Controller
{
    public function __construct(private OpenFoodFactsService $offService) {}

    public function index(): JsonResponse
    {
        $foods = QueryBuilder::for(FoodItem::class)
            ->allowedFilters([
                AllowedFilter::partial('name'),
                AllowedFilter::exact('brand'),
            ])
            ->allowedSorts(['name', 'calories', 'created_at'])
            ->paginate(20);

        return response()->json(['success' => true, 'data' => $foods]);
    }

    public function search(Request $request): JsonResponse
    {
        $query = $request->get('q', '');

        // Search local DB first
        $local = FoodItem::where('name', 'ILIKE', "%{$query}%")
            ->orWhere('brand', 'ILIKE', "%{$query}%")
            ->limit(10)
            ->get();

        // Then supplement with Open Food Facts API
        $remote = $this->offService->search($query);

        return response()->json([
            'success' => true,
            'data'    => ['local' => $local, 'remote' => $remote],
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $food = FoodItem::findOrFail($id);
        return response()->json(['success' => true, 'data' => $food]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'         => 'required|string|max:255',
            'calories'     => 'required|numeric|min:0',
            'protein'      => 'required|numeric|min:0',
            'carbs'        => 'required|numeric|min:0',
            'fat'          => 'required|numeric|min:0',
            'serving_size' => 'required|numeric|min:1',
            'serving_unit' => 'required|string',
            'brand'        => 'nullable|string',
            'barcode'      => 'nullable|string|unique:food_items',
        ]);

        $food = FoodItem::create([
            ...$validated,
            'created_by_user_id' => $request->user_id,
            'source'             => 'custom',
        ]);

        return response()->json(['success' => true, 'data' => $food], 201);
    }
}
