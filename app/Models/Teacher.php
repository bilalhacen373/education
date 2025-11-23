<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Teacher extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'teacher_id',
        'school_id',
        'specialization',
        'specialization_ar',
        'qualifications',
        'qualifications_ar',
        'experience_years',
        'hourly_rate',
        'monthly_salary',
        'hire_date',
        'employment_type',
        'subjects',
        'availability',
        'is_available_for_hire',
        'is_active',
        'ai_chat_id',
    ];

    protected $casts = [
        'hire_date' => 'date',
        'subjects' => 'array',
        'availability' => 'array',
        'is_available_for_hire' => 'boolean',
        'is_active' => 'boolean',
        'hourly_rate' => 'decimal:2',
        'monthly_salary' => 'decimal:2',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function school()
    {
        return $this->belongsTo(School::class);
    }

    public function classes()
    {
        return $this->belongsToMany(ClassModel::class, 'class_teacher', 'teacher_id', 'class_id')
            ->withPivot('is_main_teacher', 'subjects_taught')
            ->withTimestamps();
    }

    public function mainClasses()
    {
        return $this->belongsToMany(ClassModel::class, 'class_teacher')
            ->wherePivot('is_main_teacher', true)
            ->withTimestamps();
    }

    public function subjects()
    {
        return $this->belongsToMany(Subject::class, 'class_teacher')
            ->withPivot('class_id', 'is_main_teacher')
            ->withTimestamps();
    }

    public function courses()
    {
        return $this->hasMany(Course::class, 'teacher_id');
    }

    public function attendances()
    {
        return $this->hasMany(TeacherAttendance::class, 'teacher_id');
    }

    public function timetables()
    {
        return $this->hasMany(Timetable::class, 'teacher_id');
    }

    public function liveSessions()
    {
        return $this->hasMany(LiveSession::class, 'teacher_id');
    }

    public function payments()
    {
        return $this->morphMany(Payment::class, 'payee');
    }

    public function reviews()
    {
        return $this->morphMany(Review::class, 'reviewee');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeAvailableForHire($query)
    {
        return $query->where('is_available_for_hire', true);
    }

    public function scopeByEmploymentType($query, $type)
    {
        return $query->where('employment_type', $type);
    }

    // Helper methods
    public function getAttendanceRateAttribute()
    {
        $totalDays = $this->attendances()->count();
        if ($totalDays === 0) return 100;

        $presentDays = $this->attendances()->where('status', 'present')->count();
        return round(($presentDays / $totalDays) * 100, 2);
    }

    public function getTotalPenaltiesAttribute()
    {
        return $this->attendances()->sum('penalty_amount');
    }

    public function getAverageRatingAttribute()
    {
        return $this->reviews()->avg('rating') ?? 0;
    }

    public function getTotalStudentsAttribute()
    {
        return $this->classes()->withCount('students')->get()->sum('students_count');
    }

    public function getClassCountAttribute()
    {
        return $this->classes()->count();
    }

    public function getMainClassCountAttribute()
    {
        return $this->mainClasses()->count();
    }
}
