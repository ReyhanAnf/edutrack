<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('roles')->latest()->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_active' => $user->is_active,
                'roles' => $user->roles->pluck('name'),
                'created_at' => $user->created_at->format('Y-m-d H:i:s'),
            ];
        });

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'availableRoles' => Role::all()->pluck('name')
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
        ]);

        $user->update($validated);

        if ($request->has('roles')) {
            $user->syncRoles($request->input('roles'));
        }

        return redirect()->back()->with('success', 'Data pengguna berhasil diperbarui.');
    }

    public function toggleActive(User $user)
    {
        if (auth()->id() === $user->id || $user->hasRole('super admin')) {
            return redirect()->back()->with('error', 'Tidak dapat menonaktifkan pengguna ini.');
        }

        $user->update(['is_active' => !$user->is_active]);

        return redirect()->back()->with('success', 'Status pengguna berhasil diubah.');
    }

    public function resetPassword(Request $request, User $user)
    {
        $validated = $request->validate([
            'password' => 'required|string|min:8',
        ]);

        $user->update([
            'password' => Hash::make($validated['password'])
        ]);

        return redirect()->back()->with('success', 'Password pengguna berhasil direset.');
    }
}
