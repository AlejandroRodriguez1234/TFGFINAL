<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class DietPlan extends Model
{
    use HasUuids;

    protected $table = 'diet_plans';

    protected $fillable = [
        'user_id', 'name', 'description',
        'target_calories', 'target_protein', 'target_carbs', 'target_fat',
        'start_date', 'end_date', 'is_active',
    ];

    protected $casts = [
        'target_calories' => 'integer',
        'target_protein'  => 'float',
        'target_carbs'    => 'float',
        'target_fat'      => 'float',
        'start_date'      => 'date',
        'end_date'        => 'date',
        'is_active'       => 'boolean',
    ];
}
