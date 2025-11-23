<?php

namespace App\Http\Controllers;

use App\Models\EducationCategory;
use App\Models\EducationSubcategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EducationCategoryController extends Controller
{
    public function index()
    {
        $categories = EducationCategory::with('subcategories')
            ->orderBy('display_order')
            ->get();

        return response()->json($categories);
    }

    public function getCategories()
    {
        $categories = EducationCategory::orderBy('display_order')->get();
        return response()->json($categories);
    }

    public function getSubcategories($categoryId)
    {
        $subcategories = EducationSubcategory::where('category_id', $categoryId)
            ->orderBy('display_order')
            ->get();

        return response()->json($subcategories);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name_ar' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'display_order' => 'required|integer',
        ]);

        $category = EducationCategory::create($validated);

        return response()->json($category, 201);
    }

    public function update(Request $request, $id)
    {
        $category = EducationCategory::findOrFail($id);

        $validated = $request->validate([
            'name_ar' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'display_order' => 'required|integer',
        ]);

        $category->update($validated);

        return response()->json($category);
    }

    public function destroy($id)
    {
        $category = EducationCategory::findOrFail($id);
        $category->delete();

        return response()->json(['message' => 'Category deleted successfully']);
    }

    public function storeSubcategory(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:education_categories,id',
            'name_ar' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'display_order' => 'required|integer',
            'is_final_exam' => 'boolean',
        ]);

        $subcategory = EducationSubcategory::create($validated);

        return response()->json($subcategory, 201);
    }

    public function updateSubcategory(Request $request, $id)
    {
        $subcategory = EducationSubcategory::findOrFail($id);

        $validated = $request->validate([
            'category_id' => 'required|exists:education_categories,id',
            'name_ar' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'display_order' => 'required|integer',
            'is_final_exam' => 'boolean',
        ]);

        $subcategory->update($validated);

        return response()->json($subcategory);
    }

    public function destroySubcategory($id)
    {
        $subcategory = EducationSubcategory::findOrFail($id);
        $subcategory->delete();

        return response()->json(['message' => 'Subcategory deleted successfully']);
    }

    public function manage()
    {
        $categories = EducationCategory::with('subcategories')
            ->orderBy('display_order')
            ->get();

        return Inertia::render('SuperAdmin/EducationCategories', [
            'categories' => $categories,
        ]);
    }
}
