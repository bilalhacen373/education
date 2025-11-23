<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EducationCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name_ar',
        'name',
        'display_order',
    ];

    protected $casts = [
        'display_order' => 'integer',
    ];

    public function subcategories(): HasMany
    {
        return $this->hasMany(EducationSubcategory::class, 'category_id')->orderBy('display_order');
    }

    public function students(): HasMany
    {
        return $this->hasMany(Student::class, 'education_category_id');
    }

    public function classes(): HasMany
    {
        return $this->hasMany(ClassModel::class, 'education_category_id');
    }
}
