<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('department')->nullable();
            $table->string('position')->nullable();
            $table->string('phone')->nullable();
            $table->decimal('kasbon_limit', 12, 2)->default(5000000);
            $table->string('role', 20)->default('employee');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['department', 'position', 'phone', 'kasbon_limit', 'role']);
        });
    }
};