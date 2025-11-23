<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClassModel extends Model
{
    use HasFactory;

    protected $table = 'classes';

    protected $fillable = [
        'name',
        'name_ar',
        'description',
        'description_ar',
        'school_id',
        'main_teacher_id',
        'max_students',
        'room_number',
        'class_code',
        'academic_year',
        'settings',
        'is_active',
        'education_category_id',
        'education_subcategory_id',
    ];

    protected $casts = [
        'settings' => 'array',
        'is_active' => 'boolean',
    ];

    protected $appends = ['student_count'];

    public function getCountAttribute()
    {
        if (array_key_exists('student_count', $this->attributes)) {
            return $this->attributes['student_count'];
        }

        return $this->enrollmentRequests()->where('status', 'approved')->count();
    }

    // Relationships
    public function school()
    {
        return $this->belongsTo(School::class);
    }

    public function mainTeacher()
    {
        return $this->belongsTo(Teacher::class, 'main_teacher_id');
    }

    public function teachers()
    {
        return $this->belongsToMany(Teacher::class, 'class_teacher', 'class_id')
            ->withPivot('is_main_teacher', 'subjects_taught')
            ->withTimestamps();
    }

    public function subjects()
    {
        return $this->belongsToMany(Subject::class, 'class_subject', 'class_id')
            ->withPivot('hours_per_week', 'order', 'is_compulsory')
            ->withTimestamps();
    }

    public function students()
    {
        return $this->hasMany(Student::class, 'class_id');
    }

    public function courses()
    {
        return $this->hasMany(Course::class, 'class_id');
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class, 'class_id');
    }

    public function grades()
    {
        return $this->hasMany(Grade::class, 'class_id');
    }

    public function timetables()
    {
        return $this->hasMany(Timetable::class, 'class_id');
    }

    public function liveSessions()
    {
        return $this->hasMany(LiveSession::class, 'class_id');
    }

    public function educationCategory()
    {
        return $this->belongsTo(EducationCategory::class, 'education_category_id');
    }

    public function educationSubcategory()
    {
        return $this->belongsTo(EducationSubcategory::class, 'education_subcategory_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByGradeLevel($query, $level)
    {
        return $query->where('grade_level', $level);
    }

    public function scopeByAcademicYear($query, $year)
    {
        return $query->where('academic_year', $year);
    }

    public function scopeByMainTeacher($query, $teacherId)
    {
        return $query->where('main_teacher_id', $teacherId);
    }

    // Helper methods
    public function getStudentCountAttribute()
    {
        return $this->students()->count();
    }

    public function getAvailableSpotsAttribute()
    {
        return $this->max_students - $this->student_count;
    }

    public function getIsFullAttribute()
    {
        return $this->student_count >= $this->max_students;
    }

    public function getAttendanceRateAttribute()
    {
        $totalAttendances = $this->attendances()->count();
        if ($totalAttendances === 0) return 0;

        $presentAttendances = $this->attendances()->where('status', 'present')->count();
        return round(($presentAttendances / $totalAttendances) * 100, 2);
    }

    public function getAverageGradeAttribute()
    {
        return $this->grades()->avg('percentage') ?? 0;
    }

    public function getMainSubjectsAttribute()
    {
        return $this->subjects()->wherePivot('is_compulsory', true)->get();
    }

    public function getOptionalSubjectsAttribute()
    {
        return $this->subjects()->wherePivot('is_compulsory', false)->get();
    }

    public function getMainTeacherAttribute()
    {
        return $this->teachers()->wherePivot('is_main_teacher', true)->first();
    }
}
