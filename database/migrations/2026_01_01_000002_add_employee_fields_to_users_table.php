<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('employee_id')->unique()->after('id');
            $table->string('employee_name')->after('employee_id');
            $table->foreignId('department_id')->nullable()->constrained('departments', 'department_id')->nullOnDelete();
            $table->enum('status', ['Active', 'Inactive'])->default('Active');
            $table->date('hire_date')->nullable();
            $table->string('profile_picture')->default('default-picture.jpg');
            $table->string('role')->default('Employee');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('department_id');
            $table->dropColumn(['employee_id', 'employee_name', 'status', 'hire_date', 'profile_picture', 'role']);
        });
    }
};
