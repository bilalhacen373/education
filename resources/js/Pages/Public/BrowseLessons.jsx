import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    AcademicCapIcon,
    ClockIcon,
    BookOpenIcon,
    PlayCircleIcon,
    DocumentTextIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    LockClosedIcon,
} from '@heroicons/react/24/outline';
import FilterPanel, { SearchInput, SelectFilter } from '@/Components/FilterPanel';

export default function BrowseLessons({ lessons, filters, subjects, auth }) {
    const [localFilters, setLocalFilters] = useState(filters);

    const updateFilter = (key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
    };

    const applyFilters = () => {
        router.get(route('public.lessons'), localFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setLocalFilters({});
        router.get(route('public.lessons'), {}, {
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

    const typeOptions = [
        { value: 'video', label: 'فيديو' },
        { value: 'document', label: 'مستند' },
        { value: 'text', label: 'نصي' },
        { value: 'interactive', label: 'تفاعلي' },
    ];

    const sortOptions = [
        { value: 'newest', label: 'الأحدث' },
        { value: 'oldest', label: 'الأقدم' },
        { value: 'title', label: 'حسب العنوان' },
    ];

    const subjectOptions = subjects.map(s => ({ value: s.id, label: s.name_ar }));

    return (
        <>
            <Head title="تصفح الدروس" />
            <div className="min-h-screen bg-gray-50" dir="rtl">
                <nav className="bg-white shadow-sm border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <Link href="/" className="text-2xl font-bold text-blue-600">
                                نظام إدارة التعليم
                            </Link>
                            <div className="flex items-center gap-4">
                                <Link
                                    href={route('public.courses')}
                                    className="text-gray-700 hover:text-blue-600 font-medium"
                                >
                                    الكورسات
                                </Link>
                                <Link
                                    href={route('public.classes')}
                                    className="text-gray-700 hover:text-blue-600 font-medium"
                                >
                                    الفصول
                                </Link>
                                <Link
                                    href={route('login')}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                >
                                    تسجيل الدخول
                                </Link>
                            </div>
                        </div>
                    </div>
                </nav>

                <div className="py-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                تصفح الدروس العامة
                            </h1>
                            <p className="text-gray-600">
                                دروس متاحة للجميع - سجل كطالب للوصول للمحتوى الكامل
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            <div className="lg:col-span-1">
                                <FilterPanel filters={localFilters}>
                                    <div className="space-y-4">
                                        <SearchInput
                                            value={localFilters.search}
                                            onChange={(value) => updateFilter('search', value)}
                                            placeholder="ابحث عن درس..."
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
                                            label="نوع الدرس"
                                            value={localFilters.type}
                                            onChange={(value) => {
                                                updateFilter('type', value);
                                                applyFilters();
                                            }}
                                            options={typeOptions}
                                            placeholder="كل الأنواع"
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
                                        {lessons.total} درس متاح
                                    </p>
                                </div>

                                {lessons.data.length === 0 ? (
                                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                                        <BookOpenIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            لا توجد دروس
                                        </h3>
                                        <p className="text-gray-600">
                                            جرب تغيير معايير البحث
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                                            {lessons.data.map((lesson, index) => (
                                                <LessonCard key={lesson.id} lesson={lesson} index={index} auth={auth} />
                                            ))}
                                        </div>

                                        {lessons.last_page > 1 && (
                                            <Pagination links={lessons.links} />
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

function LessonCard({ lesson, index, auth }) {
    const typeIcons = {
        video: PlayCircleIcon,
        document: DocumentTextIcon,
        text: BookOpenIcon,
        interactive: AcademicCapIcon,
    };

    const typeLabels = {
        video: 'فيديو',
        document: 'مستند',
        text: 'نصي',
        interactive: 'تفاعلي',
    };

    const TypeIcon = typeIcons[lesson.type] || BookOpenIcon;

    const getActionButton = () => {
        if (!auth.user) {
            return (
                <Link
                    href={route('login')}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                    <LockClosedIcon className="w-4 h-4" />
                    سجل للوصول
                </Link>
            );
        }

        return (
            <Link
                href={route('public.lessons.show', lesson.id)}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
                عرض الدرس ←
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
            <div className="h-48 bg-gradient-to-br from-green-500 to-emerald-600 relative overflow-hidden flex items-center justify-center">
                <TypeIcon className="w-20 h-20 text-white opacity-80" />
                {lesson.thumbnail && (
                    <img
                        src={`/storage/${lesson.thumbnail}`}
                        alt={lesson.title_ar}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                )}
                <div className="absolute top-3 right-3">
                    {lesson.is_free ? (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            مجاني
                        </span>
                    ) : (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                            مدفوع
                        </span>
                    )}
                </div>
            </div>

            <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                        {lesson.title_ar}
                    </h3>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {lesson.description_ar || 'لا يوجد وصف'}
                </p>

                <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <AcademicCapIcon className="w-4 h-4" />
                        <span>{lesson.teacher?.user?.name}</span>
                    </div>

                    {lesson.subject && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <BookOpenIcon className="w-4 h-4" />
                            <span>{lesson.subject.name_ar}</span>
                        </div>
                    )}

                    {lesson.duration_minutes && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <ClockIcon className="w-4 h-4" />
                            <span>{lesson.duration_minutes} دقيقة</span>
                        </div>
                    )}

                    {lesson.course && (
                        <div className="text-xs text-blue-600">
                            جزء من: {lesson.course.title_ar}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                        <TypeIcon className="w-4 h-4" />
                        {typeLabels[lesson.type]}
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
