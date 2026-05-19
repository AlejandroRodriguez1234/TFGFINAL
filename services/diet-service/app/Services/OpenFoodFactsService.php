<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OpenFoodFactsService
{
    private string $baseUrl = 'https://world.openfoodfacts.org/api/v2';

    public function getByBarcode(string $barcode): ?array
    {
        return Cache::remember("off:barcode:{$barcode}", 86400, function () use ($barcode) {
            try {
                $response = Http::timeout(5)
                    ->get("{$this->baseUrl}/product/{$barcode}.json");

                if (!$response->ok()) return null;

                $data    = $response->json();
                $product = $data['product'] ?? null;
                if (!$product) return null;

                return $this->normalizeProduct($product);
            } catch (\Exception $e) {
                Log::warning("OpenFoodFacts barcode lookup failed: {$e->getMessage()}");
                return null;
            }
        });
    }

    public function search(string $query): array
    {
        return Cache::remember("off:search:" . md5($query), 3600, function () use ($query) {
            try {
                $response = Http::timeout(5)->get("{$this->baseUrl}/search", [
                    'search_terms'   => $query,
                    'search_simple'  => 1,
                    'action'         => 'process',
                    'json'           => 1,
                    'page_size'      => 10,
                    'fields'         => 'product_name,brands,nutriments,serving_size,image_front_small_url,code',
                ]);

                if (!$response->ok()) return [];

                return collect($response->json('products', []))
                    ->map(fn($p) => $this->normalizeProduct($p))
                    ->filter()
                    ->values()
                    ->toArray();
            } catch (\Exception $e) {
                Log::warning("OpenFoodFacts search failed: {$e->getMessage()}");
                return [];
            }
        });
    }

    private function normalizeProduct(array $product): ?array
    {
        $n = $product['nutriments'] ?? [];

        $name = $product['product_name'] ?? $product['generic_name'] ?? null;
        if (!$name) return null;

        return [
            'name'         => $name,
            'brand'        => $product['brands'] ?? null,
            'barcode'      => $product['code']   ?? null,
            'calories'     => (float) ($n['energy-kcal_100g'] ?? $n['energy_100g'] ?? 0) / ($n['energy_100g'] ? 4.184 : 1),
            'protein'      => (float) ($n['proteins_100g'] ?? 0),
            'carbs'        => (float) ($n['carbohydrates_100g'] ?? 0),
            'fat'          => (float) ($n['fat_100g'] ?? 0),
            'fiber'        => (float) ($n['fiber_100g'] ?? 0),
            'sugar'        => (float) ($n['sugars_100g'] ?? 0),
            'sodium'       => (float) ($n['sodium_100g'] ?? 0),
            'serving_size' => 100,
            'serving_unit' => 'g',
            'image_url'    => $product['image_front_small_url'] ?? null,
        ];
    }
}
