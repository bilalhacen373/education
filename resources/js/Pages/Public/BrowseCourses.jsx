import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    AcademicCapIcon,
    ClockIcon,
    UserGroupIcon,
    BookOpenIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import FilterPanel, { SearchInput, SelectFilter } from '@/Components/FilterPanel';

export default function BrowseCourses({ courses, filters, subjects, categories, auth }) {
    const [localFilters, setLocalFilters] = useState(filters);

    const updateFilter = (key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
    };

    const applyFilters = () => {
        router.get(route('public.courses'), localFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setLocalFilters({});
        router.get(route('public.courses'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (localFilters.search !== filters.search) {
                applyFilters();
            }
        }, 500);

        return () => clearTimeout(debounceTimer);
    }, [localFilters.search]);

    const difficultyOptions = [
        { value: 'beginner', label: 'مبتدئ' },
        { value: 'intermediate', label: 'متوسط' },
        { value: 'advanced', label: 'متقدم' },
    ];

    const sortOptions = [
        { value: 'newest', label: 'الأحدث' },
        { value: 'popular', label: 'الأكثر شعبية' },
        { value: 'price_low', label: 'السعر: من الأقل للأعلى' },
        { value: 'price_high', label: 'السعر: من الأعلى للأقل' },
    ];

    const subjectOptions = subjects.map(s => ({ value: s.id, label: s.name_ar }));
    const categoryOptions = categories.map(c => ({ value: c.id, label: c.name_ar }));

    const getSubcategoryOptions = () => {
        if (!localFilters.category_id) return [];
        const category = categories.find(c => c.id == localFilters.category_id);
        return category?.subcategories?.map(s => ({ value: s.id, label: s.name_ar })) || [];
    };

    return (
        <>
            <Head title="تصفح الكورسات" />
            <div className="min-h-screen bg-gray-50" dir="rtl">
                <nav className="bg-white shadow-sm border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <Link href="/" className="text-2xl font-bold text-blue-600">
                                نظام إدارة التعليم
                            </Link>
                            <div className="flex items-center gap-4">
                                <Link
                                    href={route('public.lessons')}
                                    className="text-gray-700 hover:text-blue-600 font-medium"
                                >
                                    الدروس
                                </Link>
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
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                تصفح الكورسات المتاحة
                            </h1>
                            <p className="text-gray-600">
                                اكتشف آلاف الكورسات في مختلف المجالات
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            <div className="lg:col-span-1">
                                <FilterPanel filters={localFilters}>
                                    <div className="space-y-4">
                                        <SearchInput
                                            value={localFilters.search}
                                            onChange={(value) => updateFilter('search', value)}
                                            placeholder="ابحث عن كورس..."
                                        />

                                        <SelectFilter
                                            label="المادة"
                                            value={localFilters.subject_id}
                                            onChange={(value) => {
                                                updateFilter('subject_id', value);
                                                applyFilters();
                                            }}
                                            options={subjectOptions}
                                            placeholder="كل المواد"
                                        />

                                        <SelectFilter
                                            label="الفئة التعليمية"
                                            value={localFilters.category_id}
                                            onChange={(value) => {
                                                updateFilter('category_id', value);
                                                updateFilter('subcategory_id', '');
                                                applyFilters();
                                            }}
                                            options={categoryOptions}
                                            placeholder="كل الفئات"
                                        />

                                        {localFilters.category_id && getSubcategoryOptions().length > 0 && (
                                            <SelectFilter
                                                label="الفئة الفرعية"
                                                value={localFilters.subcategory_id}
                                                onChange={(value) => {
                                                    updateFilter('subcategory_id', value);
                                                    applyFilters();
                                                }}
                                                options={getSubcategoryOptions()}
                                                placeholder="كل الفئات الفرعية"
                                            />
                                        )}

                                        <SelectFilter
                                            label="مستوى الصعوبة"
                                            value={localFilters.difficulty}
                                            onChange={(value) => {
                                                updateFilter('difficulty', value);
                                                applyFilters();
                                            }}
                                            options={difficultyOptions}
                                            placeholder="كل المستويات"
                                        />

                                        <SelectFilter
                                            label="السعر"
                                            value={localFilters.is_free}
                                            onChange={(value) => {
                                                updateFilter('is_free', value);
                                                applyFilters();
                                            }}
                                            options={[
                                                { value: 'true', label: 'مجاني' },
                                                { value: 'false', label: 'مدفوع' },
                                            ]}
                                            placeholder="الكل"
                                        />

                                        <SelectFilter
                                            label="ترتيب حسب"
                                            value={localFilters.sort}
                                            onChange={(value) => {
                                                updateFilter('sort', value);
                                                applyFilters();
                                            }}
                                            options={sortOptions}
                                            placeholder="الأحدث"
                                        />

                                        <button
                                            onClick={clearFilters}
                                            className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
                                        >
                                            مسح الفلاتر
                                        </button>
                                    </div>
                                </FilterPanel>
                            </div>

                            <div className="lg:col-span-3">
                                <div className="mb-4 flex items-center justify-between">
                                    <p className="text-gray-600">
                                        {courses.total} كورس متاح
                                    </p>
                                </div>

                                {courses.data.length === 0 ? (
                                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                                        <BookOpenIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            لا توجد كورسات
                                        </h3>
                                        <p className="text-gray-600">
                                            جرب تغيير معايير البحث
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                                            {courses.data.map((course, index) => (
                                                <CourseCard key={course.id} course={course} index={index} auth={auth} />
                                            ))}
                                        </div>

                                        {courses.last_page > 1 && (
                                            <Pagination links={courses.links} />
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function CourseCard({ course, index, auth }) {
    const difficultyLabels = {
        beginner: 'مبتدئ',
        intermediate: 'متوسط',
        advanced: 'متقدم',
    };

    const difficultyColors = {
        beginner: 'bg-green-100 text-green-800',
        intermediate: 'bg-yellow-100 text-yellow-800',
        advanced: 'bg-red-100 text-red-800',
    };

    const getActionButton = () => {
        if (!auth.user) {
            return (
                <Link
                    href={route('login')}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                    سجل للوصول ←
                </Link>
            );
        }

        if (course.enrollment_request) {
            if (course.enrollment_request.status === 'pending') {
                return (
                    <span className="text-yellow-600 font-medium text-sm">
                        قيد المراجعة...
                    </span>
                );
            }
            if (course.enrollment_request.status === 'approved') {
                return (
                    <span className="text-green-600 font-medium text-sm">
                        مسجل ✓
                    </span>
                );
            }
            if (course.enrollment_request.status === 'rejected') {
                return (
                    <span className="text-red-600 font-medium text-sm">
                        مرفوض
                    </span>
                );
            }
        }

        return (
            <Link
                href={route('public.courses.show', course.id)}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
                عرض التفاصيل ←
            </Link>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-200"
        >
            {course.image && (
                <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-600 relative overflow-hidden">
                    <img
                        src={`/storage/${course.image}`}
                        alt={course.title_ar}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                </div>
            )}

            <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                        {course.title_ar}
                    </h3>
                    {course.is_free ? (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full whitespace-nowrap">
                            مجاني
                        </span>
                    ) : (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full whitespace-nowrap">
                            {course.price} دج
                        </span>
                    )}
                </div>

                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {course.description_ar}
                </p>

                <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <AcademicCapIcon className="w-4 h-4" />
                        <span>{course.teacher?.user?.name}</span>
                    </div>

                    {course.average_rating > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <StarIconSolid className="w-4 h-4 text-yellow-400" />
                            <span>{parseFloat(course.average_rating).toFixed(1)}</span>
                        </div>
                    )}

                    {course.lessons_count > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <BookOpenIcon className="w-4 h-4" />
                            <span>{course.lessons_count} درس</span>
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <ClockIcon className="w-4 h-4" />
                        <span>{course.duration_hours} ساعة</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <UserGroupIcon className="w-4 h-4" />
                        <span>{course.enrollment_count} طالب </span>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full ${difficultyColors[course.difficulty_level]}`}>
                        {difficultyLabels[course.difficulty_level]}
                    </span>

                    {getActionButton()}
                </div>
            </div>
        </motion.div>
    );
}

function Pagination({ links }) {
    return (
        <div className="mt-8 flex items-center justify-center gap-2">
            {links.map((link, index) => {
                if (link.url === null) return null;

                const isActive = link.active;
                const isPrev = link.label.includes('Previous');
                const isNext = link.label.includes('Next');

                let label = link.label;
                if (isPrev) label = <ChevronRightIcon className="w-5 h-5" />;
                if (isNext) label = <ChevronLeftIcon className="w-5 h-5" />;

                return (
                    <Link
                        key={index}
                        href={link.url}
                        preserveScroll
                        className={`
                            px-4 py-2 rounded-lg font-medium transition-all duration-200
                            ${isActive
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                        }
                        `}
                    >
                        {label}
                    </Link>
                );
            })}
        </div>
    );
}
