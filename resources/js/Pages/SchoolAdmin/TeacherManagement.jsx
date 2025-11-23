import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { toast } from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon, UserGroupIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function TeacherManagement({ auth, teachers, school, classes }) {
    const [showModal, setShowModal] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState(null);
    const [formData, setFormData] = useState({
        user_name: '',
        user_email: '',
        user_password: '',
        specialization: '',
        qualification: '',
        experience_years: '',
        hourly_rate: '',
        monthly_salary: '',
    });
    const [errors, setErrors] = useState({});

    const openModal = (teacher = null) => {
        if (teacher) {
            setEditingTeacher(teacher);
            setFormData({
                user_name: teacher.user?.name || '',
                user_email: teacher.user?.email || '',
                user_password: '',
                specialization: teacher.specialization || '',
                qualification: teacher.qualification || '',
                experience_years: teacher.experience_years || '',
                hourly_rate: teacher.hourly_rate || '',
                monthly_salary: teacher.monthly_salary || '',
            });
        } else {
            setEditingTeacher(null);
            setFormData({
                user_name: '',
                user_email: '',
                user_password: '',
                specialization: '',
                qualification: '',
                experience_years: '',
                hourly_rate: '',
                monthly_salary: '',
            });
        }
        setErrors({});
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingTeacher(null);
        setFormData({
            user_name: '',
            user_email: '',
            user_password: '',
            specialization: '',
            qualification: '',
            experience_years: '',
            hourly_rate: '',
            monthly_salary: '',
        });
        setErrors({});
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const endpoint = editingTeacher
            ? route('school-admin.teachers.update', editingTeacher.id)
            : route('school-admin.teachers.store');

        const method = editingTeacher ? 'put' : 'post';

        router[method](endpoint, formData, {
            onSuccess: () => {
                toast.success(editingTeacher ? 'تم تحديث المعلم بنجاح' : 'تم إضافة المعلم بنجاح');
                closeModal();
            },
            onError: (errors) => {
                setErrors(errors);
                toast.error('يرجى تصحيح الأخطاء');
            },
        });
    };

    const handleDelete = (teacher) => {
        if (confirm(`هل أنت متأكد من حذف المعلم ${teacher.user?.name}؟`)) {
            router.delete(route('school-admin.teachers.destroy', teacher.id), {
                onSuccess: () => {
                    toast.success('تم حذف المعلم بنجاح');
                },
                onError: () => {
                    toast.error('حدث خطأ أثناء الحذف');
                },
            });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="إدارة المعلمين" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">إدارة المعلمين</h1>
                            <p className="mt-2 text-sm text-gray-600">
                                إدارة المعلمين في {school?.name}
                            </p>
                        </div>
                        <PrimaryButton onClick={() => openModal()}>
                            <PlusIcon className="w-5 h-5 ml-2" />
                            إضافة معلم جديد
                        </PrimaryButton>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm">إجمالي المعلمين</p>
                                    <p className="text-3xl font-bold mt-2">{teachers?.length || 0}</p>
                                </div>
                                <UserGroupIcon className="w-12 h-12 text-blue-200" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm">المعلمين النشطين</p>
                                    <p className="text-3xl font-bold mt-2">
                                        {teachers?.filter(t => t.is_active).length || 0}
                                    </p>
                                </div>
                                <ClockIcon className="w-12 h-12 text-green-200" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-orange-100 text-sm">إجمالي الرواتب الشهرية</p>
                                    <p className="text-3xl font-bold mt-2">
                                        {teachers?.reduce((sum, t) => sum + (parseFloat(t.monthly_salary) || 0), 0).toFixed(2)}دج
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    الاسم
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    البريد الإلكتروني
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    التخصص
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    المؤهل
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    سنوات الخبرة
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    الراتب الشهري
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    الفصول
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
                            {teachers && teachers.length > 0 ? (
                                teachers.map((teacher) => (
                                    <tr key={teacher.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                                                    {teacher.user?.name?.charAt(0)}
                                                </div>
                                                <div className="mr-3">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {teacher.user?.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {teacher.user?.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {teacher.specialization || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {teacher.qualification || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {teacher.experience_years || 0} سنة
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {teacher.monthly_salary ? `${teacher.monthly_salary}دج` : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {teacher.classes && teacher.classes.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {teacher.classes.slice(0, 2).map((cls) => (
                                                        <span key={cls.id} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                                                            {cls.name_ar || cls.name}
                                                        </span>
                                                    ))}
                                                    {teacher.classes.length > 2 && (
                                                        <span className="px-2 py-1 bg-gray-50 text-gray-700 rounded text-xs">
                                                            +{teacher.classes.length - 2}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">لا يوجد</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    teacher.is_active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {teacher.is_active ? 'نشط' : 'غير نشط'}
                                                </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                                <button
                                                    onClick={() => openModal(teacher)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    <PencilIcon className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(teacher)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                                        لا يوجد معلمين حالياً
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Modal show={showModal} onClose={closeModal} maxWidth="2xl">
                <form onSubmit={handleSubmit} className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        {editingTeacher ? 'تعديل معلم' : 'إضافة معلم جديد'}
                    </h2>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="user_name" value="الاسم الكامل" />
                                <TextInput
                                    id="user_name"
                                    name="user_name"
                                    value={formData.user_name}
                                    onChange={handleChange}
                                    className="mt-1 block w-full"
                                    required
                                />
                                <InputError message={errors.user_name} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="user_email" value="البريد الإلكتروني" />
                                <TextInput
                                    id="user_email"
                                    name="user_email"
                                    type="email"
                                    value={formData.user_email}
                                    onChange={handleChange}
                                    className="mt-1 block w-full"
                                    required
                                />
                                <InputError message={errors.user_email} className="mt-2" />
                            </div>

                            {!editingTeacher && (
                                <div>
                                    <InputLabel htmlFor="user_password" value="كلمة المرور" />
                                    <TextInput
                                        id="user_password"
                                        name="user_password"
                                        type="password"
                                        value={formData.user_password}
                                        onChange={handleChange}
                                        className="mt-1 block w-full"
                                        required
                                    />
                                    <InputError message={errors.user_password} className="mt-2" />
                                </div>
                            )}

                            <div>
                                <InputLabel htmlFor="specialization" value="التخصص" />
                                <TextInput
                                    id="specialization"
                                    name="specialization"
                                    value={formData.specialization}
                                    onChange={handleChange}
                                    className="mt-1 block w-full"
                                />
                                <InputError message={errors.specialization} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="qualification" value="المؤهل العلمي" />
                                <TextInput
                                    id="qualification"
                                    name="qualification"
                                    value={formData.qualification}
                                    onChange={handleChange}
                                    className="mt-1 block w-full"
                                />
                                <InputError message={errors.qualification} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="experience_years" value="سنوات الخبرة" />
                                <TextInput
                                    id="experience_years"
                                    name="experience_years"
                                    type="number"
                                    value={formData.experience_years}
                                    onChange={handleChange}
                                    className="mt-1 block w-full"
                                />
                                <InputError message={errors.experience_years} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="hourly_rate" value="الأجر بالساعة (دج)" />
                                <TextInput
                                    id="hourly_rate"
                                    name="hourly_rate"
                                    type="number"
                                    step="0.01"
                                    value={formData.hourly_rate}
                                    onChange={handleChange}
                                    className="mt-1 block w-full"
                                />
                                <InputError message={errors.hourly_rate} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="monthly_salary" value="الراتب الشهري (دج)" />
                                <TextInput
                                    id="monthly_salary"
                                    name="monthly_salary"
                                    type="number"
                                    step="0.01"
                                    value={formData.monthly_salary}
                                    onChange={handleChange}
                                    className="mt-1 block w-full"
                                />
                                <InputError message={errors.monthly_salary} className="mt-2" />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end space-x-4 rtl:space-x-reverse">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                        >
                            إلغاء
                        </button>
                        <PrimaryButton type="submit">
                            {editingTeacher ? 'تحديث' : 'إضافة'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
