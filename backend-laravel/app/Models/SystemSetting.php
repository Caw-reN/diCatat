<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    protected $fillable = [
        'key',
        'value',
        'group',
    ];

    public static function getValue(string $key, ?string $default = null): ?string
    {
        try {
            $setting = static::where('key', $key)->first();
            if ($setting && $setting->value !== null && $setting->value !== '') {
                return $setting->value;
            }
        } catch (\Throwable $e) {
            // Fallback if table isn't migrated yet
        }

        return $default;
    }

    public static function getAllKeyValue(): array
    {
        try {
            return static::query()->pluck('value', 'key')->toArray();
        } catch (\Throwable $e) {
            return [];
        }
    }
}

