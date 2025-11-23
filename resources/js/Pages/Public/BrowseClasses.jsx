import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    AcademicCapIcon,
    UserGroupIcon,
    BookOpenIcon,
    BuildingLibraryIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from '@heroicons/react/24/outline';
import FilterPanel, { SearchInput, SelectFilter } from '@/Components/FilterPanel';
import Modal from '@/Components/Modal';

export default function BrowseClasses({ classes, filters, subjects, categories, auth }) {
    const [localFilters, setLocalFilters] = useState(filters);
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);

    const updateFilter = (key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
    };

    const applyFilters = () => {
        router.get(route('public.classes'), localFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setLocalFilters({});
        router.get(route('public.classes'), {}, {
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

    const sortOptions = [
        { value: 'newest', label: 'الأحدث' },
        { value: 'name', label: 'حسب الاسم' },
        { value: 'students', label: 'الأكثر طلاباً' },
    ];

    const subjectOptions = subjects.map(s => ({ value: s.id, label: s.name_ar }));
    const categoryOptions = categories.map(c => ({ value: c.id, label: c.name_ar }));

    const getSubcategoryOptions = () => {
        if (!localFilters.category_id) return [];
        const category = categories.find(c => c.id == localFilters.category_id);
        return category?.subcategories?.map(s => ({ value: s.id, label: s.name_ar })) || [];
    };

    const handleEnrollClick = (classItem) => {
        if (!auth.user) {
            router.visit(route('login'));
            return;
        }
        setSelectedClass(classItem);
        setShowEnrollModal(true);
    };

    return (
        <>
            <Head title="تصفح الفصول" />
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
                                    href={route('public.lessons')}
                                    className="text-gray-700 hover:text-blue-600 font-medium"
                                >
                                    الدروس
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
                                تصفح الفصول الدراسية
                            </h1>
                            <p className="text-gray-600">
                                ابحث عن فصل دراسي مناسب وأرسل طلب انضمام للمعلم
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            <div className="lg:col-span-1">
                                <FilterPanel filters={localFilters}>
                                    <div className="space-y-4">
                                        <SearchInput
                                            value={localFilters.search}
                                            onChange={(value) => updateFilter('search', value)}
                                            placeholder="ابحث عن فصل..."
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

                                        <div>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={localFilters.has_space === 'true'}
                                                    onChange={(e) => {
                                                        updateFilter('has_space', e.target.checked ? 'true' : '');
                                                        applyFilters();
                                                    }}
                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-gray-700">
                                                    فقط الفصول المتاحة
                                                </span>
                                            </label>
                                        </div>

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
                                        {classes.total} فصل متاح
                                    </p>
                                </div>

                                {classes.data.length === 0 ? (
                                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                                        <BuildingLibraryIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            لا توجد فصول
                                        </h3>
                                        <p className="text-gray-600">
                                            جرب تغيير معايير البحث
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                                            {classes.data.map((classItem, index) => (
                                                <ClassCard
                                                    key={classItem.id}
                                                    classItem={classItem}
                                                    index={index}
                                                    onEnroll={handleEnrollClick}
                                                    auth={auth}
                                                />
                                            ))}
                                        </div>

                                        {classes.last_page > 1 && (
                                            <Pagination links={classes.links} />
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showEnrollModal && selectedClass && (
                <EnrollmentModal
                    classItem={selectedClass}
                    show={showEnrollModal}
                    onClose={() => {
                        setShowEnrollModal(false);
                        setSelectedClass(null);
                    }}
                />
            )}
        </>
    );
}

function ClassCard({ classItem, index, onEnroll, auth }) {
    const getActionButton = () => {
        if (!auth.user) {
            return (
                <button
                    onClick={() => window.location.href = route('login')}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                    سجل للانضمام
                </button>
            );
        }

        if (classItem.enrollment_request) {
            if (classItem.enrollment_request.status === 'pending') {
                return (
                    <button
                        disabled
                        className="flex-1 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg font-medium cursor-not-allowed"
                    >
                        قيد المراجعة...
                    </button>
                );
            }
            if (classItem.enrollment_request.status === 'approved') {
                return (
                    <button
                        disabled
                        className="flex-1 bg-green-100 text-green-700 px-4 py-2 rounded-lg font-medium cursor-not-allowed"
                    >
                        أنت مسجل ✓
                    </button>
                );
            }
            if (classItem.enrollment_request.status === 'rejected') {
                return (
                    <button
                        disabled
                        className="flex-1 bg-red-100 text-red-700 px-4 py-2 rounded-lg font-medium cursor-not-allowed"
                    >
                        الطلب مرفوض
                    </button>
                );
            }
        }

        return (
            <button
                onClick={() => onEnroll(classItem)}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
                طلب الانضمام
            </button>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-200"
        >
            <div className="h-32 bg-gradient-to-br from-blue-500 to-purple-600 p-5 flex flex-col justify-between">
                <div className="flex items-start justify-between">
                    <h3 className="text-xl font-bold text-white line-clamp-2">
                        {classItem.name_ar}
                    </h3>
                    {classItem.is_full ? (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full whitespace-nowrap">
                            ممتلئ
                        </span>
                    ) : (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full whitespace-nowrap">
                            متاح
                        </span>
                    )}
                </div>
                {classItem.class_code && (
                    <div className="text-xs text-white/80">
                        كود: {classItem.class_code}
                    </div>
                )}
            </div>

            <div className="p-5">
                {classItem.description_ar && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                        {classItem.description_ar}
                    </p>
                )}

                <div className="space-y-2 mb-4">
                    {classItem.main_teacher && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <AcademicCapIcon className="w-4 h-4" />
                            <span>{classItem.main_teacher.user?.name}</span>
                        </div>
                    )}

                    {classItem.school && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <BuildingLibraryIcon className="w-4 h-4" />
                            <span>{classItem.school.name}</span>
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <UserGroupIcon className="w-4 h-4" />
                        <span>{classItem.students_count} / {classItem.max_students} طالب</span>
                    </div>

                    {classItem.subjects && classItem.subjects.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <BookOpenIcon className="w-4 h-4" />
                            <span>{classItem.subjects.length} مادة</span>
                        </div>
                    )}

                    {classItem.education_category && (
                        <div className="text-xs text-blue-600">
                            {classItem.education_category.name_ar}
                            {classItem.education_subcategory && ` - ${classItem.education_subcategory.name_ar}`}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                    {classItem.is_full ? (
                        <button
                            disabled
                            className="flex-1 bg-gray-300 text-gray-600 px-4 py-2 rounded-lg font-medium cursor-not-allowed"
                        >
                            الفصل ممتلئ
                        </button>
                    ) : (
                        getActionButton()
                    )}

                    <div className="text-xs text-gray-500">
                        {classItem.available_spots} مقعد متبقي
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function EnrollmentModal({ classItem, show, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        message: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('public.classes.request-enrollment', classItem.id), {
            onSuccess: () => {
                reset();
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
                        {classItem.name_ar}
                    </h3>
                    <div className="text-sm text-blue-800 space-y-1">
                        {classItem.main_teacher && (
                            <p>المعلم: {classItem.main_teacher.user?.name}</p>
                        )}
                        {classItem.school && (
                            <p>المدرسة: {classItem.school.name}</p>
                        )}
                        <p>المقاعد المتاحة: {classItem.available_spots}</p>
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
