<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'title_ar',
        'description',
        'description_ar',
        'thumbnail',
        'image',
        'teacher_id',
        'class_id',
        'difficulty_level',
        'duration_hours',
        'price',
        'learning_objectives',
        'prerequisites',
        'enrollment_conditions',
        'enrollment_conditions_ar',
        'requires_approval',
        'enrollment_fee',
        'is_published',
        'is_free',
    ];

    protected $casts = [
        'learning_objectives' => 'array',
        'prerequisites' => 'array',
        'is_published' => 'boolean',
        'is_free' => 'boolean',
        'requires_approval' => 'boolean',
        'price' => 'decimal:2',
        'enrollment_fee' => 'decimal:2',
    ];

    protected $appends = ['enrollment_count'];

    public function getEnrollmentCountAttribute()
    {
        if (array_key_exists('enrollment_count', $this->attributes)) {
            return $this->attributes['enrollment_count'];
        }

        return $this->enrollmentRequests()->where('status', 'approved')->count();
    }

    // Relationships
    public function teacher()
    {
        return $this->belongsTo(Teacher::class, 'teacher_id');
    }

    public function class()
    {
        return $this->belongsTo(ClassModel::class, 'class_id');
    }

    public function classes()
    {
        return $this->belongsToMany(ClassModel::class, 'course_class', 'course_id', 'class_id')
            ->withPivot('is_active')
            ->withTimestamps();
    }

    public function subjects()
    {
        return $this->belongsToMany(Subject::class, 'course_subject', 'course_id', 'subject_id')
            ->withPivot('order')
            ->withTimestamps()
            ->orderBy('subjects.order');
    }

    public function lessons()
    {
        return $this->hasMany(Lesson::class)->orderBy('order_index');
    }

    public function liveSessions()
    {
        return $this->hasMany(LiveSession::class);
    }

    public function reviews()
    {
        return $this->morphMany(Review::class, 'reviewee');
    }

    public function enrollmentRequests()
    {
        return $this->hasMany(CourseEnrollmentRequest::class);
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

    public function scopePaid($query)
    {
        return $query->where('is_free', false);
    }

    public function scopeByDifficulty($query, $level)
    {
        return $query->where('difficulty_level', $level);
    }

    public function scopeBySubject($query, $subjectId)
    {
        return $query->whereHas('subjects', function($q) use ($subjectId) {
            $q->where('subjects.id', $subjectId);
        });
    }

    // Helper methods
    public function getThumbnailUrlAttribute()
    {
        return $this->thumbnail ? asset('storage/' . $this->thumbnail) : asset('images/default-course-thumbnail.png');
    }

    public function getImageUrlAttribute()
    {
        return $this->image ? asset('storage/' . $this->image) : asset('images/default-course-image.png');
    }

    public function getLessonCountAttribute()
    {
        return $this->lessons()->count();
    }

    public function getAverageRatingAttribute()
    {
        return $this->reviews()->avg('rating') ?? 0;
    }

    public function getTotalReviewsAttribute()
    {
        return $this->reviews()->count();
    }

//    public function getEnrollmentCountAttribute()
//    {
//        return StudentProgress::whereHas('lesson', function ($query) {
//            $query->where('course_id', $this->id);
//        })->distinct('student_id')->count();
//    }
}
