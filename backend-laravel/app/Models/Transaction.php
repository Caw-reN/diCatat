<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    protected $fillable = [
        'user_id',
        'wallet_id',
        'to_wallet_id',
        'category_id',
        'type',
        'amount',
        'transaction_date',
        'note',
        'receipt_image_path',
        'is_ai_scanned',
    ];

    protected $casts = [
        'amount' => 'float',
        'is_ai_scanned' => 'boolean',
    ];

    protected $appends = [
        'receipt_image_url',
    ];

    public function getReceiptImageUrlAttribute(): ?string
    {
        if (empty($this->receipt_image_path)) {
            return null;
        }
        if (str_starts_with($this->receipt_image_path, 'http')) {
            return $this->receipt_image_path;
        }
        return '/storage/' . ltrim($this->receipt_image_path, '/');
    }

    public function wallet(): BelongsTo
    {
        return $this->belongsTo(Wallet::class, 'wallet_id');
    }

    public function toWallet(): BelongsTo
    {
        return $this->belongsTo(Wallet::class, 'to_wallet_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
