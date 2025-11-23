<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'student_id',
        'school_id',
        'class_id',
        'birth_date',
        'gender',
        'parent_name',
        'parent_phone',
        'parent_email',
        'address',
        'address_ar',
        'medical_info',
        'enrollment_type',
        'emergency_contacts',
        'is_active',
        'education_category_id',
        'education_subcategory_id',
        'ai_chat_id',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'emergency_contacts' => 'array',
        'is_active' => 'boolean',
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

    public function class()
    {
        return $this->belongsTo(ClassModel::class, 'class_id');
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    public function grades()
    {
        return $this->hasMany(Grade::class);
    }

    public function progress()
    {
        return $this->hasMany(StudentProgress::class);
    }

    public function payments()
    {
        return $this->morphMany(Payment::class, 'payer');
    }

    public function educationCategory()
    {
        return $this->belongsTo(EducationCategory::class, 'education_category_id');
    }

    public function educationSubcategory()
    {
        return $this->belongsTo(EducationSubcategory::class, 'education_subcategory_id');
    }

    public function aiChatConversation()
    {
        return $this->belongsTo(ChatConversation::class, 'ai_chat_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByEnrollmentType($query, $type)
    {
        return $query->where('enrollment_type', $type);
    }

    // Helper methods
    public function getAgeAttribute()
    {
        return $this->birth_date->age;
    }

    public function getAttendanceRateAttribute()
    {
        $totalDays = $this->attendances()->count();
        if ($totalDays === 0) return 0;

        $presentDays = $this->attendances()->where('status', 'present')->count();
        return round(($presentDays / $totalDays) * 100, 2);
    }

    public function getAverageGradeAttribute()
    {
        return $this->grades()->avg('percentage') ?? 0;
    }
}
