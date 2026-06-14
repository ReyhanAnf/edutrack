<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleAndAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create roles
        $superAdminRole = Role::firstOrCreate(['name' => 'super admin']);
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $userRole = Role::firstOrCreate(['name' => 'user']);

        // Create super admin
        $superAdmin = User::firstOrCreate(
            ['email' => 'superadmin@edutrack.com'],
            [
                'name' => 'Super Administrator',
                'password' => Hash::make('password123'),
                'is_active' => true,
            ]
        );
        if (!$superAdmin->hasRole('super admin')) {
            $superAdmin->assignRole('super admin');
        }

        // Create normal admin
        $admin = User::firstOrCreate(
            ['email' => 'admin@edutrack.com'],
            [
                'name' => 'Administrator',
                'password' => Hash::make('password123'),
                'is_active' => true,
            ]
        );
        if (!$admin->hasRole('admin')) {
            $admin->assignRole('admin');
        }
    }
}
