<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Budget;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\Wallet;
use App\Services\GeminiReceiptScannerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FinanceController extends Controller
{
    public function health(): JsonResponse
    {
        return response()->json([
            'status' => 'ok',
            'app' => 'diCatat Laravel REST API',
            'mascot' => 'Si Oren Akuntan 🐾',
            'gemini_configured' => !empty(env('GEMINI_API_KEY')),
        ]);
    }

    private function resolveUserId(Request $request): int
    {
        return (int) ($request->input('user_id')
            ?? $request->query('user_id')
            ?? $request->header('X-User-Id')
            ?? $request->user()?->id
            ?? 1);
    }

    public function dashboard(Request $request): JsonResponse
    {
        $userId = $this->resolveUserId($request);
        $monthYear = $request->query('month_year', now()->format('Y-m'));

        $wallets = Wallet::where('user_id', $userId)->orderBy('id')->get();
        $categories = Category::whereNull('user_id')
            ->orWhere('user_id', $userId)
            ->orderBy('id')
            ->get();

        $transactions = Transaction::with(['wallet', 'toWallet', 'category'])
            ->where('user_id', $userId)
            ->orderByDesc('transaction_date')
            ->orderByDesc('id')
            ->limit(200)
            ->get();

        $budgets = Budget::where('user_id', $userId)
            ->where('month_year', $monthYear)
            ->get();

        return response()->json([
            'wallets' => $wallets,
            'categories' => $categories,
            'transactions' => $transactions,
            'budgets' => $budgets,
        ]);
    }

    public function storeWallet(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'type' => 'required|in:cash,bank,ewallet',
            'balance' => 'required|numeric',
            'color' => 'nullable|string|max:20',
            'icon' => 'nullable|string|max:30',
        ]);

        $wallet = Wallet::create([
            'user_id' => $this->resolveUserId($request),
            'name' => $validated['name'],
            'type' => $validated['type'],
            'balance' => $validated['balance'],
            'color' => $validated['color'] ?? '#FFE066',
            'icon' => $validated['icon'] ?? '💵',
        ]);

        return response()->json(['data' => $wallet], 201);
    }

    public function updateWallet(Request $request, Wallet $wallet): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:100',
            'type' => 'sometimes|required|in:cash,bank,ewallet',
            'balance' => 'sometimes|required|numeric',
            'color' => 'nullable|string|max:20',
            'icon' => 'nullable|string|max:30',
        ]);

        $wallet->update($validated);

        return response()->json(['data' => $wallet]);
    }

    public function destroyWallet(Wallet $wallet): JsonResponse
    {
        $wallet->delete();
        return response()->json(['message' => 'Dompet berhasil dihapus']);
    }

    public function storeCategory(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'type' => 'required|in:income,expense',
            'color' => 'nullable|string|max:20',
            'icon' => 'nullable|string|max:30',
        ]);

        $category = Category::create([
            'user_id' => $this->resolveUserId($request),
            'name' => $validated['name'],
            'type' => $validated['type'],
            'color' => $validated['color'] ?? '#FF8B94',
            'icon' => $validated['icon'] ?? '📌',
            'is_default' => false,
        ]);

        return response()->json(['data' => $category], 201);
    }

    public function updateCategory(Request $request, Category $category): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:100',
            'type' => 'sometimes|required|in:income,expense',
            'color' => 'nullable|string|max:20',
            'icon' => 'nullable|string|max:30',
        ]);

        $category->update($validated);

        return response()->json(['data' => $category]);
    }

    public function destroyCategory(Category $category): JsonResponse
    {
        $category->delete();
        return response()->json(['message' => 'Kategori berhasil dihapus']);
    }

    public function storeTransaction(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'wallet_id' => 'required|exists:wallets,id',
            'to_wallet_id' => 'nullable|exists:wallets,id',
            'category_id' => 'nullable|exists:categories,id',
            'type' => 'required|in:income,expense,transfer',
            'amount' => 'required|numeric|min:1',
            'transaction_date' => 'required|date',
            'note' => 'nullable|string|max:255',
            'is_ai_scanned' => 'nullable|boolean',
            'receipt' => 'nullable|image|max:5120',
        ]);

        $receiptPath = null;
        if ($request->hasFile('receipt')) {
            $receiptPath = $request->file('receipt')->store('receipts', 'public');
        }

        $userId = $this->resolveUserId($request);

        $transaction = DB::transaction(function () use ($userId, $validated, $receiptPath) {
            $wallet = Wallet::lockForUpdate()->findOrFail($validated['wallet_id']);

            if ($validated['type'] === 'expense') {
                $wallet->decrement('balance', $validated['amount']);
            } elseif ($validated['type'] === 'income') {
                $wallet->increment('balance', $validated['amount']);
            } elseif ($validated['type'] === 'transfer' && !empty($validated['to_wallet_id'])) {
                $toWallet = Wallet::lockForUpdate()->findOrFail($validated['to_wallet_id']);
                $wallet->decrement('balance', $validated['amount']);
                $toWallet->increment('balance', $validated['amount']);
            }

            return Transaction::create([
                'user_id' => $userId,
                'wallet_id' => $validated['wallet_id'],
                'to_wallet_id' => $validated['to_wallet_id'] ?? null,
                'category_id' => $validated['category_id'] ?? null,
                'type' => $validated['type'],
                'amount' => $validated['amount'],
                'transaction_date' => $validated['transaction_date'],
                'note' => $validated['note'] ?? null,
                'receipt_image_path' => $receiptPath,
                'is_ai_scanned' => (bool) ($validated['is_ai_scanned'] ?? false),
            ]);
        });

        return response()->json([
            'data' => $transaction,
            'wallets' => Wallet::where('user_id', $userId)->orderBy('id')->get(),
        ], 201);
    }

    public function destroyTransaction(Request $request, Transaction $transaction): JsonResponse
    {
        DB::transaction(function () use ($transaction) {
            $wallet = Wallet::lockForUpdate()->find($transaction->wallet_id);
            if ($wallet) {
                if ($transaction->type === 'expense') {
                    $wallet->increment('balance', $transaction->amount);
                } elseif ($transaction->type === 'income') {
                    $wallet->decrement('balance', $transaction->amount);
                } elseif ($transaction->type === 'transfer' && !empty($transaction->to_wallet_id)) {
                    $toWallet = Wallet::lockForUpdate()->find($transaction->to_wallet_id);
                    $wallet->increment('balance', $transaction->amount);
                    if ($toWallet) {
                        $toWallet->decrement('balance', $transaction->amount);
                    }
                }
            }
            $transaction->delete();
        });

        return response()->json([
            'message' => 'Transaksi berhasil dihapus',
            'wallets' => Wallet::where('user_id', $this->resolveUserId($request))->orderBy('id')->get(),
        ]);
    }

    public function upsertBudget(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => 'nullable|exists:categories,id',
            'amount_limit' => 'required|numeric|min:0',
            'month_year' => 'required|string|size:7',
        ]);

        $budget = Budget::updateOrCreate(
            [
                'user_id' => $this->resolveUserId($request),
                'category_id' => $validated['category_id'] ?? null,
                'month_year' => $validated['month_year'],
            ],
            [
                'amount_limit' => $validated['amount_limit'],
            ]
        );

        return response()->json(['data' => $budget]);
    }

    public function scanReceipt(Request $request, GeminiReceiptScannerService $scanner): JsonResponse
    {
        $request->validate([
            'receipt' => 'required|image|max:6144',
        ]);

        $result = $scanner->scanReceipt($request->file('receipt'));

        return response()->json([
            'message' => 'Struk berhasil dipindai oleh Si Oren (Gemini Vision AI)',
            'data' => $result,
        ]);
    }
}
