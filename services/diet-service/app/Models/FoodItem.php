<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FoodItem extends Model
{
    use HasUuids;

    protected $table = 'food_items';

    protected $fillable = [
        'name', 'brand', 'barcode',
        'calories', 'protein', 'carbs', 'fat',
        'fiber', 'sugar', 'sodium',
        'serving_size', 'serving_unit',
        'image_url', 'source',
        'created_by_user_id',
    ];

    protected $casts = [
        'calories'     => 'float',
        'protein'      => 'float',
        'carbs'        => 'float',
        'fat'          => 'float',
        'fiber'        => 'float',
        'sugar'        => 'float',
        'sodium'       => 'float',
        'serving_size' => 'float',
    ];

    public function mealEntries(): HasMany
    {
        return $this->hasMany(MealEntry::class);
    }

    public function getMacrosPerGramAttribute(): array
    {
        return [
            'calories' => $this->calories / $this->serving_size,
            'protein'  => $this->protein  / $this->serving_size,
            'carbs'    => $this->carbs    / $this->serving_size,
            'fat'      => $this->fat      / $this->serving_size,
        ];
    }
}
