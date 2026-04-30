<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MealEntry extends Model
{
    use HasUuids;

    protected $table = 'meal_entries';

    protected $fillable = [
        'user_id', 'food_item_id', 'meal_type',
        'quantity', 'logged_at',
    ];

    protected $casts = [
        'quantity'  => 'float',
        'logged_at' => 'datetime',
    ];

    public function foodItem(): BelongsTo
    {
        return $this->belongsTo(FoodItem::class);
    }

    // Computed macros for the consumed quantity
    public function getCaloriesAttribute(): float
    {
        return ($this->foodItem->calories / $this->foodItem->serving_size) * $this->quantity;
    }

    public function getProteinAttribute(): float
    {
        return ($this->foodItem->protein / $this->foodItem->serving_size) * $this->quantity;
    }

    public function getCarbsAttribute(): float
    {
        return ($this->foodItem->carbs / $this->foodItem->serving_size) * $this->quantity;
    }

    public function getFatAttribute(): float
    {
        return ($this->foodItem->fat / $this->foodItem->serving_size) * $this->quantity;
    }
}
