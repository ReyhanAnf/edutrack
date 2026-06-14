<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleController extends Controller
{
    public function index()
    {
        $roles = Role::with('permissions')->get();
        $permissions = Permission::all();

        return Inertia::render('Admin/Roles/Index', [
            'roles' => $roles,
            'permissions' => $permissions
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        $role = Role::create(['name' => strtolower($validated['name'])]);

        if (!empty($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        return redirect()->back()->with('success', 'Peran berhasil ditambahkan.');
    }

    public function update(Request $request, Role $role)
    {
        // Prevent editing super admin role name
        if ($role->name === 'super admin') {
            return redirect()->back()->with('error', 'Tidak dapat mengubah peran super admin.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name,' . $role->id,
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        $role->update(['name' => strtolower($validated['name'])]);

        if (isset($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        } else {
            $role->syncPermissions([]);
        }

        return redirect()->back()->with('success', 'Peran berhasil diperbarui.');
    }

    public function destroy(Role $role)
    {
        if (in_array($role->name, ['super admin', 'admin', 'user'])) {
            return redirect()->back()->with('error', 'Tidak dapat menghapus peran bawaan sistem.');
        }

        $role->delete();

        return redirect()->back()->with('success', 'Peran berhasil dihapus.');
    }
}
