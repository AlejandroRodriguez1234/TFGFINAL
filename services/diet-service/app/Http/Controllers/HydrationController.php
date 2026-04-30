<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class HydrationController extends Controller
{
    public function today(Request $request): JsonResponse
    {
        $logs = DB::table('hydration_logs')
            ->where('user_id', $request->user_id)
            ->whereDate('logged_at', today())
            ->get();

        $totalMl = $logs->sum('amount_ml');

        return response()->json([
            'success' => true,
            'data'    => [
                'total_ml'   => $totalMl,
                'total_glasses' => (int) floor($totalMl / 250),
                'goal_ml'    => 2500,
                'percentage' => min(100, round($totalMl / 2500 * 100, 1)),
                'logs'       => $logs,
            ],
        ]);
    }

    public function log(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amount_ml' => 'required|integer|min:50|max:2000',
        ]);

        $id = DB::table('hydration_logs')->insertGetId([
            'id'        => \Illuminate\Support\Str::uuid(),
            'user_id'   => $request->user_id,
            'amount_ml' => $validated['amount_ml'],
            'logged_at' => now(),
        ]);

        return response()->json(['success' => true, 'data' => ['id' => $id, 'amount_ml' => $validated['amount_ml']]], 201);
    }

    public function history(Request $request): JsonResponse
    {
        $days = (int) $request->get('days', 7);

        $logs = DB::table('hydration_logs')
            ->where('user_id', $request->user_id)
            ->where('logged_at', '>=', now()->subDays($days))
            ->selectRaw('DATE(logged_at) as date, SUM(amount_ml) as total_ml')
            ->groupBy('date')
            ->orderBy('date', 'desc')
            ->get();

        return response()->json(['success' => true, 'data' => $logs]);
    }
}
