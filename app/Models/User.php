<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'name',
        'name_ar',
        'email',
        'password',
        'phone',
        'avatar',
        'user_type',
        'is_active',
        'settings',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'settings' => 'array',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function student()
    {
        return $this->hasOne(Student::class);
    }

    public function teacher()
    {
        return $this->hasOne(Teacher::class);
    }

    public function schools()
    {
        return $this->hasMany(School::class, 'admin_id');
    }

    public function classes()
    {
        return $this->hasMany(ClassModel::class, 'teacher_id');
    }

    public function courses()
    {
        return $this->hasMany(Course::class, 'teacher_id');
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function jobRequests()
    {
        return $this->hasMany(JobRequest::class, 'requester_id');
    }

    public function jobApplications()
    {
        return $this->hasMany(JobApplication::class, 'applicant_id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class, 'reviewer_id');
    }

    public function liveSessions()
    {
        return $this->hasMany(LiveSession::class, 'teacher_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('user_type', $type);
    }

    // Helper methods
    public function isSuperAdmin()
    {
        return $this->user_type === 'super_admin';
    }

    public function isSchoolAdmin()
    {
        return $this->user_type === 'school_admin';
    }

    public function isTeacher()
    {
        return $this->user_type === 'teacher';
    }

    public function isStudent()
    {
        return $this->user_type === 'student';
    }

    public function getAvatarUrlAttribute()
    {
        return $this->avatar ? asset('storage/' . $this->avatar) : asset('images/default-avatar.png');
    }
}
