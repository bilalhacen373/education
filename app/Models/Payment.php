<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Payment extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'payer_id',
        'payer_type',
        'payee_id',
        'payee_type',
        'amount',
        'currency',
        'type',
        'status',
        'payment_method',
        'transaction_id',
        'description',
        'description_ar',
        'metadata',
        'due_date',
        'paid_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'due_date' => 'datetime',
        'paid_at' => 'datetime',
        'metadata' => 'array',
    ];

    /**
     * The attributes that should be mutated to dates.
     *
     * @var array<int, string>
     */
    protected $dates = [
        'due_date',
        'paid_at',
    ];

    /**
     * Get the payer model (student, teacher, school).
     */
    public function payer(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the payee model (teacher, school, platform).
     */
    public function payee(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Scope a query to only include pending payments.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope a query to only include completed payments.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope a query to only include failed payments.
     */
    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    /**
     * Scope a query to only include payments of a specific type.
     */
    public function scopeType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope a query to only include payments with due date.
     */
    public function scopeDue($query)
    {
        return $query->whereNotNull('due_date')
            ->where('status', 'pending')
            ->where('due_date', '<=', now());
    }

    /**
     * Check if payment is overdue.
     */
    public function isOverdue(): bool
    {
        return $this->status === 'pending' &&
            $this->due_date &&
            $this->due_date->isPast();
    }

    /**
     * Check if payment is completed.
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Check if payment is pending.
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if payment is failed.
     */
    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    /**
     * Mark payment as completed.
     */
    public function markAsCompleted($transactionId = null, $paymentMethod = null): bool
    {
        return $this->update([
            'status' => 'completed',
            'paid_at' => now(),
            'transaction_id' => $transactionId ?? $this->transaction_id,
            'payment_method' => $paymentMethod ?? $this->payment_method,
        ]);
    }

    /**
     * Mark payment as failed.
     */
    public function markAsFailed(): bool
    {
        return $this->update([
            'status' => 'failed',
            'paid_at' => null,
        ]);
    }

    /**
     * Get formatted amount with currency.
     */
    public function getFormattedAmountAttribute(): string
    {
        $currencySymbols = [
            'SAR' => 'دج',
            'USD' => '$',
            'EUR' => '€',
        ];

        $symbol = $currencySymbols[$this->currency] ?? $this->currency;
        return number_format($this->amount, 2) . ' ' . $symbol;
    }

    /**
     * Get description based on current locale.
     */
    public function getLocalizedDescriptionAttribute(): string
    {
        return app()->getLocale() === 'ar' ? $this->description_ar : $this->description;
    }
}
