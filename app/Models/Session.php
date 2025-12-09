<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Session extends Model
{
    /** @use HasFactory<\Database\Factories\SessionFactory> */
    use HasFactory;
    protected $table = 'sessions';

    // ID string, no autoincrementa
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'user_id',
        'ip_address',
        'user_agent',
        'payload',
        'last_activity',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            // Generar UUID si no se pasa un ID
            if (!$model->id) {
                $model->id = (string) Str::uuid();
            }
        });
    }

    // Relación con User
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
