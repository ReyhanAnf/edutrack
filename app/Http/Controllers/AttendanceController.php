<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAttendanceRequest;
use App\Http\Requests\UpdateAttendanceRequest;
use App\Http\Resources\AttendanceResource;
use App\Http\Resources\SubjectResource;
use App\Models\Attendance;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('Attendance/Index', [
            'attendances' => AttendanceResource::collection(
                Auth::user()->attendances()->with('subject')->latest('date')->get()
            ),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('Attendance/Create', [
            'subjects' => SubjectResource::collection(Auth::user()->subjects()->orderBy('name')->get()),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreAttendanceRequest $request): RedirectResponse
    {
        Auth::user()->attendances()->create($request->validated());

        return redirect()->route('attendances.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Attendance $attendance)
    {
        abort(404);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Attendance $attendance): Response
    {
        if ($attendance->user_id !== Auth::id()) {
            abort(403);
        }

        return Inertia::render('Attendance/Edit', [
            'attendance' => new AttendanceResource($attendance),
            'subjects' => SubjectResource::collection(Auth::user()->subjects()->orderBy('name')->get()),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateAttendanceRequest $request, Attendance $attendance): RedirectResponse
    {
        if ($attendance->user_id !== Auth::id()) {
            abort(403);
        }

        $attendance->update($request->validated());

        return redirect()->route('attendances.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Attendance $attendance): RedirectResponse
    {
        if ($attendance->user_id !== Auth::id()) {
            abort(403);
        }

        $attendance->delete();

        return redirect()->route('attendances.index');
    }
}
