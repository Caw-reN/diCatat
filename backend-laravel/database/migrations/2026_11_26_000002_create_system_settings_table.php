<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('group')->default('general');
            $table->timestamps();
        });

        $defaults = [
            // Google OAuth Settings
            ['key' => 'google_oauth_enabled', 'value' => '1', 'group' => 'oauth'],
            ['key' => 'google_client_id', 'value' => env('GOOGLE_CLIENT_ID', ''), 'group' => 'oauth'],
            ['key' => 'google_client_secret', 'value' => env('GOOGLE_CLIENT_SECRET', ''), 'group' => 'oauth'],
            ['key' => 'google_redirect_uri', 'value' => env('GOOGLE_REDIRECT_URI', 'http://localhost:5173/auth/google/callback'), 'group' => 'oauth'],
            ['key' => 'google_auth_url', 'value' => 'https://accounts.google.com/o/oauth2/v2/auth', 'group' => 'oauth'],

            // Gemini AI & OCR Settings
            ['key' => 'ai_scanner_enabled', 'value' => '1', 'group' => 'ai'],
            ['key' => 'gemini_api_key', 'value' => env('GEMINI_API_KEY', ''), 'group' => 'ai'],
            ['key' => 'gemini_model', 'value' => env('GEMINI_MODEL', 'gemini-2.5-flash'), 'group' => 'ai'],
            ['key' => 'gemini_endpoint_url', 'value' => 'https://generativelanguage.googleapis.com/v1beta/models', 'group' => 'ai'],
            ['key' => 'gemini_custom_prompt', 'value' => 'Analisis foto struk belanja ini secara akurat dan ekstrak merchant_name, amount, transaction_date, suggested_category, serta items_summary.', 'group' => 'ai'],

            // General App & Default Onboarding Settings
            ['key' => 'app_name', 'value' => 'diCatat.', 'group' => 'general'],
            ['key' => 'app_tagline', 'value' => 'Buku Jurnal Keuangan Si Oren', 'group' => 'general'],
            ['key' => 'frontend_url', 'value' => 'http://localhost:5173', 'group' => 'general'],
            ['key' => 'backend_api_url', 'value' => 'http://127.0.0.1:8000/api', 'group' => 'general'],
            ['key' => 'default_monthly_budget', 'value' => '3000000', 'group' => 'general'],
            ['key' => 'allow_registration', 'value' => '1', 'group' => 'general'],
        ];

        foreach ($defaults as $item) {
            DB::table('system_settings')->updateOrInsert(
                ['key' => $item['key']],
                [
                    'value' => $item['value'],
                    'group' => $item['group'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('system_settings');
    }
};

