<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Budget;
use App\Models\Category;
use App\Models\SystemSetting;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;

class AuthController extends Controller
{
    public function googleBackendCallback(Request $request)
    {
        $frontendUrl = rtrim(
            SystemSetting::getValue('frontend_url', 'http://localhost:5173') ?: 'http://localhost:5173',
            '/'
        );
        $queryString = $request->getQueryString();

        return redirect()->away(
            $frontendUrl . '/auth/google/callback' . ($queryString ? '?' . $queryString : '')
        );
    }

    public function googleCodeExchange(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string',
            'redirect_uri' => 'nullable|string',
        ]);

        $clientId = SystemSetting::getValue('google_client_id', env('GOOGLE_CLIENT_ID', ''));
        $clientSecret = SystemSetting::getValue('google_client_secret', env('GOOGLE_CLIENT_SECRET', ''));
        $redirectUri = $validated['redirect_uri']
            ?? SystemSetting::getValue('google_redirect_uri', env('GOOGLE_REDIRECT_URI', 'http://localhost:5173/auth/google/callback'));

        if (empty($clientId) || empty($clientSecret)) {
            return response()->json([
                'message' => 'Google Client ID atau Client Secret belum diisi di Dashboard /admin.',
            ], 422);
        }

        $tokenRes = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'code' => $validated['code'],
            'client_id' => $clientId,
            'client_secret' => $clientSecret,
            'redirect_uri' => $redirectUri,
            'grant_type' => 'authorization_code',
        ]);

        if (!$tokenRes->successful()) {
            return response()->json([
                'message' => 'Gagal menukar kode OAuth Google: ' . ($tokenRes->json('error_description') ?? $tokenRes->body()),
            ], 422);
        }

        $accessToken = $tokenRes->json('access_token');
        $profileRes = Http::withToken($accessToken)->get('https://www.googleapis.com/oauth2/v3/userinfo');

        if (!$profileRes->successful()) {
            return response()->json([
                'message' => 'Gagal mengambil profil akun Google.',
            ], 422);
        }

        $googleProfile = $profileRes->json();
        $email = $googleProfile['email'] ?? null;
        $name = $googleProfile['name'] ?? explode('@', (string) $email)[0];
        $sub = $googleProfile['sub'] ?? ('google_' . time());
        $picture = $googleProfile['picture'] ?? null;

        if (!$email) {
            return response()->json(['message' => 'Email tidak ditemukan pada akun Google ini.'], 422);
        }

        $existing = User::where('email', $email)->first();
        $isNewUser = !$existing;

        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'name' => $existing ? $existing->name : $name,
                'google_id' => $sub,
                'avatar' => $picture,
                'password' => $existing ? $existing->password : Hash::make(str()->random(24)),
            ]
        );

        if (!$existing) {
            $this->seedDefaultWalletsAndCategoriesForNewUser($user);
        }

        return response()->json([
            'user' => $user,
            'is_new_user' => $isNewUser,
            'message' => 'Login Google OAuth asli berhasil!',
        ]);
    }
    private function seedDefaultWalletsAndCategoriesForNewUser(User $user): void
    {
        if (Wallet::where('user_id', $user->id)->count() === 0) {
            Wallet::insert([
                [
                    'user_id' => $user->id,
                    'name' => 'Dompet Tunai',
                    'type' => 'cash',
                    'balance' => 0,
                    'color' => '#FFE066',
                    'icon' => '💵',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'user_id' => $user->id,
                    'name' => 'Rekening Bank',
                    'type' => 'bank',
                    'balance' => 0,
                    'color' => '#A0C4FF',
                    'icon' => '🏦',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'user_id' => $user->id,
                    'name' => 'E-Wallet',
                    'type' => 'ewallet',
                    'balance' => 0,
                    'color' => '#A8E6CF',
                    'icon' => '📱',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }

        if (Category::where('user_id', $user->id)->count() === 0) {
            Category::insert([
                ['user_id' => $user->id, 'name' => 'Makan & Kopi', 'type' => 'expense', 'color' => '#FF8B94', 'icon' => '🍜', 'is_default' => true, 'created_at' => now(), 'updated_at' => now()],
                ['user_id' => $user->id, 'name' => 'Transportasi', 'type' => 'expense', 'color' => '#A0C4FF', 'icon' => '🛵', 'is_default' => true, 'created_at' => now(), 'updated_at' => now()],
                ['user_id' => $user->id, 'name' => 'Belanja Bulanan', 'type' => 'expense', 'color' => '#FFE066', 'icon' => '🛒', 'is_default' => true, 'created_at' => now(), 'updated_at' => now()],
                ['user_id' => $user->id, 'name' => 'Tagihan & Kos', 'type' => 'expense', 'color' => '#BDB2FF', 'icon' => '⚡', 'is_default' => true, 'created_at' => now(), 'updated_at' => now()],
                ['user_id' => $user->id, 'name' => 'Hiburan & Hobi', 'type' => 'expense', 'color' => '#FFD8A8', 'icon' => '🎮', 'is_default' => true, 'created_at' => now(), 'updated_at' => now()],
                ['user_id' => $user->id, 'name' => 'Gaji Utama', 'type' => 'income', 'color' => '#A8E6CF', 'icon' => '💰', 'is_default' => true, 'created_at' => now(), 'updated_at' => now()],
                ['user_id' => $user->id, 'name' => 'Project Freelance', 'type' => 'income', 'color' => '#FFE066', 'icon' => '🎨', 'is_default' => true, 'created_at' => now(), 'updated_at' => now()],
            ]);
        }

        $monthYear = now()->format('Y-m');
        if (Budget::where('user_id', $user->id)->where('month_year', $monthYear)->count() === 0) {
            Budget::create([
                'user_id' => $user->id,
                'category_id' => null,
                'amount_limit' => 3000000,
                'month_year' => $monthYear,
            ]);
        }
    }

    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email|max:150|unique:users,email',
            'password' => 'required|string|min:6',
            'name' => 'nullable|string|max:100',
        ]);

        $defaultName = $validated['name'] ?? explode('@', $validated['email'])[0];

        $user = User::create([
            'name' => $defaultName,
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'currency' => 'IDR',
        ]);

        $this->seedDefaultWalletsAndCategoriesForNewUser($user);

        return response()->json([
            'user' => $user,
            'is_new_user' => true,
            'message' => 'Akun baru berhasil dibuat! Yuk kenalan dulu sama Si Oren 🐾',
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json(['message' => 'Email atau password tidak sesuai'], 401);
        }

        return response()->json([
            'user' => $user,
            'is_new_user' => false,
            'message' => 'Login berhasil! Selamat datang kembali di diCatat 🐾',
        ]);
    }

    public function googleCallback(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'name' => 'required|string',
            'google_id' => 'required|string',
            'avatar' => 'nullable|string',
            'is_register' => 'nullable|boolean',
        ]);

        $existing = User::where('email', $validated['email'])->first();
        $isNewUser = !$existing || !empty($validated['is_register']);

        $user = User::updateOrCreate(
            ['email' => $validated['email']],
            [
                'name' => $existing ? $existing->name : $validated['name'],
                'google_id' => $validated['google_id'],
                'avatar' => $validated['avatar'] ?? null,
                'password' => $existing ? $existing->password : Hash::make(str()->random(24)),
            ]
        );

        if (!$existing) {
            $this->seedDefaultWalletsAndCategoriesForNewUser($user);
        }

        return response()->json([
            'user' => $user,
            'is_new_user' => $isNewUser,
            'message' => 'Login Google OAuth berhasil!',
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'nullable|integer',
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:150',
        ]);

        $userId = $validated['user_id'] ?? $request->user()?->id ?? 1;
        $user = User::find($userId) ?? User::first();
        if ($user) {
            $user->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
            ]);
        }

        return response()->json([
            'user' => $user,
            'message' => 'Profil akun berhasil diperbarui!',
        ]);
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'nullable|integer',
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6',
        ]);

        $userId = $validated['user_id'] ?? $request->user()?->id ?? 1;
        $user = User::find($userId) ?? User::first();
        if ($user) {
            $user->update([
                'password' => Hash::make($validated['new_password']),
            ]);
        }

        return response()->json([
            'message' => 'Password akun berhasil diperbarui!',
        ]);
    }
}
