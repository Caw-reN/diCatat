<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\SystemSetting;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AdminSettingController extends Controller
{
    public function index(): JsonResponse
    {
        $settings = SystemSetting::getAllKeyValue();

        $stats = [
            'total_users' => User::count(),
            'total_transactions' => Transaction::count(),
            'total_ai_scanned' => Transaction::where('is_ai_scanned', true)->count(),
            'total_wallets' => Wallet::count(),
            'total_categories' => Category::count(),
            'recent_users' => User::orderByDesc('created_at')
                ->limit(5)
                ->get(['id', 'name', 'email', 'google_id', 'created_at']),
        ];

        return response()->json([
            'settings' => [
                'google_oauth_enabled' => $settings['google_oauth_enabled'] ?? '1',
                'google_client_id' => $settings['google_client_id'] ?? env('GOOGLE_CLIENT_ID', ''),
                'google_client_secret' => $settings['google_client_secret'] ?? env('GOOGLE_CLIENT_SECRET', ''),
                'google_redirect_uri' => $settings['google_redirect_uri'] ?? 'http://localhost:5173/auth/google/callback',
                'google_auth_url' => $settings['google_auth_url'] ?? 'https://accounts.google.com/o/oauth2/v2/auth',

                'ai_scanner_enabled' => $settings['ai_scanner_enabled'] ?? '1',
                'gemini_api_key' => $settings['gemini_api_key'] ?? env('GEMINI_API_KEY', ''),
                'gemini_model' => $settings['gemini_model'] ?? env('GEMINI_MODEL', 'gemini-2.5-flash'),
                'gemini_endpoint_url' => $settings['gemini_endpoint_url'] ?? 'https://generativelanguage.googleapis.com/v1beta/models',
                'gemini_custom_prompt' => $settings['gemini_custom_prompt'] ?? 'Analisis foto struk belanja ini secara akurat dan ekstrak merchant_name, amount, transaction_date, suggested_category, serta items_summary.',

                'app_name' => $settings['app_name'] ?? 'diCatat.',
                'app_tagline' => $settings['app_tagline'] ?? 'Buku Jurnal Keuangan Si Oren',
                'frontend_url' => $settings['frontend_url'] ?? 'http://localhost:5173',
                'backend_api_url' => $settings['backend_api_url'] ?? 'http://127.0.0.1:8000/api',
                'default_monthly_budget' => $settings['default_monthly_budget'] ?? '3000000',
                'allow_registration' => $settings['allow_registration'] ?? '1',
            ],
            'stats' => $stats,
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $allowedKeys = [
            'google_oauth_enabled' => 'oauth',
            'google_client_id' => 'oauth',
            'google_client_secret' => 'oauth',
            'google_redirect_uri' => 'oauth',
            'google_auth_url' => 'oauth',

            'ai_scanner_enabled' => 'ai',
            'gemini_api_key' => 'ai',
            'gemini_model' => 'ai',
            'gemini_endpoint_url' => 'ai',
            'gemini_custom_prompt' => 'ai',

            'app_name' => 'general',
            'app_tagline' => 'general',
            'frontend_url' => 'general',
            'backend_api_url' => 'general',
            'default_monthly_budget' => 'general',
            'allow_registration' => 'general',
        ];

        $input = $request->input('settings', $request->all());

        foreach ($allowedKeys as $key => $group) {
            if (array_key_exists($key, $input)) {
                SystemSetting::updateOrCreate(
                    ['key' => $key],
                    [
                        'value' => (string) ($input[$key] ?? ''),
                        'group' => $group,
                    ]
                );
            }
        }

        return response()->json([
            'message' => 'Konfigurasi Admin (OAuth, API AI & Sistem) berhasil disimpan ke database!',
            'settings' => SystemSetting::getAllKeyValue(),
        ]);
    }

    public function testGeminiConnection(Request $request): JsonResponse
    {
        $apiKey = $request->input('gemini_api_key')
            ?: SystemSetting::getValue('gemini_api_key', env('GEMINI_API_KEY', ''));
        $model = $request->input('gemini_model')
            ?: SystemSetting::getValue('gemini_model', env('GEMINI_MODEL', 'gemini-2.5-flash'));
        $endpoint = rtrim(
            $request->input('gemini_endpoint_url')
                ?: SystemSetting::getValue('gemini_endpoint_url', 'https://generativelanguage.googleapis.com/v1beta/models'),
            '/'
        );

        if (empty($apiKey)) {
            return response()->json([
                'ok' => false,
                'mode' => 'demo_fallback',
                'message' => 'API Key Gemini belum diisi. Saat ini sistem berjalan dalam Mode Simulasi Cerdas (Fallback). Isi API Key untuk mengaktifkan Live OCR.',
            ]);
        }

        try {
            $response = Http::timeout(12)->post(
                "{$endpoint}/{$model}:generateContent?key={$apiKey}",
                [
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => 'Balas singkat dengan satu kalimat: Si Oren siap bertugas!'],
                            ],
                        ],
                    ],
                ]
            );

            if ($response->successful()) {
                $reply = $response->json('candidates.0.content.parts.0.text') ?? 'Terhubung!';
                return response()->json([
                    'ok' => true,
                    'mode' => 'live_api',
                    'message' => 'Koneksi API AI Berhasil! Respon (' . $model . '): ' . trim((string) $reply),
                ]);
            }

            return response()->json([
                'ok' => false,
                'mode' => 'error',
                'message' => 'API Key merespons dengan error HTTP ' . $response->status() . ': ' . ($response->json('error.message') ?? 'Periksa kembali API Key atau nama model.'),
            ], 422);
        } catch (\Throwable $e) {
            return response()->json([
                'ok' => false,
                'mode' => 'error',
                'message' => 'Gagal menghubungi endpoint AI: ' . $e->getMessage(),
            ], 500);
        }
    }
}

