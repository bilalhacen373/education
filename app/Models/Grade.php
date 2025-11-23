<?php

namespace App\Models;



use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Grade extends Model
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
        'subject',
        'subject_ar',
        'grade_type',
        'title',
        'title_ar',
        'score',
        'max_score',
        'percentage',
        'letter_grade',
        'comments',
        'comments_ar',
        'graded_date',
        'graded_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'score' => 'decimal:2',
        'max_score' => 'decimal:2',
        'percentage' => 'decimal:2',
        'graded_date' => 'date',
    ];

    /**
     * Grade type constants for easy reference.
     */
    const TYPE_QUIZ = 'quiz';
    const TYPE_ASSIGNMENT = 'assignment';
    const TYPE_EXAM = 'exam';
    const TYPE_PARTICIPATION = 'participation';
    const TYPE_FINAL = 'final';

    /**
     * Get the student that owns the grade.
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id');
    }

    /**
     * Get the class that owns the grade.
     */
    public function class(): BelongsTo
    {
        return $this->belongsTo(Classes::class, 'class_id');
    }

    /**
     * Get the teacher who graded this.
     */
    public function gradedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'graded_by');
    }

    /**
     * Scope a query to only include quiz grades.
     */
    public function scopeQuizzes($query)
    {
        return $query->where('grade_type', self::TYPE_QUIZ);
    }

    /**
     * Scope a query to only include assignment grades.
     */
    public function scopeAssignments($query)
    {
        return $query->where('grade_type', self::TYPE_ASSIGNMENT);
    }

    /**
     * Scope a query to only include exam grades.
     */
    public function scopeExams($query)
    {
        return $query->where('grade_type', self::TYPE_EXAM);
    }

    /**
     * Scope a query to only include participation grades.
     */
    public function scopeParticipation($query)
    {
        return $query->where('grade_type', self::TYPE_PARTICIPATION);
    }

    /**
     * Scope a query to only include final grades.
     */
    public function scopeFinal($query)
    {
        return $query->where('grade_type', self::TYPE_FINAL);
    }

    /**
     * Scope a query to only include grades for a specific student.
     */
    public function scopeForStudent($query, $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    /**
     * Scope a query to only include grades for a specific class.
     */
    public function scopeForClass($query, $classId)
    {
        return $query->where('class_id', $classId);
    }

    /**
     * Scope a query to only include grades for a specific subject.
     */
    public function scopeForSubject($query, $subject)
    {
        return $query->where('subject', $subject);
    }

    /**
     * Scope a query to only include grades within a date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('graded_date', [$startDate, $endDate]);
    }

    /**
     * Scope a query to only include grades above a certain percentage.
     */
    public function scopeAbovePercentage($query, $percentage)
    {
        return $query->where('percentage', '>=', $percentage);
    }

    /**
     * Scope a query to only include grades below a certain percentage.
     */
    public function scopeBelowPercentage($query, $percentage)
    {
        return $query->where('percentage', '<', $percentage);
    }

    /**
     * Check if grade is a quiz.
     */
    public function isQuiz(): bool
    {
        return $this->grade_type === self::TYPE_QUIZ;
    }

    /**
     * Check if grade is an assignment.
     */
    public function isAssignment(): bool
    {
        return $this->grade_type === self::TYPE_ASSIGNMENT;
    }

    /**
     * Check if grade is an exam.
     */
    public function isExam(): bool
    {
        return $this->grade_type === self::TYPE_EXAM;
    }

    /**
     * Check if grade is for participation.
     */
    public function isParticipation(): bool
    {
        return $this->grade_type === self::TYPE_PARTICIPATION;
    }

    /**
     * Check if grade is final.
     */
    public function isFinal(): bool
    {
        return $this->grade_type === self::TYPE_FINAL;
    }

    /**
     * Get localized subject based on current locale.
     */
    public function getLocalizedSubjectAttribute(): string
    {
        return app()->getLocale() === 'ar' ? $this->subject_ar : $this->subject;
    }

    /**
     * Get localized title based on current locale.
     */
    public function getLocalizedTitleAttribute(): string
    {
        return app()->getLocale() === 'ar' ? $this->title_ar : $this->title;
    }

    /**
     * Get localized comments based on current locale.
     */
    public function getLocalizedCommentsAttribute(): string
    {
        return app()->getLocale() === 'ar' ? $this->comments_ar : $this->comments;
    }

    /**
     * Calculate percentage based on score and max score.
     */
    public function calculatePercentage(): float
    {
        if ($this->max_score == 0) {
            return 0;
        }

        return round(($this->score / $this->max_score) * 100, 2);
    }

    /**
     * Determine letter grade based on percentage.
     */
    public function calculateLetterGrade(): string
    {
        $percentage = $this->percentage;

        if ($percentage >= 95) return 'A+';
        if ($percentage >= 90) return 'A';
        if ($percentage >= 85) return 'B+';
        if ($percentage >= 80) return 'B';
        if ($percentage >= 75) return 'C+';
        if ($percentage >= 70) return 'C';
        if ($percentage >= 65) return 'D+';
        if ($percentage >= 60) return 'D';
        return 'F';
    }

    /**
     * Get grade point value (GPA scale).
     */
    public function getGradePointAttribute(): float
    {
        return match($this->letter_grade) {
            'A+' => 4.0,
            'A' => 4.0,
            'B+' => 3.5,
            'B' => 3.0,
            'C+' => 2.5,
            'C' => 2.0,
            'D+' => 1.5,
            'D' => 1.0,
            'F' => 0.0,
            default => 0.0,
        };
    }

    /**
     * Check if grade is passing (D or above).
     */
    public function isPassing(): bool
    {
        return $this->percentage >= 60;
    }

    /**
     * Check if grade is excellent (A- or above).
     */
    public function isExcellent(): bool
    {
        return $this->percentage >= 90;
    }

    /**
     * Check if grade is good (B- or above).
     */
    public function isGood(): bool
    {
        return $this->percentage >= 80;
    }

    /**
     * Check if grade is average (C- or above).
     */
    public function isAverage(): bool
    {
        return $this->percentage >= 70;
    }

    /**
     * Get grade color for UI based on percentage.
     */
    public function getGradeColorAttribute(): string
    {
        if ($this->percentage >= 90) return 'green';
        if ($this->percentage >= 80) return 'blue';
        if ($this->percentage >= 70) return 'yellow';
        if ($this->percentage >= 60) return 'orange';
        return 'red';
    }

    /**
     * Get grade status text for UI.
     */
    public function getGradeStatusAttribute(): string
    {
        if ($this->percentage >= 90) return 'ممتاز';
        if ($this->percentage >= 80) return 'جيد جداً';
        if ($this->percentage >= 70) return 'جيد';
        if ($this->percentage >= 60) return 'مقبول';
        return 'راسب';
    }

    /**
     * Update grade with automatic percentage and letter grade calculation.
     */
    public function updateGrade($score, $maxScore, $comments = null, $commentsAr = null): bool
    {
        $percentage = round(($score / $maxScore) * 100, 2);
        $letterGrade = $this->calculateLetterGrade();

        return $this->update([
            'score' => $score,
            'max_score' => $maxScore,
            'percentage' => $percentage,
            'letter_grade' => $letterGrade,
            'comments' => $comments ?? $this->comments,
            'comments_ar' => $commentsAr ?? $this->comments_ar,
        ]);
    }

    /**
     * Get formatted score (e.g., "85/100").
     */
    public function getFormattedScoreAttribute(): string
    {
        return "{$this->score}/{$this->max_score}";
    }

    /**
     * Get grade weight based on type (for GPA calculation).
     */
    public function getGradeWeightAttribute(): float
    {
        return match($this->grade_type) {
            self::TYPE_FINAL => 0.4,
            self::TYPE_EXAM => 0.3,
            self::TYPE_QUIZ => 0.15,
            self::TYPE_ASSIGNMENT => 0.1,
            self::TYPE_PARTICIPATION => 0.05,
            default => 0.1,
        };
    }

    /**
     * Get weighted grade point.
     */
    public function getWeightedGradePointAttribute(): float
    {
        return $this->grade_point * $this->grade_weight;
    }
}
