<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentProgress extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'student_progress';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'student_id',
        'lesson_id',
        'status',
        'progress_percentage',
        'video_progress',
        'documents_read',
        'total_documents',
        'time_spent_minutes',
        'started_at',
        'completed_at',
        'quiz_results',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'progress_percentage' => 'integer',
        'video_progress' => 'integer',
        'documents_read' => 'integer',
        'total_documents' => 'integer',
        'time_spent_minutes' => 'integer',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'quiz_results' => 'array',
    ];

    /**
     * Status constants for easy reference.
     */
    const STATUS_NOT_STARTED = 'not_started';
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_COMPLETED = 'completed';

    /**
     * Get the student that owns the progress.
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id');
    }

    /**
     * Get the lesson that owns the progress.
     */
    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class, 'lesson_id');
    }

    /**
     * Scope a query to only include not started progress.
     */
    public function scopeNotStarted($query)
    {
        return $query->where('status', self::STATUS_NOT_STARTED);
    }

    /**
     * Scope a query to only include in-progress items.
     */
    public function scopeInProgress($query)
    {
        return $query->where('status', self::STATUS_IN_PROGRESS);
    }

    /**
     * Scope a query to only include completed progress.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    /**
     * Scope a query to only include progress for a specific student.
     */
    public function scopeForStudent($query, $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    /**
     * Scope a query to only include progress for a specific lesson.
     */
    public function scopeForLesson($query, $lessonId)
    {
        return $query->where('lesson_id', $lessonId);
    }

    /**
     * Scope a query to only include progress for specific lessons.
     */
    public function scopeForLessons($query, array $lessonIds)
    {
        return $query->whereIn('lesson_id', $lessonIds);
    }

    /**
     * Scope a query to only include progress with minimum percentage.
     */
    public function scopeWithMinimumProgress($query, $percentage)
    {
        return $query->where('progress_percentage', '>=', $percentage);
    }

    /**
     * Check if progress is not started.
     */
    public function isNotStarted(): bool
    {
        return $this->status === self::STATUS_NOT_STARTED;
    }

    /**
     * Check if progress is in progress.
     */
    public function isInProgress(): bool
    {
        return $this->status === self::STATUS_IN_PROGRESS;
    }

    /**
     * Check if progress is completed.
     */
    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    /**
     * Mark progress as started.
     */
    public function markAsStarted(): bool
    {
        return $this->update([
            'status' => self::STATUS_IN_PROGRESS,
            'started_at' => $this->started_at ?? now(),
            'progress_percentage' => max(1, $this->progress_percentage),
        ]);
    }

    /**
     * Mark progress as in progress with specific percentage.
     */
    public function markAsInProgress($percentage, $timeSpentMinutes = null): bool
    {
        $updates = [
            'status' => self::STATUS_IN_PROGRESS,
            'progress_percentage' => min(99, $percentage),
        ];

        if ($timeSpentMinutes !== null) {
            $updates['time_spent_minutes'] = $timeSpentMinutes;
        }

        if (!$this->started_at) {
            $updates['started_at'] = now();
        }

        return $this->update($updates);
    }

    /**
     * Mark progress as completed.
     */
    public function markAsCompleted($timeSpentMinutes = null): bool
    {
        $updates = [
            'status' => self::STATUS_COMPLETED,
            'progress_percentage' => 100,
            'completed_at' => now(),
        ];

        if ($timeSpentMinutes !== null) {
            $updates['time_spent_minutes'] = $timeSpentMinutes;
        }

        if (!$this->started_at) {
            $updates['started_at'] = now();
        }

        return $this->update($updates);
    }

    /**
     * Update progress percentage.
     */
    public function updateProgress($percentage, $timeSpentMinutes = null): bool
    {
        $updates = ['progress_percentage' => min(100, $percentage)];

        if ($percentage >= 100) {
            $updates['status'] = self::STATUS_COMPLETED;
            $updates['completed_at'] = now();
        } elseif ($percentage > 0 && $this->isNotStarted()) {
            $updates['status'] = self::STATUS_IN_PROGRESS;
            $updates['started_at'] = $this->started_at ?? now();
        }

        if ($timeSpentMinutes !== null) {
            $updates['time_spent_minutes'] = $timeSpentMinutes;
        }

        return $this->update($updates);
    }

    /**
     * Add time spent on the lesson.
     */
    public function addTimeSpent($minutes): bool
    {
        return $this->update([
            'time_spent_minutes' => $this->time_spent_minutes + $minutes,
        ]);
    }

    /**
     * Update quiz results.
     */
    public function updateQuizResults($results): bool
    {
        return $this->update([
            'quiz_results' => $results,
        ]);
    }

    /**
     * Get quiz score if available.
     */
    public function getQuizScoreAttribute(): ?float
    {
        if (empty($this->quiz_results) || !isset($this->quiz_results['score'])) {
            return null;
        }

        return $this->quiz_results['score'];
    }

    /**
     * Get total quiz questions if available.
     */
    public function getQuizTotalQuestionsAttribute(): ?int
    {
        if (empty($this->quiz_results) || !isset($this->quiz_results['total_questions'])) {
            return null;
        }

        return $this->quiz_results['total_questions'];
    }

    /**
     * Get quiz percentage if available.
     */
    public function getQuizPercentageAttribute(): ?float
    {
        $score = $this->quiz_score;
        $total = $this->quiz_total_questions;

        if ($score === null || $total === null || $total === 0) {
            return null;
        }

        return round(($score / $total) * 100, 2);
    }

    /**
     * Check if quiz was passed (assuming 60% passing score).
     */
    public function getQuizPassedAttribute(): bool
    {
        $percentage = $this->quiz_percentage;
        return $percentage !== null && $percentage >= 60;
    }

    /**
     * Get progress status color for UI.
     */
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            self::STATUS_COMPLETED => 'green',
            self::STATUS_IN_PROGRESS => 'blue',
            self::STATUS_NOT_STARTED => 'gray',
            default => 'gray',
        };
    }

    /**
     * Get progress status text for UI.
     */
    public function getStatusTextAttribute(): string
    {
        return match($this->status) {
            self::STATUS_COMPLETED => 'مكتمل',
            self::STATUS_IN_PROGRESS => 'قيد التقدم',
            self::STATUS_NOT_STARTED => 'لم يبدأ',
            default => 'غير محدد',
        };
    }

    /**
     * Calculate estimated time remaining.
     */
    public function getEstimatedTimeRemainingAttribute(): ?int
    {
        if ($this->progress_percentage === 0 || $this->time_spent_minutes === 0) {
            return null;
        }

        $timePerPercent = $this->time_spent_minutes / $this->progress_percentage;
        $remainingPercent = 100 - $this->progress_percentage;

        return (int) round($timePerPercent * $remainingPercent);
    }

    /**
     * Reset progress to not started.
     */
    public function resetProgress(): bool
    {
        return $this->update([
            'status' => self::STATUS_NOT_STARTED,
            'progress_percentage' => 0,
            'time_spent_minutes' => 0,
            'started_at' => null,
            'completed_at' => null,
            'quiz_results' => null,
        ]);
    }
}
