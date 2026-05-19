<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Menampilkan dasbor aplikasi.
     */
    public function index()
    {
        $user = Auth::user();

        // Data Ringkasan
        $avgGrade = $user->grades()->avg('score') ?? 0;
        $pendingAssignments = $user->assignments()->where('status', 'Pending')->count();

        $today = Carbon::now()->format('l'); // contoh: Monday
        $todaysSchedule = $user->schedules()->where('day', $today)->orderBy('start_time')->with('subject')->get();

        return Inertia::render('Dashboard', [
            'avgGrade' => (float) $avgGrade,
            'pendingAssignments' => $pendingAssignments,
            'todaysSchedule' => $todaysSchedule,
        ]);
    }
}
