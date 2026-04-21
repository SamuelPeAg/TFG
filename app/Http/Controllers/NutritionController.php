<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\MealLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NutritionController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $date = $request->get('date', now()->format('Y-m-d'));
        
        $meals = MealLog::where('user_id', $user->id)
            ->whereDate('logged_at', $date)
            ->orderBy('logged_at', 'desc')
            ->get();

        return response()->json([
            'meals' => $meals,
            'date' => $date
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'meal_type' => 'required|string',
            'meal_description' => 'required|string|max:1000',
        ]);

        $user = Auth::user();
        $description = $request->meal_description;
        $apiKey = config('services.gemini.key');

        if (!$apiKey) {
            return response()->json(['error' => 'API Key de Gemini no configurada.'], 500);
        }

        // Llamada a la API de Gemini
        $prompt = "Actúa como un nutricionista deportivo experto. El usuario (con objetivo de optimizar su cuerpo y salud) acaba de comer lo siguiente en su " . $request->meal_type . ": \"" . $description . "\". 
Analiza esta comida y devuelve EXCLUSIVAMENTE un objeto JSON válido con la siguiente estructura (sin formato Markdown adicional ni etiquetas como ```json):
{
  \"calories\": numero_entero (estimacion),
  \"protein\": numero_entero_en_gramos,
  \"carbs\": numero_entero_en_gramos,
  \"fats\": numero_entero_en_gramos,
  \"feedback\": \"Un mensaje corto (max 2 oraciones) alentador o recomendación rápida.\"
}";

        try {
            $response = Http::withOptions(['verify' => false])->withHeaders([
                'Content-Type' => 'application/json',
            ])->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={$apiKey}", [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ]
            ]);

            $result = $response->json();
            
            if (isset($result['candidates'][0]['content']['parts'][0]['text'])) {
                $aiText = $result['candidates'][0]['content']['parts'][0]['text'];
                
                // Extraer solo la parte que parece JSON
                preg_match('/\{[\s\S]*\}/', $aiText, $matches);
                if (!empty($matches)) {
                    $aiData = json_decode($matches[0], true);

                    if (json_last_error() === JSON_ERROR_NONE && isset($aiData['calories'])) {
                        
                        $targetDate = $request->input('target_date');
                        $loggedAt = $targetDate ? \Carbon\Carbon::parse($targetDate)->format('Y-m-d H:i:s') : now();

                        $meal = MealLog::create([
                            'user_id' => $user->id,
                            'meal_type' => $request->meal_type,
                            'meal_description' => $description,
                            'calories_est' => $aiData['calories'],
                            'macros_est' => [
                                'protein' => $aiData['protein'] ?? 0,
                                'carbs' => $aiData['carbs'] ?? 0,
                                'fats' => $aiData['fats'] ?? 0,
                            ],
                            'ai_feedback' => $aiData['feedback'] ?? '',
                            'logged_at' => $loggedAt,
                        ]);

                        return response()->json([
                            'success' => true,
                            'meal' => $meal
                        ]);
                    }
                }
            }
            Log::error('Error parseando respuesta de Gemini', ['response' => $result]);
            return response()->json(['error' => 'No se pudo generar la recomendación. Revisa tu registro.'], 500);

        } catch (\Exception $e) {
            Log::error('Error de red al llamar a Gemini', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Error de conexión: ' . $e->getMessage()], 500);
        }
    }

    public function generateRoutine(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'goal' => 'required|string',
        ]);

        $user = Auth::user();
        $date = $request->date;
        $goal = $request->goal;

        $meals = MealLog::where('user_id', $user->id)
            ->whereDate('logged_at', $date)
            ->get();

        $totalCalories = $meals->sum('calories_est');
        $mealsSummary = $meals->pluck('meal_description')->join('. ');
        
        if ($meals->isEmpty()) {
            return response()->json(['error' => 'No hay comidas registradas para este día.'], 400);
        }

        $apiKey = config('services.gemini.key');
        if (!$apiKey) return response()->json(['error' => 'API Key no configurada'], 500);

        $prompt = "Actúa como un entrenador personal experto. El cliente tiene el objetivo de '$goal'. Hoy ha consumido un total de $totalCalories kcal repartidas en estas comidas: \"$mealsSummary\".
Basándote EXACTAMENTE en lo que ha comido y en su objetivo, recomienda un pequeño circuito de 3-4 ejercicios para el día de hoy que le ayude a compensar o potenciar sus resultados.
Devuelve EXCLUSIVAMENTE un objeto JSON válido con este formato exacto (sin formato markdown):
{
  \"motivation\": \"Una frase motivadora relacionada con su nutrición de hoy\",
  \"routine\": [
    { \"ejercicio\": \"Nombre del ejercicio\", \"series\": \"3x15 o tiempo\", \"focus\": \"cardio/fuerza\" }
  ]
}";

        try {
            $response = Http::withOptions(['verify' => false])->withHeaders([
                'Content-Type' => 'application/json',
            ])->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={$apiKey}", [
                'contents' => [['parts' => [['text' => $prompt]]]]
            ]);

            $result = $response->json();
            
            if (isset($result['candidates'][0]['content']['parts'][0]['text'])) {
                preg_match('/\{[\s\S]*\}/', $result['candidates'][0]['content']['parts'][0]['text'], $matches);
                if (!empty($matches)) {
                    $aiData = json_decode($matches[0], true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        return response()->json(['success' => true, 'plan' => $aiData]);
                    }
                }
            }
            return response()->json(['error' => 'No se pudo generar la rutina.'], 500);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Error de conexión: ' . $e->getMessage()], 500);
        }
    }
}
