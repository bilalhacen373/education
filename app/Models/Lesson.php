<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lesson extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'title_ar',
        'description',
        'description_ar',
        'course_id',
        'teacher_id',
        'sharing_mode',
        'is_standalone',
        'order_index',
        'order',
        'type',
        'content_type',
        'content_url',
        'content_text',
        'video_url',
        'video_path',
        'thumbnail',
        'duration_minutes',
        'notes',
        'resources',
        'documents',
        'media_files',
        'is_published',
        'is_free',
        'subject_id',
    ];

    protected $casts = [
        'resources' => 'array',
        'documents' => 'array',
        'media_files' => 'array',
        'is_published' => 'boolean',
        'is_free' => 'boolean',
        'is_standalone' => 'boolean',
    ];

    // Relationships
    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }

    public function progress()
    {
        return $this->hasMany(StudentProgress::class);
    }

    public function classes()
    {
        return $this->belongsToMany(ClassModel::class, 'lesson_class', 'lesson_id', 'class_id')
            ->withPivot('is_active', 'assigned_at')
            ->withTimestamps();
    }

    public function excludedStudents()
    {
        return $this->belongsToMany(Student::class, 'lesson_student_exclusion', 'lesson_id', 'student_id')
            ->withPivot('reason', 'excluded_at')
            ->withTimestamps();
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    // Scopes
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeFree($query)
    {
        return $query->where('is_free', true);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeStandalone($query)
    {
        return $query->where('is_standalone', true);
    }

    public function scopeCourseAttached($query)
    {
        return $query->where('is_standalone', false)->whereNotNull('course_id');
    }

    public function scopeByTeacher($query, $teacherId)
    {
        return $query->where('teacher_id', $teacherId);
    }

    public function scopeBySharingMode($query, $mode)
    {
        return $query->where('sharing_mode', $mode);
    }

    public function scopeAccessibleByStudent($query, $studentId)
    {
        return $query->where(function($q) use ($studentId) {
            $q->where('sharing_mode', 'public')
                ->orWhere(function($subQ) use ($studentId) {
                    $subQ->where('sharing_mode', 'class')
                        ->whereHas('classes.students', function($classQuery) use ($studentId) {
                            $classQuery->where('students.id', $studentId);
                        });
                })
                ->orWhere(function($subQ) use ($studentId) {
                    $subQ->where('sharing_mode', 'custom')
                        ->whereDoesntHave('excludedStudents', function($excludeQuery) use ($studentId) {
                            $excludeQuery->where('students.id', $studentId);
                        });
                });
        })
            ->where('is_published', true);
    }

    // Helper methods
    public function getContentUrlFullAttribute()
    {
        if (!$this->content_url) return null;

        if (filter_var($this->content_url, FILTER_VALIDATE_URL)) {
            return $this->content_url;
        }

        return asset('storage/' . $this->content_url);
    }

    public function getCompletionRateAttribute()
    {
        $totalProgress = $this->progress()->count();
        if ($totalProgress === 0) return 0;

        $completedProgress = $this->progress()->where('status', 'completed')->count();
        return round(($completedProgress / $totalProgress) * 100, 2);
    }

    public function getAverageProgressAttribute()
    {
        return $this->progress()->avg('progress_percentage') ?? 0;
    }

    public function isAccessibleByStudent($studentId)
    {
        if (!$this->is_published) {
            return false;
        }

        switch ($this->sharing_mode) {
            case 'private':
                return false;

            case 'public':
                return true;

            case 'class':
                return $this->classes()
                    ->whereHas('students', function($q) use ($studentId) {
                        $q->where('students.id', $studentId);
                    })
                    ->exists();

            case 'custom':
                return !$this->excludedStudents()->where('students.id', $studentId)->exists();

            default:
                return false;
        }
    }

    public function getSharedClassesCountAttribute()
    {
        return $this->classes()->count();
    }

    public function getExcludedStudentsCountAttribute()
    {
        return $this->excludedStudents()->count();
    }

    public function getTotalAccessibleStudentsAttribute()
    {
        $classStudentCount = $this->classes()
            ->withCount('students')
            ->get()
            ->sum('students_count');

        return $classStudentCount - $this->excluded_students_count;
    }
}
