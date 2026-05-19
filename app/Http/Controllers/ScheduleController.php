<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreScheduleRequest;
use App\Http\Requests\UpdateScheduleRequest;
use App\Http\Resources\ScheduleResource;
use App\Http\Resources\SubjectResource;
use App\Models\Schedule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ScheduleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('Schedule/Index', [
            'schedules' => ScheduleResource::collection(
                Auth::user()->schedules()->with('subject')->orderBy('day')->orderBy('start_time')->get()
            ),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('Schedule/Create', [
            'subjects' => SubjectResource::collection(Auth::user()->subjects()->orderBy('name')->get()),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreScheduleRequest $request): RedirectResponse
    {
        Auth::user()->schedules()->create($request->validated());

        return redirect()->route('schedules.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Schedule $schedule)
    {
        abort(404);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Schedule $schedule): Response
    {
        if ($schedule->user_id !== Auth::id()) {
            abort(403);
        }

        return Inertia::render('Schedule/Edit', [
            'schedule' => new ScheduleResource($schedule),
            'subjects' => SubjectResource::collection(Auth::user()->subjects()->orderBy('name')->get()),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateScheduleRequest $request, Schedule $schedule): RedirectResponse
    {
        if ($schedule->user_id !== Auth::id()) {
            abort(403);
        }

        $schedule->update($request->validated());

        return redirect()->route('schedules.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Schedule $schedule): RedirectResponse
    {
        if ($schedule->user_id !== Auth::id()) {
            abort(403);
        }

        $schedule->delete();

        return redirect()->route('schedules.index');
    }
}
