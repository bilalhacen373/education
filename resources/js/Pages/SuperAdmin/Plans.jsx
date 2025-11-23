import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    CheckCircleIcon,
    XMarkIcon,
    CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Modal from '@/Components/Modal';

const PlanCard = ({ plan, onEdit, onDelete }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white rounded-xl shadow-lg overflow-hidden border-2 ${
            plan.is_popular ? 'border-yellow-400' : 'border-transparent'
        } hover:shadow-xl transition-all`}
    >
        {plan.is_popular && (
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-center py-2">
                <span className="text-white font-bold text-sm">الأكثر شعبية</span>
            </div>
        )}
        <div className="p-6">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600">{plan.description}</p>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <button
                        onClick={() => onEdit(plan)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => onDelete(plan)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="mb-6">
                <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-blue-600">{plan.price}</span>
                    <span className="text-gray-600 mr-2 rtl:ml-2">دج</span>
                    <span className="text-gray-500">/ {plan.duration_days} يوم</span>
                </div>
            </div>

            <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-gray-600">الحد الأقصى للمعلمين</span>
                    <span className="font-medium text-gray-900">
                        {plan.max_teachers === -1 ? 'غير محدود' : plan.max_teachers}
                    </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-gray-600">الحد الأقصى للطلاب</span>
                    <span className="font-medium text-gray-900">
                        {plan.max_students === -1 ? 'غير محدود' : plan.max_students}
                    </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-gray-600">الحد الأقصى للفصول</span>
                    <span className="font-medium text-gray-900">
                        {plan.max_classes === -1 ? 'غير محدود' : plan.max_classes}
                    </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-gray-600">مساحة التخزين</span>
                    <span className="font-medium text-gray-900">
                        {plan.storage_gb === -1 ? 'غير محدودة' : `${plan.storage_gb} جيجا`}
                    </span>
                </div>
            </div>

            {plan.features && plan.features.length > 0 && (
                <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 mb-3">المميزات</h4>
                    {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start space-x-2 rtl:space-x-reverse">
                            <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">عدد المشتركين</span>
                    <span className="font-medium text-gray-900">{plan.subscribers_count || 0}</span>
                </div>
            </div>
        </div>
    </motion.div>
);

export default function Plans({ auth, plans = [] }) {
    const [showModal, setShowModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        duration_days: '',
        max_teachers: '',
        max_students: '',
        max_classes: '',
        storage_gb: '',
        features: [''],
        is_popular: false,
    });

    const handleEdit = (plan) => {
        setEditingPlan(plan);
        setFormData({
            name: plan.name,
            description: plan.description,
            price: plan.price,
            duration_days: plan.duration_days,
            max_teachers: plan.max_teachers === -1 ? '' : plan.max_teachers,
            max_students: plan.max_students === -1 ? '' : plan.max_students,
            max_classes: plan.max_classes === -1 ? '' : plan.max_classes,
            storage_gb: plan.storage_gb === -1 ? '' : plan.storage_gb,
            features: plan.features || [''],
            is_popular: plan.is_popular,
        });
        setShowModal(true);
    };

    const handleCreate = () => {
        setEditingPlan(null);
        setFormData({
            name: '',
            description: '',
            price: '',
            duration_days: '',
            max_teachers: '',
            max_students: '',
            max_classes: '',
            storage_gb: '',
            features: [''],
            is_popular: false,
        });
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const data = {
            ...formData,
            max_teachers: formData.max_teachers === '' ? -1 : formData.max_teachers,
            max_students: formData.max_students === '' ? -1 : formData.max_students,
            max_classes: formData.max_classes === '' ? -1 : formData.max_classes,
            storage_gb: formData.storage_gb === '' ? -1 : formData.storage_gb,
        };

        const url = editingPlan ? `/admin/plans/${editingPlan.id}` : '/admin/plans';
        const method = editingPlan ? 'put' : 'post';

        router[method](url, data, {
            onSuccess: () => {
                toast.success(editingPlan ? 'تم تحديث الخطة' : 'تم إضافة الخطة');
                setShowModal(false);
            },
            onError: () => {
                toast.error('حدث خطأ أثناء حفظ البيانات');
            },
        });
    };

    const handleDelete = (plan) => {
        if (confirm('هل أنت متأكد من حذف هذه الخطة؟')) {
            router.delete(`/admin/plans/${plan.id}`, {
                onSuccess: () => {
                    toast.success('تم حذف الخطة');
                },
                onError: () => {
                    toast.error('حدث خطأ أثناء حذف الخطة');
                },
            });
        }
    };

    const addFeature = () => {
        setFormData({ ...formData, features: [...formData.features, ''] });
    };

    const removeFeature = (index) => {
        const newFeatures = formData.features.filter((_, i) => i !== index);
        setFormData({ ...formData, features: newFeatures });
    };

    const updateFeature = (index, value) => {
        const newFeatures = [...formData.features];
        newFeatures[index] = value;
        setFormData({ ...formData, features: newFeatures });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800">إدارة الخطط والعروض</h2>}
        >
            <Head title="إدارة الخطط" />

            <div className="space-y-6">
                <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">خطط الاشتراك</h3>
                        <p className="text-sm text-gray-600">إدارة خطط الاشتراك المتاحة للمدارس</p>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all"
                    >
                        <PlusIcon className="w-5 h-5 ml-2" />
                        إضافة خطة جديدة
                    </button>
                </div>

                {plans.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-xl shadow-lg p-12 text-center"
                    >
                        <CurrencyDollarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد خطط</h3>
                        <p className="text-gray-500">ابدأ بإضافة خطط اشتراك للمدارس</p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {plans.map((plan) => (
                            <PlanCard
                                key={plan.id}
                                plan={plan}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </div>

            <Modal show={showModal} onClose={() => setShowModal(false)} maxWidth="3xl">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">
                            {editingPlan ? 'تعديل الخطة' : 'إضافة خطة جديدة'}
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
                                    اسم الخطة
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
                                    السعر (دج)
                                </label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    step="0.01"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الوصف
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows="2"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    المدة (أيام)
                                </label>
                                <input
                                    type="number"
                                    value={formData.duration_days}
                                    onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الحد الأقصى للمعلمين (اتركه فارغاً لغير محدود)
                                </label>
                                <input
                                    type="number"
                                    value={formData.max_teachers}
                                    onChange={(e) => setFormData({ ...formData, max_teachers: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الحد الأقصى للطلاب (اتركه فارغاً لغير محدود)
                                </label>
                                <input
                                    type="number"
                                    value={formData.max_students}
                                    onChange={(e) => setFormData({ ...formData, max_students: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الحد الأقصى للفصول (اتركه فارغاً لغير محدود)
                                </label>
                                <input
                                    type="number"
                                    value={formData.max_classes}
                                    onChange={(e) => setFormData({ ...formData, max_classes: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    مساحة التخزين (جيجا) (اتركه فارغاً لغير محدود)
                                </label>
                                <input
                                    type="number"
                                    value={formData.storage_gb}
                                    onChange={(e) => setFormData({ ...formData, storage_gb: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                المميزات
                            </label>
                            {formData.features.map((feature, index) => (
                                <div key={index} className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                                    <input
                                        type="text"
                                        value={feature}
                                        onChange={(e) => updateFeature(index, e.target.value)}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="أدخل ميزة"
                                    />
                                    {formData.features.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeFeature(index)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addFeature}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                                + إضافة ميزة
                            </button>
                        </div>

                        <div>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.is_popular}
                                    onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="mr-2 text-sm text-gray-700">تحديد كخطة شائعة</span>
                            </label>
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
                                {editingPlan ? 'حفظ التغييرات' : 'إضافة الخطة'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
