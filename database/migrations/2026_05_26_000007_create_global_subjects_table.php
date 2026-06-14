<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('global_subjects')) {
            Schema::create('global_subjects', function (Blueprint $table) {
                $table->id();
                $table->string('name')->unique();
                $table->string('color_code')->default('#3b82f6');
                $table->timestamps();
            });
        }

        if (Schema::hasTable('subjects') && ! Schema::hasColumn('subjects', 'global_subject_id')) {
            Schema::table('subjects', function (Blueprint $table) {
                $table->foreignId('global_subject_id')->nullable()->after('user_id')->constrained('global_subjects')->nullOnDelete();
            });
        }

        if (Schema::hasTable('user_subject_exps') && ! Schema::hasColumn('user_subject_exps', 'global_subject_id')) {
            if (DB::getDriverName() === 'sqlite') {
                Schema::dropIfExists('user_subject_exps');

                Schema::create('user_subject_exps', function (Blueprint $table) {
                    $table->id();
                    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                    $table->foreignId('global_subject_id')->constrained('global_subjects')->cascadeOnDelete();
                    $table->integer('xp')->default(0);
                    $table->string('tier')->default('Novice');
                    $table->timestamps();

                    $table->unique(['user_id', 'global_subject_id']);
                });

                return;
            }

            DB::statement('SET FOREIGN_KEY_CHECKS=0;');

            // Drop unique index if exists
            try {
                DB::statement('ALTER TABLE user_subject_exps DROP INDEX user_subject_exps_user_id_subject_id_unique');
            } catch (Exception $e) {
            }

            // Drop subject_id column if exists
            if (Schema::hasColumn('user_subject_exps', 'subject_id')) {
                DB::statement('ALTER TABLE user_subject_exps DROP COLUMN subject_id');
            }

            // Add global_subject_id
            DB::statement('ALTER TABLE user_subject_exps ADD global_subject_id BIGINT UNSIGNED NOT NULL AFTER user_id');

            // Add foreign key
            DB::statement('ALTER TABLE user_subject_exps ADD CONSTRAINT user_subject_exps_global_subject_id_foreign FOREIGN KEY (global_subject_id) REFERENCES global_subjects(id) ON DELETE CASCADE');

            // Add unique index
            DB::statement('ALTER TABLE user_subject_exps ADD UNIQUE KEY user_subject_exps_user_id_global_subject_id_unique (user_id, global_subject_id)');

            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('user_subject_exps') && Schema::hasColumn('user_subject_exps', 'global_subject_id')) {
            Schema::table('user_subject_exps', function (Blueprint $table) {
                $table->dropForeign(['global_subject_id']);
                $table->dropUnique(['user_id', 'global_subject_id']);
                $table->dropColumn('global_subject_id');

                if (! Schema::hasColumn('user_subject_exps', 'subject_id')) {
                    $table->foreignId('subject_id')->nullable()->constrained('subjects');
                    $table->unique(['user_id', 'subject_id']);
                }
            });
        }

        if (Schema::hasTable('subjects') && Schema::hasColumn('subjects', 'global_subject_id')) {
            Schema::table('subjects', function (Blueprint $table) {
                $table->dropForeign(['global_subject_id']);
                $table->dropColumn('global_subject_id');
            });
        }

        Schema::dropIfExists('global_subjects');
    }
};
