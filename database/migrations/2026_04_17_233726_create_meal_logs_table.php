<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('meal_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('meal_type'); // e.g., desayuno, almuerzo, cena, snack
            $table->text('meal_description');
            $table->integer('calories_est')->nullable();
            $table->json('macros_est')->nullable(); // { protein: 20, carbs: 30, fats: 10 }
            $table->string('ai_feedback')->nullable(); // Mini comentario de la IA
            $table->timestamp('logged_at');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meal_logs');
    }
};
