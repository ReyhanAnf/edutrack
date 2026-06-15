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

        // ─── Define All Permissions ───────────────────────────────────────

        $permissions = [
            // Admin Panel
            'admin.dashboard',

            // User Management
            'users.view',
            'users.edit',
            'users.toggle-active',
            'users.reset-password',

            // Role Management
            'roles.view',
            'roles.create',
            'roles.edit',
            'roles.delete',

            // Permission Management
            'permissions.create',
            'permissions.edit',
            'permissions.delete',

            // Subjects
            'subjects.view',
            'subjects.create',
            'subjects.edit',
            'subjects.delete',

            // Assignments
            'assignments.view',
            'assignments.create',
            'assignments.edit',
            'assignments.delete',

            // Attendances
            'attendances.view',
            'attendances.create',
            'attendances.edit',
            'attendances.delete',

            // Grades
            'grades.view',
            'grades.create',
            'grades.edit',
            'grades.delete',

            // Schedules
            'schedules.view',
            'schedules.create',
            'schedules.edit',
            'schedules.delete',

            // Notes
            'notes.view',
            'notes.create',
            'notes.edit',
            'notes.delete',

            // Questions
            'questions.view',
            'questions.create',
            'questions.edit',
            'questions.delete',

            // Answers
            'answers.create',
            'answers.edit',
            'answers.delete',

            // Quizzes
            'quizzes.view',
            'quizzes.create',
            'quizzes.edit',
            'quizzes.delete',

            // Leaderboard
            'leaderboard.view',

            // Friends
            'friends.manage',

            // Profile
            'profile.edit',

            // Missions
            'missions.view',
            'missions.create',
            'missions.edit',
            'missions.delete',
        ];

        // Create all permissions (idempotent)
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // ─── Define Roles ────────────────────────────────────────────────

        // Super Admin: ALL permissions (bypasses all checks via Gate::before)
        $superAdminRole = Role::firstOrCreate(['name' => 'super admin']);
        $superAdminRole->syncPermissions($permissions);

        // Admin: Full management permissions (no role/permission CRUD)
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $adminPermissions = array_diff($permissions, [
            'roles.create',
            'roles.delete',
            'permissions.delete',
        ]);
        $adminRole->syncPermissions($adminPermissions);

        // User: Basic access permissions
        $userRole = Role::firstOrCreate(['name' => 'user']);
        $userPermissions = [
            'subjects.view',
            'subjects.create',
            'subjects.edit',
            'subjects.delete',
            'assignments.view',
            'assignments.create',
            'assignments.edit',
            'assignments.delete',
            'attendances.view',
            'attendances.create',
            'attendances.edit',
            'attendances.delete',
            'grades.view',
            'grades.create',
            'grades.edit',
            'grades.delete',
            'schedules.view',
            'schedules.create',
            'schedules.edit',
            'schedules.delete',
            'notes.view',
            'notes.create',
            'notes.edit',
            'notes.delete',
            'questions.view',
            'questions.create',
            'questions.edit',
            'questions.delete',
            'answers.create',
            'answers.edit',
            'answers.delete',
            'quizzes.view',
            'quizzes.create',
            'quizzes.edit',
            'quizzes.delete',
            'leaderboard.view',
            'friends.manage',
            'profile.edit',
            'missions.view',
        ];
        $userRole->syncPermissions($userPermissions);

        // ─── Create Default Users ────────────────────────────────────────

        // Super Admin
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

        // Admin
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
