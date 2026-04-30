<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActionPlan extends Model
{
    protected $fillable = [
        'user_id',
        'trainer_id',
        'target_date',
        'goal_message',
        'status',
        'trainer_response',
        'trainer_images'
    ];

    protected $casts = [
        'trainer_images' => 'array',
        'target_date' => 'date'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function trainer()
    {
        return $this->belongsTo(Entrenador::class, 'trainer_id');
    }
}
