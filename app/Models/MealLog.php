<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MealLog extends Model
{
    protected $fillable = [
        'user_id',
        'meal_type',
        'meal_description',
        'calories_est',
        'macros_est',
        'ai_feedback',
        'logged_at'
    ];

    protected $casts = [
        'macros_est' => 'array',
        'logged_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
