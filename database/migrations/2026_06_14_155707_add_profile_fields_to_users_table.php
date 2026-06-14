<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('profile_photo_path', 2048)->nullable()->after('password');
            $table->string('school_class')->nullable()->after('profile_photo_path');
            $table->string('major')->nullable()->after('school_class');
            $table->string('institution')->nullable()->after('major');
            $table->text('bio')->nullable()->after('institution');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'profile_photo_path',
                'school_class',
                'major',
                'institution',
                'bio',
            ]);
        });
    }
};
