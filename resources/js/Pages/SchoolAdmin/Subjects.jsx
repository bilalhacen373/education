import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import {
    BookOpenIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    XMarkIcon,
    AcademicCapIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Modal from '@/Components/Modal';

export default function Subjects({ auth, subjects = [] }) {
    const [showModal, setShowModal] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        name_ar: '',
        code: '',
        description: '',
        description_ar: '',
        category: '',
        category_ar: '',
        order: 0,
    });

    const handleEdit = (subject) => {
        setEditingSubject(subject);
        setFormData({
            name: subject.name || '',
            name_ar: subject.name_ar || '',
            code: subject.code || '',
            description: subject.description || '',
            description_ar: subject.description_ar || '',
            category: subject.category || '',
            category_ar: subject.category_ar || '',
            order: subject.order || 0,
        });
        setShowModal(true);
    };

    const handleCreate = () => {
        setEditingSubject(null);
        setFormData({
            name: '',
            name_ar: '',
            code: '',
            description: '',
            description_ar: '',
            category: '',
            category_ar: '',
            order: 0,
        });
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const url = editingSubject
            ? route('school-admin.subjects.update', editingSubject.id)
            : route('school-admin.subjects.store');
        const method = editingSubject ? 'put' : 'post';

        router[method](url, formData, {
            onSuccess: () => {
                toast.success(editingSubject ? 'تم تحديث المادة' : 'تم إضافة المادة');
                setShowModal(false);
            },
            onError: (errors) => {
                console.error(errors);
                toast.error('حدث خطأ أثناء حفظ البيانات');
            },
        });
    };

    const handleDelete = (id) => {
        if (confirm('هل أنت متأكد من حذف هذه المادة؟')) {
            router.delete(route('school-admin.subjects.destroy', id), {
                onSuccess: () => {
                    toast.success('تم حذف المادة');
                },
                onError: () => {
                    toast.error('حدث خطأ أثناء حذف المادة');
                },
            });
        }
    };

    const categories = [...new Set(subjects.map(s => s.category_ar).filter(Boolean))];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800">إدارة المواد الدراسية</h2>}
        >
            <Head title="إدارة المواد" />

            <div className="space-y-6">
                <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">المواد الدراسية</h3>
                        <p className="text-sm text-gray-600">إدارة المواد المتاحة في النظام</p>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white rounded-lg hover:from-cyan-700 hover:to-cyan-800 transition-all"
                    >
                        <PlusIcon className="w-5 h-5 ml-2" />
                        إضافة مادة
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm">إجمالي المواد</p>
                                <p className="text-3xl font-bold mt-2">{subjects.length}</p>
                            </div>
                            <BookOpenIcon className="w-12 h-12 text-blue-200" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm">المواد النشطة</p>
                                <p className="text-3xl font-bold mt-2">
                                    {subjects.filter(s => s.is_active).length}
                                </p>
                            </div>
                            <AcademicCapIcon className="w-12 h-12 text-green-200" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm">الفئات</p>
                                <p className="text-3xl font-bold mt-2">{categories.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {subjects.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-xl shadow-lg p-12 text-center"
                    >
                        <BookOpenIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مواد</h3>
                        <p className="text-gray-500">ابدأ بإضافة المواد الدراسية إلى النظام</p>
                    </motion.div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    الكود
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    اسم المادة
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    الفئة
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    عدد الفصول
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    الترتيب
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    الحالة
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    إجراءات
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {subjects.map((subject) => (
                                <tr key={subject.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-mono text-sm">
                                                {subject.code}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {subject.name_ar}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {subject.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {subject.category_ar || subject.category || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">
                                        {subject.classes_count || 0}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">
                                        {subject.order}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                subject.is_active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {subject.is_active ? 'نشط' : 'غير نشط'}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                            <button
                                                onClick={() => handleEdit(subject)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                <PencilIcon className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(subject.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal show={showModal} onClose={() => setShowModal(false)} maxWidth="2xl">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">
                            {editingSubject ? 'تعديل المادة' : 'إضافة مادة جديدة'}
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
                                    اسم المادة بالعربية *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name_ar}
                                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    اسم المادة بالإنجليزية *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    كود المادة *
                                </label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                    placeholder="مثال: MATH"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الترتيب
                                </label>
                                <input
                                    type="number"
                                    value={formData.order}
                                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الفئة بالعربية
                                </label>
                                <input
                                    type="text"
                                    value={formData.category_ar}
                                    onChange={(e) => setFormData({ ...formData, category_ar: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                    placeholder="مثال: العلوم"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الفئة بالإنجليزية
                                </label>
                                <input
                                    type="text"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                    placeholder="مثال: Science"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الوصف بالعربية
                                </label>
                                <textarea
                                    value={formData.description_ar}
                                    onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                    placeholder="وصف المادة..."
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الوصف بالإنجليزية
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                    placeholder="Subject description..."
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
                                {editingSubject ? 'حفظ التغييرات' : 'إضافة المادة'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
