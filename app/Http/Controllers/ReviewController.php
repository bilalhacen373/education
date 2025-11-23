<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Http\Controllers\Controller;




use Illuminate\Http\Request;
use Inertia\Inertia;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        $query = Review::with(['reviewer', 'reviewable']);

        if ($request->has('reviewable_type') && $request->has('reviewable_id')) {
            $query->where('reviewable_type', $request->reviewable_type)
                  ->where('reviewable_id', $request->reviewable_id);
        }

        if ($request->has('rating')) {
            $query->where('rating', $request->rating);
        }

        $reviews = $query->latest()->paginate(15);

        return Inertia::render('Reviews/Index', [
            'reviews' => $reviews,
            'filters' => $request->only(['reviewable_type', 'reviewable_id', 'rating']),
        ]);
    }

    public function create(Request $request)
    {
        $reviewableType = $request->get('reviewable_type');
        $reviewableId = $request->get('reviewable_id');

        $reviewable = null;
        if ($reviewableType && $reviewableId) {
            $modelClass = $this->getModelClass($reviewableType);
            if ($modelClass) {
                $reviewable = $modelClass::find($reviewableId);
            }
        }

        return Inertia::render('Reviews/Create', [
            'reviewable' => $reviewable,
            'reviewableType' => $reviewableType,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'reviewable_type' => 'required|string',
            'reviewable_id' => 'required|integer',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string',
        ]);

        $existingReview = Review::where('reviewer_id', auth()->id())
            ->where('reviewable_type', $validated['reviewable_type'])
            ->where('reviewable_id', $validated['reviewable_id'])
            ->first();

        if ($existingReview) {
            return back()->withErrors(['error' => 'لقد قمت بتقييم هذا العنصر مسبقاً']);
        }

        $validated['reviewer_id'] = auth()->id();

        $review = Review::create($validated);

        return back()->with('success', 'تم إضافة التقييم بنجاح');
    }

    public function show(Review $review)
    {
        $review->load(['reviewer', 'reviewable']);

        return Inertia::render('Reviews/Show', [
            'review' => $review,
        ]);
    }

    public function update(Request $request, Review $review)
    {
        $this->authorize('update', $review);

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string',
        ]);

        $review->update($validated);

        return back()->with('success', 'تم تحديث التقييم بنجاح');
    }

    public function destroy(Review $review)
    {
        $this->authorize('delete', $review);

        $review->delete();

        return redirect()->route('reviews.index')
            ->with('success', 'تم حذف التقييم بنجاح');
    }

    public function getReviewsForEntity(Request $request, $type, $id)
    {
        $modelClass = $this->getModelClass($type);

        if (!$modelClass) {
            return response()->json(['error' => 'Invalid type'], 400);
        }

        $entity = $modelClass::find($id);

        if (!$entity) {
            return response()->json(['error' => 'Entity not found'], 404);
        }

        $reviews = Review::where('reviewable_type', $modelClass)
            ->where('reviewable_id', $id)
            ->with('reviewer')
            ->latest()
            ->paginate(10);

        $averageRating = Review::where('reviewable_type', $modelClass)
            ->where('reviewable_id', $id)
            ->avg('rating');

        $ratingCounts = Review::where('reviewable_type', $modelClass)
            ->where('reviewable_id', $id)
            ->selectRaw('rating, COUNT(*) as count')
            ->groupBy('rating')
            ->pluck('count', 'rating');

        return response()->json([
            'reviews' => $reviews,
            'averageRating' => round($averageRating, 1),
            'totalReviews' => $reviews->total(),
            'ratingCounts' => $ratingCounts,
        ]);
    }

    private function getModelClass($type)
    {
        $types = [
            'school' => School::class,
            'teacher' => Teacher::class,
            'student' => Student::class,
            'course' => Course::class,
        ];

        return $types[$type] ?? null;
    }
}
