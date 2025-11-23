<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class School extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'name_ar',
        'description',
        'description_ar',
        'logo',
        'background_image',
        'address',
        'address_ar',
        'phone',
        'email',
        'website',
        'admin_id',
        'settings',
        'terms_conditions',
        'terms_conditions_ar',
        'is_active',
        'admin_ai_chat_id',
    ];

    protected $casts = [
        'settings' => 'array',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function classes()
    {
        return $this->hasMany(ClassModel::class);
    }

    public function students()
    {
        return $this->hasMany(Student::class);
    }

    public function teachers()
    {
        return $this->hasMany(Teacher::class);
    }

    public function teacherAttendances()
    {
        return $this->hasMany(TeacherAttendance::class);
    }

    public function reviews()
    {
        return $this->morphMany(Review::class, 'reviewee');
    }

    public function adminAiChatConversation()
    {
        return $this->belongsTo(ChatConversation::class, 'admin_ai_chat_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Helper methods
    public function getLogoUrlAttribute()
    {
        return $this->logo ? asset('storage/' . $this->logo) : asset('images/default-school-logo.png');
    }

    public function getBackgroundImageUrlAttribute()
    {
        return $this->background_image ? asset('storage/' . $this->background_image) : null;
    }

    public function getTotalStudentsAttribute()
    {
        return $this->students()->count();
    }

    public function getTotalTeachersAttribute()
    {
        return $this->teachers()->count();
    }

    public function getTotalClassesAttribute()
    {
        return $this->classes()->count();
    }
}
