import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import {
    AcademicCapIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    UserGroupIcon,
    XMarkIcon,
    BookOpenIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Modal from '@/Components/Modal';
import Select from 'react-select';

export default function Classes({ auth, classes = [], teachers = [], subjects = [], categories = [] }) {
    const [showModal, setShowModal] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const [subcategories, setSubcategories] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        name_ar: '',
        main_teacher_id: '',
        teacher_ids: [],
        subject_ids: [],
        max_students: '',
        room_number: '',
        academic_year: '',
        description: '',
        description_ar: '',
        education_category_id: '',
        education_subcategory_id: '',
    });

    const teacherOptions = teachers.map(teacher => ({
        value: teacher.id,
        label: teacher.user?.name || teacher.name,
    }));

    const subjectOptions = subjects.map(subject => ({
        value: subject.id,
        label: subject.name_ar || subject.name,
    }));

    const handleCategoryChange = (categoryId) => {
        const selectedCategory = categories.find(c => c.id === parseInt(categoryId));
        setSubcategories(selectedCategory?.subcategories || []);
        setFormData({
            ...formData,
            education_category_id: categoryId,
            education_subcategory_id: '',
        });
    };

    const handleEdit = (cls) => {
        setEditingClass(cls);
        const selectedCategory = categories.find(c => c.id === cls.education_category_id);
        setSubcategories(selectedCategory?.subcategories || []);
        setFormData({
            name: cls.name || '',
            name_ar: cls.name_ar || '',
            main_teacher_id: cls.main_teacher_id || '',
            teacher_ids: cls.teachers?.map(t => t.id) || [],
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

    const handleCreate = () => {
        setEditingClass(null);
        setSubcategories([]);
        setFormData({
            name: '',
            name_ar: '',
            main_teacher_id: '',
            teacher_ids: [],
            subject_ids: [],
            max_students: '',
            room_number: '',
            academic_year: new Date().getFullYear() + '/' + (new Date().getFullYear() + 1),
            description: '',
            description_ar: '',
            education_category_id: '',
            education_subcategory_id: '',
        });
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const url = editingClass
            ? route('school-admin.classes.update', editingClass.id)
            : route('school-admin.classes.store');
        const method = editingClass ? 'put' : 'post';

        router[method](url, formData, {
            onSuccess: () => {
                toast.success(editingClass ? 'تم تحديث بيانات الفصل' : 'تم إضافة الفصل');
                setShowModal(false);
            },
            onError: (errors) => {
                console.error(errors);
                toast.error('حدث خطأ أثناء حفظ البيانات');
            },
        });
    };

    const handleDelete = (id) => {
        if (confirm('هل أنت متأكد من حذف هذا الفصل؟')) {
            router.delete(route('school-admin.classes.destroy', id), {
                onSuccess: () => {
                    toast.success('تم حذف الفصل');
                },
                onError: () => {
                    toast.error('حدث خطأ أثناء حذف الفصل');
                },
            });
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800">إدارة الفصول</h2>}
        >
            <Head title="إدارة الفصول" />

            <div className="space-y-6">
                <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">الفصول الدراسية</h3>
                        <p className="text-sm text-gray-600">إدارة فصول المدرسة والمعلمين والمواد المسؤولين عنها</p>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white rounded-lg hover:from-cyan-700 hover:to-cyan-800 transition-all"
                    >
                        <PlusIcon className="w-5 h-5 ml-2" />
                        إضافة فصل
                    </button>
                </div>

                {classes.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-xl shadow-lg p-12 text-center"
                    >
                        <AcademicCapIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">لا يوجد فصول</h3>
                        <p className="text-gray-500">ابدأ بإضافة فصول دراسية إلى مدرستك</p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {classes.map((cls, index) => (
                            <motion.div
                                key={cls.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                            >
                                <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xl font-bold text-white">{cls.name_ar || cls.name}</h3>
                                        <AcademicCapIcon className="w-8 h-8 text-white/80" />
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
                                            <UserGroupIcon className="w-4 h-4 text-gray-500" />
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
                                            onClick={() => handleEdit(cls)}
                                            className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                                        >
                                            <PencilIcon className="w-4 h-4 inline ml-1" />
                                            تعديل
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cls.id)}
                                            className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                                        >
                                            <TrashIcon className="w-4 h-4 inline ml-1" />
                                            حذف
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <Modal show={showModal} onClose={() => setShowModal(false)} maxWidth="3xl">
                <div className="p-6 flex flex-col max-h-[90vh]">
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
                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto">
                        <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    اسم الفصل بالعربية *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name_ar}
                                    onChange={(e) => setFormData({...formData, name_ar: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    اسم الفصل بالإنجليزية
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    المستوى التعليمي *
                                </label>
                                <select
                                    value={formData.education_category_id}
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
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    السنة الدراسية *
                                </label>
                                <select
                                    value={formData.education_subcategory_id}
                                    onChange={(e) => setFormData({...formData, education_subcategory_id: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                    disabled={!formData.education_category_id}
                                >
                                    <option value="">اختر السنة الدراسية</option>
                                    {subcategories.map((sub) => (
                                        <option key={sub.id} value={sub.id}>
                                            {sub.name_ar}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    السعة القصوى *
                                </label>
                                <input
                                    type="number"
                                    value={formData.max_students}
                                    onChange={(e) => setFormData({...formData, max_students: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                    placeholder="عدد الطلاب"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    السنة الدراسية
                                </label>
                                <input
                                    type="text"
                                    value={formData.academic_year}
                                    onChange={(e) => setFormData({...formData, academic_year: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                    placeholder="2024/2025"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    رقم القاعة
                                </label>
                                <input
                                    type="text"
                                    value={formData.room_number}
                                    onChange={(e) => setFormData({...formData, room_number: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                    placeholder="مثال: 201"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    المعلم الرئيسي
                                </label>
                                <select
                                    value={formData.main_teacher_id}
                                    onChange={(e) => setFormData({...formData, main_teacher_id: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                >
                                    <option value="">اختر معلم</option>
                                    {teachers.map((teacher) => (
                                        <option key={teacher.id} value={teacher.id}>
                                            {teacher.user?.name || teacher.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    المعلمون
                                </label>
                                <Select
                                    isMulti
                                    options={teacherOptions}
                                    value={teacherOptions.filter(opt => formData.teacher_ids.includes(opt.value))}
                                    onChange={(selected) => setFormData({
                                        ...formData,
                                        teacher_ids: selected ? selected.map(s => s.value) : []
                                    })}
                                    placeholder="اختر المعلمين"
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    المواد الدراسية
                                </label>
                                <Select
                                    isMulti
                                    options={subjectOptions}
                                    value={subjectOptions.filter(opt => formData.subject_ids.includes(opt.value))}
                                    onChange={(selected) => setFormData({
                                        ...formData,
                                        subject_ids: selected ? selected.map(s => s.value) : []
                                    })}
                                    placeholder="اختر المواد"
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الوصف بالعربية
                                </label>
                                <textarea
                                    value={formData.description_ar}
                                    onChange={(e) => setFormData({...formData, description_ar: e.target.value})}
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                    placeholder="وصف الفصل..."
                                />
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
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
