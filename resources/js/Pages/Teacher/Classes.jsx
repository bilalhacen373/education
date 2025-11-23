import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {Head, Link, router, useForm} from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    PlusIcon,
    AcademicCapIcon,
    UserGroupIcon,
    ClockIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import TextArea from "@/Components/TextArea.jsx";
import {XMarkIcon} from "@heroicons/react/24/outline/index.js";
import Select from "react-select";
import toast from "react-hot-toast";

const ClassCard = ({ cls, index, onEdit, onDelete, onView }) => (
    <motion.div
        key={cls.id}
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        transition={{delay: index * 0.05}}
        className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
    >
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-6">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-white">{cls.name_ar || cls.name}</h3>
                <AcademicCapIcon className="w-8 h-8 text-white/80"/>
            </div>
            <p className="text-cyan-100">{cls.education_subcategory.name_ar || cls.education_subcategory.name || 'مستوى غير محدد'}</p>
            {cls.class_code && (
                <p className="text-cyan-200 text-sm mt-1">الكود: {cls.class_code}</p>
            )}
        </div>
        <div className="p-6 space-y-4">
            <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">المعلم الرئيسي:</span>
                <span className="font-medium text-gray-900">
                    {cls.main_teacher?.user?.name || 'غير محدد'}
                </span>
            </div>

            {cls.teachers && cls.teachers.length > 0 && (
                <div className="text-sm">
                    <span className="text-gray-600">المعلمون ({cls.teachers.length}):</span>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {cls.teachers.slice(0, 3).map((teacher) => (
                            <span key={teacher.id} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                                                        {teacher.user?.name}
                                                    </span>
                        ))}
                        {cls.teachers.length > 3 && (
                            <span className="px-2 py-1 bg-gray-50 text-gray-700 rounded text-xs">
                                                        +{cls.teachers.length - 3} أخرى
                                                    </span>
                        )}
                    </div>
                </div>
            )}

            {cls.subjects && cls.subjects.length > 0 && (
                <div className="text-sm">
                    <span className="text-gray-600">المواد ({cls.subjects.length}):</span>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {cls.subjects.slice(0, 3).map((subject) => (
                            <span key={subject.id} className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                                                        {subject.name_ar || subject.name}
                                                    </span>
                        ))}
                        {cls.subjects.length > 3 && (
                            <span className="px-2 py-1 bg-gray-50 text-gray-700 rounded text-xs">
                                                        +{cls.subjects.length - 3} أخرى
                                                    </span>
                        )}
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">السعة:</span>
                <div className="flex items-center space-x-1 rtl:space-x-reverse">
                    <UserGroupIcon className="w-4 h-4 text-gray-500"/>
                    <span className="font-medium text-gray-900">
                        {cls.student_count || 0} / {cls.max_students || '∞'}
                    </span>
                </div>
            </div>

            {cls.room_number && (
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">رقم القاعة:</span>
                    <span className="font-medium text-gray-900">{cls.room_number}</span>
                </div>
            )}

            <div className="flex items-center space-x-2 rtl:space-x-reverse pt-4 border-t">
                <button
                    onClick={() => onView(cls)}
                    className="flex-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                    <EyeIcon className="w-4 h-4 inline ml-1" />
                    مشاهدة
                </button>
                <button
                    onClick={() => onEdit(cls)}
                    className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                    <PencilIcon className="w-4 h-4 inline ml-1"/>
                    تعديل
                </button>
                <button
                    onClick={() => onDelete(cls.id)}
                    className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                >
                    <TrashIcon className="w-4 h-4 inline ml-1"/>
                    حذف
                </button>
            </div>
        </div>
    </motion.div>
);

export default function Classes({auth, classes = [], subjects = [], categories = []}) {
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    const [editingClass, setEditingClass] = useState(null);
    const [subcategories, setSubcategories] = useState([]);

    const {data, setData, post, put, processing, errors, reset} = useForm({
        name: '',
        name_ar: '',
        description: '',
        description_ar: '',
        max_students: 30,
        room_number: '',
        is_active: true,
        subject_ids: [],
        academic_year: '',
        education_category_id: '',
        education_subcategory_id: '',
    });

    const subjectOptions = subjects.map(subject => ({
        value: subject.id,
        label: subject.name_ar || subject.name,
    }));

    const handleSubmit = (e) => {
        e.preventDefault();

        const url = editingClass
            ? route('teacher.classes.update', editingClass.id)
            : route('teacher.classes.store');

        // استخدم post أو put من useForm بدلاً من router
        if (editingClass) {
            put(url, {
                onSuccess: () => {
                    toast.success('تم تحديث بيانات الفصل');
                    setShowModal(false);
                    reset();
                    setEditingClass(null);
                },
                onError: (errors) => {
                    console.error(errors);
                    toast.error('حدث خطأ أثناء حفظ البيانات');
                },
            });
        } else {
            post(url, {
                onSuccess: () => {
                    toast.success('تم إضافة الفصل');
                    setShowModal(false);
                    reset();
                },
                onError: (errors) => {
                    console.error(errors);
                    toast.error('حدث خطأ أثناء حفظ البيانات');
                },
            });
        }
    };

    const handleCategoryChange = (categoryId) => {
        const selectedCategory = categories.find(c => c.id === parseInt(categoryId));
        setSubcategories(selectedCategory?.subcategories || []);
        setData({
            ...data,
            education_category_id: categoryId,
            education_subcategory_id: '',
        });
    };

    const handleEdit = (cls) => {
        setEditingClass(cls);
        const selectedCategory = categories.find(c => c.id === cls.education_category_id);
        setSubcategories(selectedCategory?.subcategories || []);
        setData({
            name: cls.name || '',
            name_ar: cls.name_ar || '',
            subject_ids: cls.subjects?.map(s => s.id) || [],
            max_students: cls.max_students || '',
            room_number: cls.room_number || '',
            academic_year: cls.academic_year || '',
            description: cls.description || '',
            description_ar: cls.description_ar || '',
            education_category_id: cls.education_category_id || '',
            education_subcategory_id: cls.education_subcategory_id || '',
        });
        setShowModal(true);
    };

    const handleView = (classItem) => {
        setSelectedClass(classItem);
        setShowViewModal(true);
    };

    const handleDelete = (classItem) => {
        if (confirm('هل أنت متأكد من حذف هذا الفصل؟')) {
            // Delete logic here
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">إدارة الفصول</h2>
                    <PrimaryButton onClick={() => setShowModal(true)}>
                        <PlusIcon className="w-5 h-5 ltr:mr-2 rtl:ml-2"/>
                        إضافة فصل جديد
                    </PrimaryButton>
                </div>
            }
        >
            <Head title="إدارة الفصول"/>

            <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white"
                    >
                        <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
                            <div>
                                <p className="text-blue-100">إجمالي الفصول</p>
                                <p className="text-3xl font-bold">{classes.length}</p>
                            </div>
                            <AcademicCapIcon className="w-12 h-12 text-blue-200"/>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{delay: 0.1}}
                        className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white"
                    >
                        <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
                            <div>
                                <p className="text-green-100">الفصول النشطة</p>
                                <p className="text-3xl font-bold">{classes.filter(c => c.is_active).length}</p>
                            </div>
                            <UserGroupIcon className="w-12 h-12 text-green-200"/>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{delay: 0.2}}
                        className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white"
                    >
                        <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
                            <div>
                                <p className="text-purple-100">إجمالي الطلاب</p>
                                <p className="text-3xl font-bold">{classes.reduce((sum, c) => sum + (c.student_count || 0), 0)}</p>
                            </div>
                            <UserGroupIcon className="w-12 h-12 text-purple-200"/>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{delay: 0.3}}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white"
                    >
                        <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
                            <div>
                                <p className="text-orange-100">متوسط الحضور</p>
                                <p className="text-3xl font-bold">85%</p>
                            </div>
                            <ClockIcon className="w-12 h-12 text-orange-200"/>
                        </div>
                    </motion.div>
                </div>

                {/* Classes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {classes.map((cls, index) => (
                        <ClassCard
                            key={cls.id}
                            cls={cls}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onView={handleView}
                        />
                    ))}
                </div>

                {classes.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                    >
                        <AcademicCapIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد فصول</h3>
                        <p className="text-gray-500 mb-6">ابدأ بإنشاء فصل جديد لإدارة طلابك</p>
                        <PrimaryButton onClick={() => setShowModal(true)}>
                            إضافة فصل جديد
                        </PrimaryButton>
                    </motion.div>
                )}
            </div>

            <Modal show={showModal} onClose={() => setShowModal(false)} maxWidth="3xl">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">
                            {editingClass ? 'تعديل بيانات الفصل' : 'إضافة فصل جديد'}
                        </h3>
                        <button
                            onClick={() => setShowModal(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    اسم الفصل بالعربية *
                                </label>
                                <input
                                    type="text"
                                    value={data.name_ar}
                                    onChange={(e) => setData('name_ar', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                />
                                <InputError message={errors.name_ar} className="mt-2"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    اسم الفصل بالإنجليزية
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                />
                                <InputError message={errors.name} className="mt-2"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    المستوى التعليمي *
                                </label>
                                <select
                                    value={data.education_category_id}
                                    onChange={(e) => handleCategoryChange(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                >
                                    <option value="">اختر المستوى التعليمي</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name_ar}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.education_category_id} className="mt-2"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    السنة الدراسية *
                                </label>
                                <select
                                    value={data.education_subcategory_id}
                                    onChange={(e) => setData('education_subcategory_id', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                    disabled={!data.education_category_id}
                                >
                                    <option value="">اختر السنة الدراسية</option>
                                    {subcategories.map((sub) => (
                                        <option key={sub.id} value={sub.id}>
                                            {sub.name_ar}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.education_subcategory_id} className="mt-2"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    السعة القصوى *
                                </label>
                                <input
                                    type="number"
                                    value={data.max_students}
                                    onChange={(e) => setData('max_students', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                    placeholder="عدد الطلاب"
                                    required
                                />
                                <InputError message={errors.max_students} className="mt-2"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    العام الدراسي
                                </label>
                                <input
                                    type="text"
                                    value={data.academic_year}
                                    onChange={(e) => setData('academic_year', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                    placeholder="2024/2025"
                                />
                                <InputError message={errors.academic_year} className="mt-2"/>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    رقم القاعة
                                </label>
                                <input
                                    type="text"
                                    value={data.room_number}
                                    onChange={(e) => setData('room_number', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                    placeholder="مثال: 201"
                                />
                                <InputError message={errors.room_number} className="mt-2"/>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    المواد الدراسية
                                </label>
                                <Select
                                    isMulti
                                    options={subjectOptions}
                                    value={subjectOptions.filter(opt => data.subject_ids.includes(opt.value))}
                                    onChange={(selected) => setData({
                                        ...data,
                                        subject_ids: selected ? selected.map(s => s.value) : []
                                    })}
                                    placeholder="اختر المواد"
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                />
                                <InputError message={errors.subject_ids} className="mt-2"/>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الوصف بالعربية
                                </label>
                                <textarea
                                    value={data.description_ar}
                                    onChange={(e) => setData({ ...data, description_ar: e.target.value })}
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                    placeholder="وصف الفصل..."
                                />
                                <InputError message={errors.description_ar} className="mt-2"/>
                            </div>
                        </div>

                        <div className="flex items-center justify-end space-x-4 rtl:space-x-reverse pt-4">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white rounded-lg hover:from-cyan-700 hover:to-cyan-800 transition-all"
                            >
                                {editingClass ? 'حفظ التغييرات' : 'إضافة الفصل'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* View Modal */}
            <Modal show={showViewModal} onClose={() => setShowViewModal(false)} maxWidth="4xl">
                <div className="p-6 overflow-y-auto">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">تفاصيل الفصل الدراسي</h2>
                    {selectedClass && (
                        <div className="space-y-6">
                            {/* Basic Information */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="text-md font-medium text-gray-900 mb-4">المعلومات الأساسية</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">اسم الفصل (عربي)</label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedClass.name_ar}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">اسم الفصل (إنجليزي)</label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedClass.name}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">رمز الفصل</label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedClass.class_code || 'غير محدد'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">السنة الأكاديمية</label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedClass.academic_year || 'غير محدد'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">رقم القاعة</label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedClass.room_number || 'غير محدد'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">الحالة</label>
                                        <span className={`mt-1 inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                            selectedClass.is_active
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                {selectedClass.is_active ? 'نشط' : 'غير نشط'}
                            </span>
                                    </div>
                                </div>
                            </div>

                            {/* Students Information */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="text-md font-medium text-gray-900 mb-4">معلومات الطلاب</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">عدد الطلاب المسجلين</label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedClass.student_count || 0} طالب</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">الحد الأقصى للطلاب</label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedClass.max_students} طالب</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">المقاعد المتاحة</label>
                                        <p className={`mt-1 text-sm font-medium ${
                                            (selectedClass.max_students - (selectedClass.student_count || 0)) > 0
                                                ? 'text-green-600'
                                                : 'text-red-600'
                                        }`}>
                                            {selectedClass.max_students - (selectedClass.student_count || 0)} مقعد
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Teacher Information */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="text-md font-medium text-gray-900 mb-4">معلومات المعلمين</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">المعلم الرئيسي</label>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {selectedClass.main_teacher?.user?.name || 'غير محدد'}
                                        </p>
                                    </div>
                                    {selectedClass.teachers && selectedClass.teachers.length > 0 && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">المعلمون الإضافيون</label>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedClass.teachers
                                                    .filter(teacher => teacher.id !== selectedClass.main_teacher_id)
                                                    .map(teacher => (
                                                        <span key={teacher.id} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                                {teacher.user?.name}
                                            </span>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Subjects Information */}
                            {selectedClass.subjects && selectedClass.subjects.length > 0 && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-md font-medium text-gray-900 mb-4">المواد الدراسية</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">المواد الإجبارية</label>
                                            <div className="space-y-1">
                                                {selectedClass.subjects
                                                    .filter(subject => subject.pivot?.is_compulsory !== false)
                                                    .map(subject => (
                                                        <div key={subject.id} className="flex justify-between items-center text-sm">
                                                            <span className="text-gray-900">{subject.name_ar || subject.name_ar}</span>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Education Category */}
                            {(selectedClass.education_category || selectedClass.education_subcategory) && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-md font-medium text-gray-900 mb-4">التصنيف التعليمي</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {selectedClass.education_category && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">الفئة الرئيسية</label>
                                                <p className="mt-1 text-sm text-gray-900">{selectedClass.education_category.name_ar}</p>
                                            </div>
                                        )}
                                        {selectedClass.education_subcategory && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">الفئة الفرعية</label>
                                                <p className="mt-1 text-sm text-gray-900">{selectedClass.education_subcategory.name_ar}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Statistics */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="text-md font-medium text-gray-900 mb-4">الإحصائيات</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">عدد الكورسات</label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedClass.courses_count || 0} كورس</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">نسبة الحضور</label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedClass.attendance_rate || 0}%</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">متوسط الدرجات</label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedClass.average_grade || 0}%</p>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            {selectedClass.description_ar && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-md font-medium text-gray-900 mb-2">وصف الفصل</h3>
                                    <p className="text-sm text-gray-700 leading-relaxed">{selectedClass.description_ar}</p>
                                </div>
                            )}

                            <div className="flex justify-end pt-4 border-t border-gray-200">
                                <SecondaryButton onClick={() => setShowViewModal(false)}>
                                    إغلاق
                                </SecondaryButton>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
