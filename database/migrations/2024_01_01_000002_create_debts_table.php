<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('debts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('creditor_name');
            $table->decimal('total_amount', 15, 2);
            $table->decimal('remaining_amount', 15, 2);
            $table->text('description')->nullable();
            $table->date('due_date');
            $table->string('status');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('debts');
    }
};
