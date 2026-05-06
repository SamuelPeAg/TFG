<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ActionPlan;
use App\Models\MealLog;
use App\Models\User;

class ActionPlanController extends Controller
{
    // Cliente: Crear solicitud
    public function store(Request $request)
    {
        $request->validate([
            'trainer_id' => 'required|exists:entrenadores,id',
            'target_date' => 'required|date',
            'goal_message' => 'required|string|max:1000'
        ]);

        $plan = ActionPlan::create([
            'user_id' => auth()->id(),
            'trainer_id' => $request->trainer_id,
            'target_date' => $request->target_date,
            'goal_message' => $request->goal_message,
            'status' => 'pending'
        ]);

        return response()->json($plan, 201);
    }

    // Cliente: Obtener sus solicitudes
    public function indexClient(Request $request)
    {
        $date = $request->query('date', now()->format('Y-m-d'));
        $plans = ActionPlan::with('trainer')
            ->where('user_id', auth()->id())
            ->whereDate('target_date', $date)
            ->get();
            
        return response()->json($plans);
    }

    // Entrenador: Obtener solicitudes asignadas
    public function indexTrainer()
    {
        $plans = ActionPlan::with('user')
            ->where('trainer_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($plans);
    }

    // Entrenador: Obtener detalles del cliente en esa fecha
    public function getClientMeals($planId)
    {
        $plan = ActionPlan::findOrFail($planId);
        
        if ($plan->trainer_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $meals = MealLog::where('user_id', $plan->user_id)
            ->whereDate('logged_at', $plan->target_date)
            ->get();

        return response()->json($meals);
    }

    // Entrenador: Responder a solicitud
    public function respond(Request $request, $id)
    {
        $plan = ActionPlan::findOrFail($id);

        if ($plan->trainer_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'response' => 'required|string',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120'
        ]);

        $imagePaths = [];
        
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('action_plans', 'public');
                $imagePaths[] = '/storage/' . $path;
            }
        }

        $responseData = json_decode($request->response, true);
        if (json_last_error() === JSON_ERROR_NONE && isset($responseData['is_structured_routine'])) {
            if (isset($responseData['routine'])) {
                foreach ($responseData['routine'] as $index => &$exercise) {
                    if ($request->hasFile("routine_images_{$index}")) {
                        $path = $request->file("routine_images_{$index}")->store('action_plans/exercises', 'public');
                        $exercise['image_url'] = '/storage/' . $path;
                    }
                }
            }
            $plan->trainer_response = json_encode($responseData);
        } else {
            $plan->trainer_response = $request->response;
        }

        if (!empty($imagePaths)) {
            $plan->trainer_images = $imagePaths;
        }
        $plan->status = 'completed';
        $plan->save();

        return response()->json($plan);
    }
}
