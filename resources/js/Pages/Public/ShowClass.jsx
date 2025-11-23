import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    AcademicCapIcon,
    BookOpenIcon,
    UserGroupIcon,
    StarIcon,
    HeartIcon,
    ShareIcon,
    BuildingLibraryIcon,
    CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import Modal from '@/Components/Modal';

export default function ShowClass({ auth, class: classData, reviews, averageRating, enrollmentRequest, isFavorite, hasReviewed }) {
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [localIsFavorite, setLocalIsFavorite] = useState(isFavorite);
    const [showShareModal, setShowShareModal] = useState(false);

    const toggleFavorite = async () => {
        if (!auth.user) {
            window.location.href = route('login');
            return;
        }

        try {
            const response = await fetch(route('public.favorites.toggle'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({
                    type: 'class',
                    id: classData.id,
                }),
            });

            const data = await response.json();
            setLocalIsFavorite(data.isFavorite);
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const shareLinks = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(classData.name_ar)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(classData.name_ar + ' - ' + window.location.href)}`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(classData.name_ar)}`,
    };

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('تم نسخ الرابط');
    };

    return (
        <>
            <Head title={classData.name_ar} />
            <div className="min-h-screen bg-gray-50" dir="rtl">
                <nav className="bg-white shadow-sm border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <Link href="/" className="text-2xl font-bold text-blue-600">
                                نظام إدارة التعليم
                            </Link>
                            <div className="flex items-center gap-4">
                                <Link
                                    href={route('public.classes')}
                                    className="text-gray-700 hover:text-blue-600 font-medium"
                                >
                                    الفصول
                                </Link>
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                    >
                                        لوحة التحكم
                                    </Link>
                                ) : (
                                    <Link
                                        href={route('login')}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                    >
                                        تسجيل الدخول
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                <div className="py-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-lg shadow-sm overflow-hidden"
                                >
                                    <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 p-8 flex flex-col justify-between">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h1 className="text-3xl font-bold text-white mb-2">
                                                    {classData.name_ar}
                                                </h1>
                                                {classData.class_code && (
                                                    <p className="text-white/90">
                                                        كود الفصل: {classData.class_code}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={toggleFavorite}
                                                    className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                                                >
                                                    {localIsFavorite ? (
                                                        <HeartIconSolid className="w-6 h-6 text-white" />
                                                    ) : (
                                                        <HeartIcon className="w-6 h-6 text-white" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => setShowShareModal(true)}
                                                    className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                                                >
                                                    <ShareIcon className="w-6 h-6 text-white" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-white/90">
                                            {classData.main_teacher && (
                                                <div className="flex items-center gap-1">
                                                    <AcademicCapIcon className="w-4 h-4" />
                                                    <span>{classData.main_teacher.user?.name}</span>
                                                </div>
                                            )}
                                            {averageRating > 0 && (
                                                <div className="flex items-center gap-1">
                                                    <StarIconSolid className="w-4 h-4 text-yellow-300" />
                                                    <span>{averageRating} ({reviews.total} تقييم)</span>
                                                </div>
                                            )}
                                            {classData.is_full ? (
                                                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                                                    ممتلئ
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                                    متاح
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        {classData.description_ar && (
                                            <div className="mb-6">
                                                <h2 className="text-xl font-bold text-gray-900 mb-3">وصف الفصل</h2>
                                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                                    {classData.description_ar}
                                                </p>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                                <UserGroupIcon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                                                <p className="text-2xl font-bold text-blue-900">
                                                    {classData.students_count} / {classData.max_students}
                                                </p>
                                                <p className="text-sm text-blue-700">طالب</p>
                                            </div>
                                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                                <BookOpenIcon className="w-6 h-6 text-green-600 mx-auto mb-2" />
                                                <p className="text-2xl font-bold text-green-900">
                                                    {classData.subjects?.length || 0}
                                                </p>
                                                <p className="text-sm text-green-700">مادة</p>
                                            </div>
                                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                                <AcademicCapIcon className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                                                <p className="text-2xl font-bold text-purple-900">
                                                    {classData.teachers?.length || 0}
                                                </p>
                                                <p className="text-sm text-purple-700">معلم</p>
                                            </div>
                                        </div>

                                        {classData.subjects && classData.subjects.length > 0 && (
                                            <div className="mb-6 border-t pt-6">
                                                <h2 className="text-xl font-bold text-gray-900 mb-4">المواد الدراسية</h2>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                    {classData.subjects.map((subject) => (
                                                        <div
                                                            key={subject.id}
                                                            className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
                                                        >
                                                            <BookOpenIcon className="w-5 h-5 text-gray-600" />
                                                            <span className="text-gray-900 font-medium">{subject.name_ar}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {classData.teachers && classData.teachers.length > 0 && (
                                            <div className="border-t pt-6">
                                                <h2 className="text-xl font-bold text-gray-900 mb-4">المعلمون</h2>
                                                <div className="space-y-3">
                                                    {classData.teachers.map((teacher) => (
                                                        <div
                                                            key={teacher.id}
                                                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                                                        >
                                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                                <AcademicCapIcon className="w-6 h-6 text-blue-600" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-900">{teacher.user?.name}</p>
                                                                {teacher.specialization && (
                                                                    <p className="text-sm text-gray-600">{teacher.specialization}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>

                                <ReviewsSection
                                    reviews={reviews}
                                    averageRating={averageRating}
                                    hasReviewed={hasReviewed}
                                    onReviewClick={() => setShowReviewModal(true)}
                                    auth={auth}
                                />
                            </div>

                            <div className="lg:col-span-1">
                                <EnrollmentCard
                                    classData={classData}
                                    enrollmentRequest={enrollmentRequest}
                                    auth={auth}
                                    onEnrollClick={() => setShowEnrollModal(true)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showEnrollModal && (
                <EnrollmentModal
                    classData={classData}
                    show={showEnrollModal}
                    onClose={() => setShowEnrollModal(false)}
                />
            )}

            {showReviewModal && (
                <ReviewModal
                    type="class"
                    id={classData.id}
                    title={classData.name_ar}
                    show={showReviewModal}
                    onClose={() => setShowReviewModal(false)}
                />
            )}

            {showShareModal && (
                <ShareModal
                    show={showShareModal}
                    onClose={() => setShowShareModal(false)}
                    shareLinks={shareLinks}
                    onCopyLink={copyLink}
                />
            )}
        </>
    );
}

function EnrollmentCard({ classData, enrollmentRequest, auth, onEnrollClick }) {
    const getEnrollmentStatus = () => {
        if (!auth.user) {
            return (
                <button
                    onClick={() => window.location.href = route('login')}
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                    سجل للانضمام
                </button>
            );
        }

        if (classData.is_full) {
            return (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 font-medium text-center">
                        الفصل ممتلئ
                    </p>
                </div>
            );
        }

        if (enrollmentRequest) {
            if (enrollmentRequest.status === 'pending') {
                return (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-yellow-800 font-medium text-center">
                            طلبك قيد المراجعة
                        </p>
                    </div>
                );
            }
            if (enrollmentRequest.status === 'approved') {
                return (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-center gap-2 text-green-800">
                            <CheckCircleIcon className="w-5 h-5" />
                            <p className="font-medium">أنت مسجل في هذا الفصل</p>
                        </div>
                    </div>
                );
            }
            if (enrollmentRequest.status === 'rejected') {
                return (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800 font-medium text-center">
                            تم رفض طلبك
                        </p>
                    </div>
                );
            }
        }

        return (
            <button
                onClick={onEnrollClick}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
                طلب الانضمام للفصل
            </button>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">المقاعد المتاحة</span>
                    <span className="text-2xl font-bold text-blue-600">
                        {classData.available_spots}
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                        className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${(classData.students_count / classData.max_students) * 100}%` }}
                    ></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                    {classData.students_count} من {classData.max_students} طالب
                </p>
            </div>

            {getEnrollmentStatus()}

            <div className="mt-6 space-y-3 border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-3">معلومات الفصل</h3>

                {classData.school && (
                    <div className="flex items-start gap-2 text-sm">
                        <BuildingLibraryIcon className="w-4 h-4 text-gray-600 mt-0.5" />
                        <div>
                            <p className="text-gray-600">المدرسة:</p>
                            <p className="text-gray-900 font-medium">{classData.school.name}</p>
                        </div>
                    </div>
                )}

                {classData.education_category && (
                    <div className="flex items-start gap-2 text-sm">
                        <AcademicCapIcon className="w-4 h-4 text-gray-600 mt-0.5" />
                        <div>
                            <p className="text-gray-600">الفئة التعليمية:</p>
                            <p className="text-gray-900 font-medium">
                                {classData.education_category.name_ar}
                                {classData.education_subcategory && ` - ${classData.education_subcategory.name_ar}`}
                            </p>
                        </div>
                    </div>
                )}

                {classData.academic_year && (
                    <div className="flex items-start gap-2 text-sm">
                        <BookOpenIcon className="w-4 h-4 text-gray-600 mt-0.5" />
                        <div>
                            <p className="text-gray-600">السنة الدراسية:</p>
                            <p className="text-gray-900 font-medium">{classData.academic_year}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function ReviewsSection({ reviews, averageRating, hasReviewed, onReviewClick, auth }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm p-6"
        >
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">التقييمات</h2>
                {auth.user && !hasReviewed && (
                    <button
                        onClick={onReviewClick}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                        اكتب تقييم
                    </button>
                )}
            </div>

            {averageRating > 0 && (
                <div className="flex items-center gap-4 mb-6 p-4 bg-yellow-50 rounded-lg">
                    <div className="text-center">
                        <p className="text-4xl font-bold text-yellow-600">{averageRating}</p>
                        <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                                <StarIconSolid
                                    key={i}
                                    className={`w-4 h-4 ${i < Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="text-sm text-gray-600">
                        <p>{reviews.total} تقييم</p>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {reviews.data.length === 0 ? (
                    <p className="text-center text-gray-600 py-8">لا توجد تقييمات بعد</p>
                ) : (
                    reviews.data.map((review) => (
                        <div key={review.id} className="border-b pb-4 last:border-b-0">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <p className="font-medium text-gray-900">{review.reviewer?.name}</p>
                                    <div className="flex items-center gap-1 mt-1">
                                        {[...Array(5)].map((_, i) => (
                                            <StarIconSolid
                                                key={i}
                                                className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <span className="text-sm text-gray-500">
                                    {new Date(review.created_at).toLocaleDateString('ar-DZ')}
                                </span>
                            </div>
                            {review.comment_ar && (
                                <p className="text-gray-700">{review.comment_ar}</p>
                            )}
                        </div>
                    ))
                )}
            </div>
        </motion.div>
    );
}

function EnrollmentModal({ classData, show, onClose }) {
    const { data, setData, post, processing, errors } = useForm({
        message: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('public.classes.request-enrollment', classData.id), {
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="p-6" dir="rtl">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    طلب الانضمام للفصل
                </h2>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-blue-900 mb-2">
                        {classData.name_ar}
                    </h3>
                    <div className="text-sm text-blue-800 space-y-1">
                        {classData.main_teacher && (
                            <p>المعلم: {classData.main_teacher.user?.name}</p>
                        )}
                        {classData.school && (
                            <p>المدرسة: {classData.school.name}</p>
                        )}
                        <p>المقاعد المتاحة: {classData.available_spots}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            رسالة للمعلم (اختياري)
                        </label>
                        <textarea
                            value={data.message}
                            onChange={(e) => setData('message', e.target.value)}
                            rows="4"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="اكتب رسالة توضح سبب رغبتك بالانضمام للفصل..."
                        />
                        {errors.message && (
                            <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? 'جارٍ الإرسال...' : 'إرسال الطلب'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}

function ReviewModal({ type, id, title, show, onClose }) {
    const { data, setData, post, processing, errors } = useForm({
        type: type,
        id: id,
        rating: 5,
        comment: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('public.reviews.submit'), {
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="p-6" dir="rtl">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    كتابة تقييم
                </h2>

                <p className="text-gray-700 mb-6">{title}</p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            التقييم
                        </label>
                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((rating) => (
                                <button
                                    key={rating}
                                    type="button"
                                    onClick={() => setData('rating', rating)}
                                    className="focus:outline-none"
                                >
                                    {data.rating >= rating ? (
                                        <StarIconSolid className="w-10 h-10 text-yellow-400" />
                                    ) : (
                                        <StarIcon className="w-10 h-10 text-gray-300" />
                                    )}
                                </button>
                            ))}
                        </div>
                        {errors.rating && (
                            <p className="mt-1 text-sm text-red-600">{errors.rating}</p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            تعليقك (اختياري)
                        </label>
                        <textarea
                            value={data.comment}
                            onChange={(e) => setData('comment', e.target.value)}
                            rows="4"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="شارك رأيك..."
                        />
                        {errors.comment && (
                            <p className="mt-1 text-sm text-red-600">{errors.comment}</p>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? 'جارٍ الإرسال...' : 'إرسال التقييم'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}

function ShareModal({ show, onClose, shareLinks, onCopyLink }) {
    return (
        <Modal show={show} onClose={onClose} maxWidth="sm">
            <div className="p-6" dir="rtl">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    مشاركة الفصل
                </h2>

                <div className="grid grid-cols-2 gap-3">
                    <a
                        href={shareLinks.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <span>Facebook</span>
                    </a>
                    <a
                        href={shareLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 p-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                    >
                        <span>Twitter</span>
                    </a>
                    <a
                        href={shareLinks.whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                        <span>WhatsApp</span>
                    </a>
                    <a
                        href={shareLinks.telegram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        <span>Telegram</span>
                    </a>
                </div>

                <button
                    onClick={onCopyLink}
                    className="w-full mt-4 p-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    نسخ الرابط
                </button>
            </div>
        </Modal>
    );
}
