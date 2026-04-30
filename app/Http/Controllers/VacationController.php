<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Vacation;

class VacationController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $year = request('year', date('Y'));
        
        $vacations = Vacation::where('user_id', $user->id)
            ->whereYear('start_date', $year)
            ->orderBy('start_date', 'desc')
            ->get();
            
        $approvedDays = $vacations->where('status', 'approved')->sum('days_requested');
        $pendingDays = $vacations->where('status', 'pending')->sum('days_requested');
        
        return response()->json([
            'vacations' => $vacations,
            'remaining_days' => 15 - $approvedDays,
            'approved_days' => $approvedDays,
            'pending_days' => $pendingDays,
            'total_days' => 15
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $start = \Carbon\Carbon::parse($request->start_date);
        $end = \Carbon\Carbon::parse($request->end_date);
        $days = $start->diffInDays($end) + 1; // Inclusive of start and end

        $user = auth()->user();
        $year = $start->year;

        // Check if enough days remaining
        $approvedDays = Vacation::where('user_id', $user->id)
            ->whereYear('start_date', $year)
            ->where('status', 'approved')
            ->sum('days_requested');

        if ($approvedDays + $days > 15) {
            return response()->json(['message' => 'No tienes suficientes días de vacaciones.'], 400);
        }

        $vacation = Vacation::create([
            'user_id' => $user->id,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'days_requested' => $days,
            'status' => 'pending',
        ]);

        return response()->json($vacation, 201);
    }

    public function destroy($id)
    {
        $vacation = Vacation::findOrFail($id);
        
        if ($vacation->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        if ($vacation->status !== 'pending') {
            return response()->json(['message' => 'Cannot delete non-pending request'], 400);
        }

        $vacation->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }

    // Admin methods
    public function adminIndex()
    {
        $vacations = Vacation::with('user')->orderBy('created_at', 'desc')->get();
        return response()->json($vacations);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected,pending'
        ]);

        $vacation = Vacation::findOrFail($id);
        
        if ($request->status === 'approved') {
            // Re-check days before approving
            $year = \Carbon\Carbon::parse($vacation->start_date)->year;
            $approvedDays = Vacation::where('user_id', $vacation->user_id)
                ->whereYear('start_date', $year)
                ->where('status', 'approved')
                ->sum('days_requested');
                
            if ($approvedDays + $vacation->days_requested > 15) {
                return response()->json(['message' => 'El entrenador no tiene suficientes días para aprobar esta solicitud.'], 400);
            }
        }
        
        $vacation->status = $request->status;
        $vacation->save();

        return response()->json($vacation);
    }
}
