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

        // Easter Egg: Semillas del Ermitaño
        if (stripos($description, 'semilla del ermitaño') !== false || stripos($description, 'semillas del ermitaño') !== false) {
            $targetDate = $request->input('target_date');
            $loggedAt = $targetDate ? \Carbon\Carbon::parse($targetDate)->format('Y-m-d H:i:s') : now();
            
            $meal = \App\Models\MealLog::create([
                'user_id' => $user->id,
                'meal_type' => $request->meal_type,
                'meal_description' => '🌿 Semillas del Ermitaño',
                'calories_est' => 9999,
                'macros_est' => [
                    'protein' => 9999,
                    'carbs' => 9999,
                    'fats' => 9999,
                ],
                'ai_feedback' => '¡MODO SUPERSAIYAN ACTIVADO! Recuperación muscular al 10000%.',
                'logged_at' => $loggedAt,
            ]);

            return response()->json([
                'success' => true,
                'is_senzu' => true,
                'meal' => $meal
            ]);
        }

        if ($request->input('is_manual')) {
            $targetDate = $request->input('target_date');
            $loggedAt = $targetDate ? \Carbon\Carbon::parse($targetDate)->format('Y-m-d H:i:s') : now();

            $meal = MealLog::create([
                'user_id' => $user->id,
                'meal_type' => $request->meal_type,
                'meal_description' => $description,
                'calories_est' => 0,
                'macros_est' => [
                    'protein' => 0,
                    'carbs' => 0,
                    'fats' => 0,
                ],
                'ai_feedback' => 'Registro manual. Edita los macros si lo necesitas.',
                'logged_at' => $loggedAt,
            ]);

            return response()->json([
                'success' => true,
                'meal' => $meal
            ]);
        }

        $apiKey = config('services.gemini.key');

        if (!$apiKey) {
            return response()->json(['error' => 'API Key de Gemini no configurada.'], 500);
        }

        // Llamada a la API de Gemini
        $prompt = "Actúa como un nutricionista deportivo experto. El usuario (con objetivo de optimizar su cuerpo y salud) acaba de registrar lo siguiente en su " . $request->meal_type . ": \"" . $description . "\". 
Analiza esta entrada y devuelve EXCLUSIVAMENTE un objeto JSON válido con la siguiente estructura (sin formato Markdown adicional ni etiquetas como ```json).
REGLA MUY IMPORTANTE: Si el usuario menciona CUALQUIER COSA que no sea comida real y comestible (aunque lo mezcle con comida real, por ejemplo 'una manzana y una piedra' o 'leche y un coche'), debes evaluarlo como NO comida. Todo lo mencionado debe ser comestible para ser válido.
{
  \"is_food\": booleano_true_SOLO_si_ABSOLUTAMENTE_TODO_es_comida_false_si_hay_ALGO_no_comestible,
  \"error_message\": \"Solo si is_food es false, explica brevemente por qué de forma amistosa y graciosa (ej. '¡Las piedras no tienen macros, intenta comer solo comida real!'). Si es true, déjalo vacío.\",
  \"calories\": numero_entero (estimacion, 0 si no es comida),
  \"protein\": numero_entero_en_gramos (0 si no es comida),
  \"carbs\": numero_entero_en_gramos (0 si no es comida),
  \"fats\": numero_entero_en_gramos (0 si no es comida),
  \"feedback\": \"Un mensaje corto (max 2 oraciones) alentador o recomendación rápida.\"
}";

        try {
            $response = Http::timeout(60)->withOptions(['verify' => false])->withHeaders([
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
            
            if (isset($result['error'])) {
                Log::error('Error de Gemini API', ['response' => $result]);
                if (isset($result['error']['code']) && $result['error']['code'] == 503) {
                    return response()->json(['error' => 'La IA está experimentando mucha demanda ahora mismo. Por favor, inténtalo de nuevo en unos minutos.'], 503);
                }
                return response()->json(['error' => 'Error en la IA: ' . ($result['error']['message'] ?? 'Desconocido')], 500);
            }
            
            if (isset($result['candidates'][0]['content']['parts'][0]['text'])) {
                $aiText = $result['candidates'][0]['content']['parts'][0]['text'];
                
                // Extraer solo la parte que parece JSON
                preg_match('/\{[\s\S]*\}/', $aiText, $matches);
                if (!empty($matches)) {
                    $aiData = json_decode($matches[0], true);

                    if (json_last_error() === JSON_ERROR_NONE) {
                        
                        if (isset($aiData['is_food']) && $aiData['is_food'] === false) {
                            return response()->json([
                                'error' => $aiData['error_message'] ?? 'Lo que has introducido no parece ser una comida válida.'
                            ], 400);
                        }

                        if (isset($aiData['calories'])) {
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
            }
            Log::error('Error parseando respuesta de Gemini', ['response' => $result]);
            return response()->json(['error' => 'No se pudo procesar la respuesta de la IA. Revisa la descripción o intenta de nuevo.'], 500);

        } catch (\Exception $e) {
            Log::error('Error de red al llamar a Gemini', ['error' => $e->getMessage()]);
            $errorMessage = $e->getMessage();
            if (str_contains($errorMessage, 'cURL error 28') || str_contains($errorMessage, 'timed out')) {
                return response()->json(['error' => 'La IA está tardando demasiado en pensar (saturación de Google). ¡Vuelve a intentarlo en unos segundos!'], 504);
            }
            return response()->json(['error' => 'Error de conexión: No pudimos contactar a la IA.'], 500);
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
        
        $nutritionContext = $meals->isEmpty() 
            ? "El cliente aún no ha registrado comidas hoy, así que base su recomendación únicamente en su perfil y objetivo general." 
            : "Hoy ha consumido un total de $totalCalories kcal repartidas en estas comidas: \"$mealsSummary\".";

        $apiKey = config('services.gemini.key');
        if (!$apiKey) return response()->json(['error' => 'API Key no configurada'], 500);

        $prompt = "Actúa como un entrenador personal experto. El cliente tiene el objetivo de '$goal'. $nutritionContext
Basándote en su objetivo, recomienda un pequeño circuito de 3-4 ejercicios para el día de hoy.
Devuelve EXCLUSIVAMENTE un objeto JSON válido con este formato exacto (sin formato markdown):
{
  \"motivation\": \"Una frase motivadora para empezar el día con energía\",
  \"routine\": [
    { \"ejercicio\": \"Nombre del ejercicio\", \"series\": \"3x15 o tiempo\", \"focus\": \"cardio/fuerza\" }
  ]
}";

        try {
            $response = Http::timeout(60)->withOptions(['verify' => false])->withHeaders([
                'Content-Type' => 'application/json',
            ])->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={$apiKey}", [
                'contents' => [['parts' => [['text' => $prompt]]]]
            ]);

            $result = $response->json();
            
            if (isset($result['error'])) {
                Log::error('Error de Gemini API en generateRoutine', ['response' => $result]);
                if (isset($result['error']['code']) && $result['error']['code'] == 503) {
                    return response()->json(['error' => 'La IA está experimentando mucha demanda ahora mismo. Por favor, inténtalo de nuevo en unos minutos.'], 503);
                }
                return response()->json(['error' => 'Error en la IA: ' . ($result['error']['message'] ?? 'Desconocido')], 500);
            }

            if (isset($result['candidates'][0]['content']['parts'][0]['text'])) {
                $aiText = $result['candidates'][0]['content']['parts'][0]['text'];
                preg_match('/\{[\s\S]*\}/', $aiText, $matches);
                if (!empty($matches)) {
                    $aiData = json_decode($matches[0], true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        return response()->json(['success' => true, 'plan' => $aiData]);
                    } else {
                        Log::error('JSON parsing failed', ['aiText' => $aiText, 'json_error' => json_last_error_msg()]);
                    }
                }
            }
            Log::error('Error parseando respuesta de Gemini (Rutina)', ['response' => $result]);
            return response()->json(['error' => 'No se pudo generar la rutina correctamente. Inténtalo de nuevo.'], 500);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Error de conexión: ' . $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'calories_est' => 'required|numeric',
            'protein' => 'required|numeric',
            'carbs' => 'required|numeric',
            'fats' => 'required|numeric',
            'time' => 'nullable|string', // HH:mm
        ]);

        $user = Auth::user();
        $meal = MealLog::where('user_id', $user->id)->findOrFail($id);

        $meal->calories_est = $request->calories_est;
        $meal->macros_est = [
            'protein' => $request->protein,
            'carbs' => $request->carbs,
            'fats' => $request->fats,
        ];
        
        if ($request->filled('time')) {
            $currentDate = \Carbon\Carbon::parse($meal->logged_at)->format('Y-m-d');
            $meal->logged_at = $currentDate . ' ' . $request->time . ':00';
        }

        $meal->save();

        return response()->json([
            'success' => true,
            'meal' => $meal
        ]);
    }

    public function destroy($id)
    {
        $user = Auth::user();
        $meal = MealLog::where('user_id', $user->id)->findOrFail($id);
        $meal->delete();

        return response()->json([
            'success' => true
        ]);
    }
}
