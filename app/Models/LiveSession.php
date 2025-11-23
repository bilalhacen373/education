<?php

namespace App\Models;




use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LiveSession extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'title',
        'title_ar',
        'description',
        'description_ar',
        'teacher_id',
        'class_id',
        'course_id',
        'scheduled_at',
        'started_at',
        'ended_at',
        'duration_minutes',
        'meeting_url',
        'meeting_id',
        'meeting_password',
        'meeting_platform',
        'status',
        'attendees',
        'recording_url',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'scheduled_at' => 'datetime',
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
        'attendees' => 'array',
        'duration_minutes' => 'integer',
    ];

    /**
     * The attributes that should be mutated to dates.
     *
     * @var array<int, string>
     */
    protected $dates = [
        'scheduled_at',
    ];

    /**
     * Status constants for easy reference.
     */
    const STATUS_SCHEDULED = 'scheduled';
    const STATUS_LIVE = 'live';
    const STATUS_ENDED = 'ended';
    const STATUS_CANCELLED = 'cancelled';

    /**
     * Get the teacher that owns the live session.
     */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class, 'teacher_id');
    }

    /**
     * Get the class that owns the live session.
     */
    public function class(): BelongsTo
    {
        return $this->belongsTo(ClassModel::class, 'class_id');
    }

    /**
     * Get the course that owns the live session.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'course_id');
    }

    /**
     * Scope a query to only include scheduled sessions.
     */
    public function scopeScheduled($query)
    {
        return $query->where('status', self::STATUS_SCHEDULED);
    }

    /**
     * Scope a query to only include live sessions.
     */
    public function scopeLive($query)
    {
        return $query->where('status', self::STATUS_LIVE);
    }

    /**
     * Scope a query to only include ended sessions.
     */
    public function scopeEnded($query)
    {
        return $query->where('status', self::STATUS_ENDED);
    }

    /**
     * Scope a query to only include upcoming sessions.
     */
    public function scopeUpcoming($query)
    {
        return $query->where('status', self::STATUS_SCHEDULED)
            ->where('scheduled_at', '>', now());
    }

    /**
     * Scope a query to only include sessions for a specific teacher.
     */
    public function scopeForTeacher($query, $teacherId)
    {
        return $query->where('teacher_id', $teacherId);
    }

    /**
     * Scope a query to only include sessions for a specific class.
     */
    public function scopeForClass($query, $classId)
    {
        return $query->where('class_id', $classId);
    }

    /**
     * Scope a query to only include sessions for a specific course.
     */
    public function scopeForCourse($query, $courseId)
    {
        return $query->where('course_id', $courseId);
    }

    /**
     * Check if the session is scheduled.
     */
    public function isScheduled(): bool
    {
        return $this->status === self::STATUS_SCHEDULED;
    }

    /**
     * Check if the session is live.
     */
    public function isLive(): bool
    {
        return $this->status === self::STATUS_LIVE;
    }

    /**
     * Check if the session has ended.
     */
    public function isEnded(): bool
    {
        return $this->status === self::STATUS_ENDED;
    }

    /**
     * Check if the session is cancelled.
     */
    public function isCancelled(): bool
    {
        return $this->status === self::STATUS_CANCELLED;
    }

    /**
     * Check if the session is upcoming.
     */
    public function isUpcoming(): bool
    {
        return $this->isScheduled() && $this->scheduled_at->isFuture();
    }

    /**
     * Check if the session is ongoing (live or within scheduled time).
     */
    public function isOngoing(): bool
    {
        if ($this->isLive()) {
            return true;
        }

        if ($this->isScheduled()) {
            $endTime = $this->scheduled_at->addMinutes($this->duration_minutes);
            return now()->between($this->scheduled_at, $endTime);
        }

        return false;
    }

    /**
     * Get the end time of the session.
     */
    public function getEndTimeAttribute()
    {
        return $this->scheduled_at->addMinutes($this->duration_minutes);
    }

    /**
     * Get localized title based on current locale.
     */
    public function getLocalizedTitleAttribute(): string
    {
        return app()->getLocale() === 'ar' ? $this->title_ar : $this->title;
    }

    /**
     * Get localized description based on current locale.
     */
    public function getLocalizedDescriptionAttribute(): string
    {
        return app()->getLocale() === 'ar' ? $this->description_ar : $this->description;
    }

    /**
     * Mark session as live.
     */
    public function markAsLive(): bool
    {
        return $this->update(['status' => self::STATUS_LIVE]);
    }

    /**
     * Mark session as ended.
     */
    public function markAsEnded(): bool
    {
        return $this->update(['status' => self::STATUS_ENDED]);
    }

    /**
     * Mark session as cancelled.
     */
    public function markAsCancelled(): bool
    {
        return $this->update(['status' => self::STATUS_CANCELLED]);
    }

    /**
     * Add attendee to the session.
     */
    public function addAttendee($userId): bool
    {
        $attendees = $this->attendees ?? [];

        if (!in_array($userId, $attendees)) {
            $attendees[] = $userId;
            return $this->update(['attendees' => $attendees]);
        }

        return false;
    }

    /**
     * Remove attendee from the session.
     */
    public function removeAttendee($userId): bool
    {
        $attendees = $this->attendees ?? [];

        if (($key = array_search($userId, $attendees)) !== false) {
            unset($attendees[$key]);
            return $this->update(['attendees' => array_values($attendees)]);
        }

        return false;
    }

    /**
     * Check if a user is attending the session.
     */
    public function isAttending($userId): bool
    {
        $attendees = $this->attendees ?? [];
        return in_array($userId, $attendees);
    }

    /**
     * Get the number of attendees.
     */
    public function getAttendeesCountAttribute(): int
    {
        return count($this->attendees ?? []);
    }
}
