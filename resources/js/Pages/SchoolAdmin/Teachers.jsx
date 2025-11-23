import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import {
    UserGroupIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Modal from '@/Components/Modal';

export default function Teachers({ auth, teachers = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        name_ar: '',
        email: '',
        phone: '',
        password: '',
        specialization: '',
        specialization_ar: '',
        qualifications: '',
        qualifications_ar: '',
        experience_years: '',
        employment_type: 'full_time',
        monthly_salary: '',
        hire_date: new Date().toISOString().split('T')[0]
    });

    const filteredTeachers = teachers.filter((teacher) =>
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (teacher.specialization && teacher.specialization.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleEdit = (teacher) => {
        setEditingTeacher(teacher);
        setFormData({
            name: teacher.name,
            name_ar: teacher.name_ar || '',
            email: teacher.email,
            phone: teacher.phone || '',
            password: '',
            specialization: teacher.specialization || '',
            specialization_ar: teacher.specialization_ar || '',
            qualifications: teacher.qualifications || '',
            qualifications_ar: teacher.qualifications_ar || '',
            experience_years: teacher.experience_years || '',
            employment_type: teacher.employment_type || 'full_time',
            monthly_salary: teacher.monthly_salary || '',
            hire_date: teacher.hire_date || new Date().toISOString().split('T')[0]
        });
        setShowModal(true);
    };

    const handleCreate = () => {
        setEditingTeacher(null);
        setFormData({
            name: '',
            name_ar: '',
            email: '',
            phone: '',
            password: '',
            specialization: '',
            specialization_ar: '',
            qualifications: '',
            qualifications_ar: '',
            experience_years: '',
            employment_type: 'full_time',
            monthly_salary: '',
            hire_date: new Date().toISOString().split('T')[0]
        });
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const url = editingTeacher ? `/school-admin/teachers/${editingTeacher.id}` : '/school-admin/teachers';
        const method = editingTeacher ? 'put' : 'post';

        router[method](url, formData, {
            onSuccess: () => {
                toast.success(editingTeacher ? 'تم تحديث بيانات المعلم' : 'تم إضافة المعلم');
                setShowModal(false);
                setFormData({
                    name: '',
                    name_ar: '',
                    email: '',
                    phone: '',
                    password: '',
                    specialization: '',
                    specialization_ar: '',
                    qualifications: '',
                    qualifications_ar: '',
                    experience_years: '',
                    employment_type: 'full_time',
                    monthly_salary: '',
                    hire_date: new Date().toISOString().split('T')[0]
                });
            },
            onError: (errors) => {
                toast.error('حدث خطأ أثناء حفظ البيانات');
                console.error('Errors:', errors);
            },
        });
    };

    const handleDelete = (id) => {
        if (confirm('هل أنت متأكد من حذف هذا المعلم؟')) {
            router.delete(`/school-admin/teachers/${id}`, {
                onSuccess: () => {
                    toast.success('تم حذف المعلم');
                },
                onError: () => {
                    toast.error('حدث خطأ أثناء حذف المعلم');
                },
            });
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800">إدارة المعلمين</h2>}
        >
            <Head title="إدارة المعلمين" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="relative flex-1 w-full sm:max-w-md">
                        <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="البحث عن معلم..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <button
                        onClick={handleCreate}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all"
                    >
                        <PlusIcon className="w-5 h-5 ml-2" />
                        إضافة معلم
                    </button>
                </div>

                {filteredTeachers.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-xl shadow-lg p-12 text-center"
                    >
                        <UserGroupIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {searchTerm ? 'لا توجد نتائج' : 'لا يوجد معلمين'}
                        </h3>
                        <p className="text-gray-500">
                            {searchTerm ? 'جرب البحث بكلمات مختلفة' : 'ابدأ بإضافة معلمين إلى مدرستك'}
                        </p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTeachers.map((teacher, index) => (
                            <motion.div
                                key={teacher.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                            >
                                <div className="bg-gradient-to-r from-blue-500 to-cyan-600 h-24"></div>
                                <div className="p-6 -mt-12">
                                    <div className="w-20 h-20 bg-white rounded-full shadow-lg mx-auto mb-4 flex items-center justify-center">
                                        <span className="text-2xl font-bold text-blue-600">
                                            {teacher.name.charAt(0)}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 text-center mb-1">
                                        {teacher.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 text-center mb-4">
                                        {teacher.specialization || 'مدرس عام'}
                                    </p>
                                    <div className="space-y-2 mb-4 text-sm">
                                        <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
                                            <span className="text-gray-600">البريد الإلكتروني:</span>
                                            <span className="text-gray-900 font-medium">{teacher.email}</span>
                                        </div>
                                        {teacher.phone && (
                                            <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
                                                <span className="text-gray-600">الهاتف:</span>
                                                <span className="text-gray-900 font-medium">{teacher.phone}</span>
                                            </div>
                                        )}
                                        {teacher.monthly_salary && (
                                            <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
                                                <span className="text-gray-600">الراتب:</span>
                                                <span className="text-gray-900 font-medium">{teacher.monthly_salary}دج</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                        <button
                                            onClick={() => handleEdit(teacher)}
                                            className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                                        >
                                            <PencilIcon className="w-4 h-4 inline ml-1" />
                                            تعديل
                                        </button>
                                        <button
                                            onClick={() => handleDelete(teacher.id)}
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

            <Modal show={showModal} onClose={() => setShowModal(false)} maxWidth="2xl">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">
                            {editingTeacher ? 'تعديل بيانات المعلم' : 'إضافة معلم جديد'}
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
                                    الاسم الكامل (إنجليزي) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الاسم الكامل (عربي) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name_ar}
                                    onChange={(e) => setFormData({...formData, name_ar: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    البريد الإلكتروني <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الهاتف
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            {!editingTeacher && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        كلمة المرور <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required={!editingTeacher}
                                        placeholder="اتركه فارغاً إذا لم ترغب في التغيير"
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    التخصص (إنجليزي) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.specialization}
                                    onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    التخصص (عربي) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.specialization_ar}
                                    onChange={(e) => setFormData({...formData, specialization_ar: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    المؤهلات (إنجليزي) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.qualifications}
                                    onChange={(e) => setFormData({...formData, qualifications: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    المؤهلات (عربي) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.qualifications_ar}
                                    onChange={(e) => setFormData({...formData, qualifications_ar: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    سنوات الخبرة <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={formData.experience_years}
                                    onChange={(e) => setFormData({...formData, experience_years: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    نوع التوظيف <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.employment_type}
                                    onChange={(e) => setFormData({...formData, employment_type: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="full_time">دوام كامل</option>
                                    <option value="part_time">دوام جزئي</option>
                                    <option value="freelance">حر</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الراتب (دج)
                                </label>
                                <input
                                    type="number"
                                    value={formData.monthly_salary}
                                    onChange={(e) => setFormData({...formData, monthly_salary: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    step="0.01"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    تاريخ التوظيف
                                </label>
                                <input
                                    type="date"
                                    value={formData.hire_date}
                                    onChange={(e) => setFormData({...formData, hire_date: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all"
                            >
                                {editingTeacher ? 'حفظ التغييرات' : 'إضافة المعلم'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
