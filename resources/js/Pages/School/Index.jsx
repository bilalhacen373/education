import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import {
    BuildingOfficeIcon,
    PencilIcon,
    PlusIcon,
    PhotoIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function SchoolIndex({ auth, school }) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: school?.name || '',
        name_en: school?.name_en || '',
        address: school?.address || '',
        phone: school?.phone || '',
        email: school?.email || '',
        description: school?.description || '',
        terms_and_conditions: school?.terms_and_conditions || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        const url = school ? `/school/${school.id}` : '/school';
        const method = school ? 'put' : 'post';

        router[method](url, formData, {
            onSuccess: () => {
                toast.success(school ? 'تم تحديث بيانات المدرسة' : 'تم إنشاء المدرسة');
                setIsEditing(false);
            },
            onError: () => {
                toast.error('حدث خطأ أثناء حفظ البيانات');
            },
        });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file && school) {
            const formData = new FormData();
            formData.append('logo', file);

            router.post(`/school/${school.id}/upload-logo`, formData, {
                onSuccess: () => {
                    toast.success('تم تحديث شعار المدرسة');
                },
                onError: () => {
                    toast.error('حدث خطأ أثناء رفع الصورة');
                },
            });
        }
    };

    if (!school && !isEditing) {
        return (
            <AuthenticatedLayout
                user={auth.user}
                header={<h2 className="font-semibold text-xl text-gray-800">إدارة المدرسة</h2>}
            >
                <Head title="إدارة المدرسة" />

                <div className="flex items-center justify-center min-h-[400px]">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <BuildingOfficeIcon className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                            لم يتم إنشاء مدرسة بعد
                        </h3>
                        <p className="text-gray-600 mb-8">
                            قم بإنشاء ملف المدرسة الخاص بك للبدء
                        </p>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all"
                        >
                            <PlusIcon className="w-5 h-5 ml-2" />
                            إنشاء مدرسة جديدة
                        </button>
                    </motion.div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800">إدارة المدرسة</h2>}
        >
            <Head title="إدارة المدرسة" />

            <div className="space-y-6">
                {school && !isEditing && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl shadow-lg overflow-hidden"
                    >
                        <div className="relative h-48 bg-gradient-to-r from-blue-500 to-cyan-600">
                            {school.background_image && (
                                <img
                                    src={school.background_image}
                                    alt="Background"
                                    className="w-full h-full object-cover"
                                />
                            )}
                            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                            <div className="absolute bottom-0 right-0 left-0 p-6">
                                <div className="flex items-end justify-between">
                                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                                        <div className="w-24 h-24 bg-white rounded-xl shadow-lg flex items-center justify-center overflow-hidden">
                                            {school.logo ? (
                                                <img src={school.logo} alt="Logo" className="w-full h-full object-cover" />
                                            ) : (
                                                <BuildingOfficeIcon className="w-12 h-12 text-gray-400" />
                                            )}
                                        </div>
                                        <div>
                                            <h1 className="text-3xl font-bold text-white">{school.name}</h1>
                                            <p className="text-blue-100">{school.name_en}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                                    >
                                        <PencilIcon className="w-5 h-5 inline ml-2" />
                                        تعديل
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-2">العنوان</h3>
                                <p className="text-gray-900">{school.address || 'غير محدد'}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-2">الهاتف</h3>
                                <p className="text-gray-900">{school.phone || 'غير محدد'}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-2">البريد الإلكتروني</h3>
                                <p className="text-gray-900">{school.email || 'غير محدد'}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-2">حالة الاشتراك</h3>
                                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                                    school.subscription_status === 'active'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {school.subscription_status === 'active' ? 'نشط' : 'غير نشط'}
                                </span>
                            </div>
                            <div className="md:col-span-2">
                                <h3 className="text-sm font-medium text-gray-500 mb-2">الوصف</h3>
                                <p className="text-gray-900">{school.description || 'لا يوجد وصف'}</p>
                            </div>
                            <div className="md:col-span-2">
                                <h3 className="text-sm font-medium text-gray-500 mb-2">الشروط والأحكام</h3>
                                <p className="text-gray-900 whitespace-pre-wrap">
                                    {school.terms_and_conditions || 'لم يتم تحديد الشروط والأحكام'}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {isEditing && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl shadow-lg p-6"
                    >
                        <h3 className="text-xl font-bold text-gray-900 mb-6">
                            {school ? 'تعديل بيانات المدرسة' : 'إنشاء مدرسة جديدة'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        اسم المدرسة (بالعربية)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        اسم المدرسة (بالإنجليزية)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name_en}
                                        onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        العنوان
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        الهاتف
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        البريد الإلكتروني
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        الوصف
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows="3"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        الشروط والأحكام
                                    </label>
                                    <textarea
                                        value={formData.terms_and_conditions}
                                        onChange={(e) => setFormData({ ...formData, terms_and_conditions: e.target.value })}
                                        rows="6"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="أدخل الشروط والأحكام الخاصة بمدرستك..."
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end space-x-4 rtl:space-x-reverse pt-6 border-t">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        if (school) {
                                            setFormData({
                                                name: school.name,
                                                name_en: school.name_en,
                                                address: school.address,
                                                phone: school.phone,
                                                email: school.email,
                                                description: school.description,
                                                terms_and_conditions: school.terms_and_conditions,
                                            });
                                        }
                                    }}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all"
                                >
                                    {school ? 'حفظ التغييرات' : 'إنشاء المدرسة'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
