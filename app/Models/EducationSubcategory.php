<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EducationSubcategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name_ar',
        'name',
        'display_order',
        'is_final_exam',
    ];

    protected $casts = [
        'category_id' => 'integer',
        'display_order' => 'integer',
        'is_final_exam' => 'boolean',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(EducationCategory::class, 'category_id');
    }

    public function students(): HasMany
    {
        return $this->hasMany(Student::class, 'education_subcategory_id');
    }

    public function classes(): HasMany
    {
        return $this->hasMany(ClassModel::class, 'education_subcategory_id');
    }
}
