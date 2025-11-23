<?php

namespace App\Models;




use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'student_id',
        'class_id',
        'date',
        'status',
        'check_in_time',
        'check_out_time',
        'notes',
        'notes_ar',
        'marked_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date' => 'date',
        'check_in_time' => 'datetime:H:i',
        'check_out_time' => 'datetime:H:i',
    ];

    /**
     * Status constants for easy reference.
     */
    const STATUS_PRESENT = 'present';
    const STATUS_ABSENT = 'absent';
    const STATUS_LATE = 'late';
    const STATUS_EXCUSED = 'excused';

    /**
     * Get the student that owns the attendance.
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id');
    }

    /**
     * Get the class that owns the attendance.
     */
    public function class(): BelongsTo
    {
        return $this->belongsTo(ClassModel::class, 'class_id');
    }

    /**
     * Get the user who marked the attendance.
     */
    public function markedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'marked_by');
    }

    /**
     * Scope a query to only include present attendances.
     */
    public function scopePresent($query)
    {
        return $query->where('status', self::STATUS_PRESENT);
    }

    /**
     * Scope a query to only include absent attendances.
     */
    public function scopeAbsent($query)
    {
        return $query->where('status', self::STATUS_ABSENT);
    }

    /**
     * Scope a query to only include late attendances.
     */
    public function scopeLate($query)
    {
        return $query->where('status', self::STATUS_LATE);
    }

    /**
     * Scope a query to only include excused attendances.
     */
    public function scopeExcused($query)
    {
        return $query->where('status', self::STATUS_EXCUSED);
    }

    /**
     * Scope a query to only include attendances for a specific student.
     */
    public function scopeForStudent($query, $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    /**
     * Scope a query to only include attendances for a specific class.
     */
    public function scopeForClass($query, $classId)
    {
        return $query->where('class_id', $classId);
    }

    /**
     * Scope a query to only include attendances on a specific date.
     */
    public function scopeForDate($query, $date)
    {
        return $query->where('date', $date);
    }

    /**
     * Scope a query to only include attendances within a date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    /**
     * Check if attendance is present.
     */
    public function isPresent(): bool
    {
        return $this->status === self::STATUS_PRESENT;
    }

    /**
     * Check if attendance is absent.
     */
    public function isAbsent(): bool
    {
        return $this->status === self::STATUS_ABSENT;
    }

    /**
     * Check if attendance is late.
     */
    public function isLate(): bool
    {
        return $this->status === self::STATUS_LATE;
    }

    /**
     * Check if attendance is excused.
     */
    public function isExcused(): bool
    {
        return $this->status === self::STATUS_EXCUSED;
    }

    /**
     * Get localized notes based on current locale.
     */
    public function getLocalizedNotesAttribute(): string
    {
        return app()->getLocale() === 'ar' ? $this->notes_ar : $this->notes;
    }

    /**
     * Get attendance duration in minutes.
     */
    public function getDurationAttribute(): ?int
    {
        if ($this->check_in_time && $this->check_out_time) {
            $checkIn = \Database\Factories\Education\vendor\nesbot\carbon\src\Carbon\Carbon::parse($this->check_in_time);
            $checkOut = \Database\Factories\Education\vendor\nesbot\carbon\src\Carbon\Carbon::parse($this->check_out_time);
            return $checkIn->diffInMinutes($checkOut);
        }

        return null;
    }

    /**
     * Check if student is currently checked in.
     */
    public function isCheckedIn(): bool
    {
        return !is_null($this->check_in_time) && is_null($this->check_out_time);
    }

    /**
     * Check if student has completed attendance (checked out).
     */
    public function isCheckedOut(): bool
    {
        return !is_null($this->check_in_time) && !is_null($this->check_out_time);
    }

    /**
     * Mark attendance as present.
     */
    public function markAsPresent($checkInTime = null, $notes = null, $notesAr = null): bool
    {
        return $this->update([
            'status' => self::STATUS_PRESENT,
            'check_in_time' => $checkInTime ?? $this->check_in_time,
            'notes' => $notes ?? $this->notes,
            'notes_ar' => $notesAr ?? $this->notes_ar,
        ]);
    }

    /**
     * Mark attendance as absent.
     */
    public function markAsAbsent($notes = null, $notesAr = null): bool
    {
        return $this->update([
            'status' => self::STATUS_ABSENT,
            'check_in_time' => null,
            'check_out_time' => null,
            'notes' => $notes ?? $this->notes,
            'notes_ar' => $notesAr ?? $this->notes_ar,
        ]);
    }

    /**
     * Mark attendance as late.
     */
    public function markAsLate($checkInTime = null, $notes = null, $notesAr = null): bool
    {
        return $this->update([
            'status' => self::STATUS_LATE,
            'check_in_time' => $checkInTime ?? $this->check_in_time,
            'notes' => $notes ?? $this->notes,
            'notes_ar' => $notesAr ?? $this->notes_ar,
        ]);
    }

    /**
     * Mark attendance as excused.
     */
    public function markAsExcused($notes = null, $notesAr = null): bool
    {
        return $this->update([
            'status' => self::STATUS_EXCUSED,
            'check_in_time' => null,
            'check_out_time' => null,
            'notes' => $notes ?? $this->notes,
            'notes_ar' => $notesAr ?? $this->notes_ar,
        ]);
    }

    /**
     * Check in student.
     */
    public function checkIn($time = null): bool
    {
        return $this->update([
            'check_in_time' => $time ?? now()->format('H:i:s'),
        ]);
    }

    /**
     * Check out student.
     */
    public function checkOut($time = null): bool
    {
        return $this->update([
            'check_out_time' => $time ?? now()->format('H:i:s'),
        ]);
    }

    /**
     * Get attendance status color for UI.
     */
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            self::STATUS_PRESENT => 'green',
            self::STATUS_ABSENT => 'red',
            self::STATUS_LATE => 'yellow',
            self::STATUS_EXCUSED => 'blue',
            default => 'gray',
        };
    }

    /**
     * Get attendance status text for UI.
     */
    public function getStatusTextAttribute(): string
    {
        return match($this->status) {
            self::STATUS_PRESENT => 'حاضر',
            self::STATUS_ABSENT => 'غائب',
            self::STATUS_LATE => 'متأخر',
            self::STATUS_EXCUSED => 'معذور',
            default => 'غير محدد',
        };
    }
}
