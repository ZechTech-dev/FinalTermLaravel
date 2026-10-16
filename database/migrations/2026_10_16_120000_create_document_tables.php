<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('document_types', function (Blueprint $table) {
            $table->id('document_type_id');
            $table->string('document_type_name')->unique();
            $table->string('category', 40);
            $table->timestamps();
        });

        Schema::create('documents', function (Blueprint $table) {
            $table->id('document_id');
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('document_type_id')->constrained('document_types', 'document_type_id')->restrictOnDelete();
            $table->string('document_name');
            $table->string('file_path');
            $table->string('mime_type', 120);
            $table->unsignedBigInteger('file_size');
            $table->timestamps();
            $table->index(['user_id', 'document_type_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
        Schema::dropIfExists('document_types');
    }
};
