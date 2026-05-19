<?php

namespace App\Http\Controllers;

use App\Models\FoodItem;
use App\Services\OpenFoodFactsService;
use Illuminate\Http\JsonResponse;

class BarcodeController extends Controller
{
    public function __construct(private OpenFoodFactsService $offService) {}

    public function lookup(string $barcode): JsonResponse
    {
        // Check local database first
        $local = FoodItem::where('barcode', $barcode)->first();
        if ($local) {
            return response()->json(['success' => true, 'data' => $local, 'source' => 'local']);
        }

        // Fetch from Open Food Facts
        $product = $this->offService->getByBarcode($barcode);
        if (!$product) {
            return response()->json(['success' => false, 'message' => 'Producto no encontrado'], 404);
        }

        // Cache to local DB for future queries
        $saved = FoodItem::create([
            'name'         => $product['name'],
            'brand'        => $product['brand'] ?? null,
            'barcode'      => $barcode,
            'calories'     => $product['calories'],
            'protein'      => $product['protein'],
            'carbs'        => $product['carbs'],
            'fat'          => $product['fat'],
            'fiber'        => $product['fiber'] ?? null,
            'sugar'        => $product['sugar'] ?? null,
            'serving_size' => $product['serving_size'] ?? 100,
            'serving_unit' => $product['serving_unit'] ?? 'g',
            'image_url'    => $product['image_url'] ?? null,
            'source'       => 'open_food_facts',
        ]);

        return response()->json(['success' => true, 'data' => $saved, 'source' => 'open_food_facts']);
    }
}
