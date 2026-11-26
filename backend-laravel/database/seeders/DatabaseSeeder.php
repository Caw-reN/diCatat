<?php

namespace Database\Seeders;

use App\Models\Budget;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'cawren@dicatat.com'],
            [
                'name' => 'Kak Cawren',
                'password' => Hash::make('password'),
                'currency' => 'IDR',
            ]
        );

        if (Wallet::where('user_id', $user->id)->count() > 0) {
            return;
        }

        $cash = Wallet::create([
            'user_id' => $user->id,
            'name' => 'Dompet Tunai',
            'type' => 'cash',
            'balance' => 450000,
            'color' => '#FFE066',
            'icon' => '💵',
        ]);

        $bca = Wallet::create([
            'user_id' => $user->id,
            'name' => 'BCA Utama',
            'type' => 'bank',
            'balance' => 4850000,
            'color' => '#A0C4FF',
            'icon' => '🏦',
        ]);

        $gopay = Wallet::create([
            'user_id' => $user->id,
            'name' => 'GoPay',
            'type' => 'ewallet',
            'balance' => 325000,
            'color' => '#A8E6CF',
            'icon' => '📱',
        ]);

        $catFood = Category::create([
            'user_id' => $user->id,
            'name' => 'Makan & Kopi',
            'type' => 'expense',
            'color' => '#FF8B94',
            'icon' => '🍜',
            'is_default' => true,
        ]);

        $catTransport = Category::create([
            'user_id' => $user->id,
            'name' => 'Transportasi',
            'type' => 'expense',
            'color' => '#A0C4FF',
            'icon' => '🛵',
            'is_default' => true,
        ]);

        $catGroceries = Category::create([
            'user_id' => $user->id,
            'name' => 'Belanja Bulanan',
            'type' => 'expense',
            'color' => '#FFE066',
            'icon' => '🛒',
            'is_default' => true,
        ]);

        $catBills = Category::create([
            'user_id' => $user->id,
            'name' => 'Tagihan & Kos',
            'type' => 'expense',
            'color' => '#BDB2FF',
            'icon' => '⚡',
            'is_default' => true,
        ]);

        $catFun = Category::create([
            'user_id' => $user->id,
            'name' => 'Hiburan & Hobi',
            'type' => 'expense',
            'color' => '#FFD8A8',
            'icon' => '🎮',
            'is_default' => true,
        ]);

        $catSalary = Category::create([
            'user_id' => $user->id,
            'name' => 'Gaji Utama',
            'type' => 'income',
            'color' => '#A8E6CF',
            'icon' => '💰',
            'is_default' => true,
        ]);

        $catFreelance = Category::create([
            'user_id' => $user->id,
            'name' => 'Project Freelance',
            'type' => 'income',
            'color' => '#FFE066',
            'icon' => '🎨',
            'is_default' => true,
        ]);

        $today = now()->toDateString();
        $yesterday = now()->subDay()->toDateString();
        $twoDaysAgo = now()->subDays(2)->toDateString();
        $threeDaysAgo = now()->subDays(3)->toDateString();

        Transaction::create([
            'user_id' => $user->id,
            'wallet_id' => $gopay->id,
            'category_id' => $catFood->id,
            'type' => 'expense',
            'amount' => 38000,
            'transaction_date' => $today,
            'note' => 'Kopi Susu Gula Aren & Croissant (Kopi Kenangan)',
            'is_ai_scanned' => true,
        ]);

        Transaction::create([
            'user_id' => $user->id,
            'wallet_id' => $cash->id,
            'category_id' => $catFood->id,
            'type' => 'expense',
            'amount' => 45000,
            'transaction_date' => $today,
            'note' => 'Nasi Padang Ayam Pop Siang',
            'is_ai_scanned' => false,
        ]);

        Transaction::create([
            'user_id' => $user->id,
            'wallet_id' => $gopay->id,
            'category_id' => $catTransport->id,
            'type' => 'expense',
            'amount' => 24000,
            'transaction_date' => $yesterday,
            'note' => 'GoRide ke Stasiun MRT',
            'is_ai_scanned' => false,
        ]);

        Transaction::create([
            'user_id' => $user->id,
            'wallet_id' => $bca->id,
            'category_id' => $catGroceries->id,
            'type' => 'expense',
            'amount' => 315000,
            'transaction_date' => $yesterday,
            'note' => 'Belanja Stok Dapur & Sabun di Indomaret Fresh',
            'is_ai_scanned' => true,
        ]);

        Transaction::create([
            'user_id' => $user->id,
            'wallet_id' => $bca->id,
            'to_wallet_id' => $gopay->id,
            'category_id' => $catTransport->id,
            'type' => 'transfer',
            'amount' => 250000,
            'transaction_date' => $twoDaysAgo,
            'note' => 'Top up saldo GoPay dari BCA',
            'is_ai_scanned' => false,
        ]);

        Transaction::create([
            'user_id' => $user->id,
            'wallet_id' => $bca->id,
            'category_id' => $catBills->id,
            'type' => 'expense',
            'amount' => 450000,
            'transaction_date' => $twoDaysAgo,
            'note' => 'Token Listrik & WiFi Bulanan',
            'is_ai_scanned' => false,
        ]);

        Transaction::create([
            'user_id' => $user->id,
            'wallet_id' => $bca->id,
            'category_id' => $catSalary->id,
            'type' => 'income',
            'amount' => 6500000,
            'transaction_date' => $threeDaysAgo,
            'note' => 'Gaji Bulanan Masuk',
            'is_ai_scanned' => false,
        ]);

        Transaction::create([
            'user_id' => $user->id,
            'wallet_id' => $cash->id,
            'category_id' => $catFun->id,
            'type' => 'expense',
            'amount' => 120000,
            'transaction_date' => $threeDaysAgo,
            'note' => 'Beli Buku Jurnal & Pulpen Doodle',
            'is_ai_scanned' => false,
        ]);

        $monthYear = now()->format('Y-m');
        Budget::create([
            'user_id' => $user->id,
            'category_id' => null,
            'amount_limit' => 3000000,
            'month_year' => $monthYear,
        ]);
        Budget::create(['user_id' => $user->id, 'category_id' => $catFood->id, 'amount_limit' => 900000, 'month_year' => $monthYear]);
        Budget::create(['user_id' => $user->id, 'category_id' => $catTransport->id, 'amount_limit' => 400000, 'month_year' => $monthYear]);
        Budget::create(['user_id' => $user->id, 'category_id' => $catGroceries->id, 'amount_limit' => 750000, 'month_year' => $monthYear]);
        Budget::create(['user_id' => $user->id, 'category_id' => $catBills->id, 'amount_limit' => 650000, 'month_year' => $monthYear]);
        Budget::create(['user_id' => $user->id, 'category_id' => $catFun->id, 'amount_limit' => 300000, 'month_year' => $monthYear]);
    }
}
