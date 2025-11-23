import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import TextArea from '@/Components/TextArea';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { toast } from 'react-hot-toast';
import { PlusIcon, UserGroupIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function JobRequests({ auth, jobRequests, school }) {
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        specialization: '',
        requirements: '',
        experience_years: '',
        employment_type: 'full_time',
        salary_range_min: '',
        salary_range_max: '',
        deadline: '',
        number_of_positions: 1,
    });
    const [errors, setErrors] = useState({});

    const handleSubmit = (e) => {
        e.preventDefault();

        router.post(route('job-requests.store'), formData, {
            onSuccess: () => {
                toast.success('تم نشر طلب التوظيف بنجاح');
                setShowModal(false);
                setFormData({
                    title: '',
                    description: '',
                    specialization: '',
                    requirements: '',
                    experience_years: '',
                    employment_type: 'full_time',
                    salary_range_min: '',
                    salary_range_max: '',
                    deadline: '',
                    number_of_positions: 1,
                });
                setErrors({});
            },
            onError: (errors) => {
                setErrors(errors);
                toast.error('يرجى تصحيح الأخطاء');
            },
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleStatusChange = (requestId, status) => {
        router.put(route('job-requests.update', requestId), { status }, {
            onSuccess: () => {
                toast.success('تم تحديث الحالة بنجاح');
            },
            onError: () => {
                toast.error('حدث خطأ أثناء التحديث');
            },
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'bg-green-100 text-green-800';
            case 'closed': return 'bg-gray-100 text-gray-800';
            case 'filled': return 'bg-blue-100 text-blue-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'open': return 'مفتوح';
            case 'closed': return 'مغلق';
            case 'filled': return 'تم التعيين';
            default: return status;
        }
    };

    const openRequests = jobRequests?.filter(r => r.status === 'open').length || 0;
    const totalApplications = jobRequests?.reduce((sum, r) => sum + (r.applications_count || 0), 0) || 0;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="طلبات توظيف المعلمين" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">طلبات توظيف المعلمين</h1>
                            <p className="mt-2 text-sm text-gray-600">
                                نشر وإدارة طلبات التوظيف للمعلمين الجدد
                            </p>
                        </div>
                        <PrimaryButton onClick={() => setShowModal(true)}>
                            <PlusIcon className="w-5 h-5 ml-2" />
                            نشر طلب توظيف جديد
                        </PrimaryButton>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm">الطلبات المفتوحة</p>
                                    <p className="text-3xl font-bold mt-2">{openRequests}</p>
                                </div>
                                <ClockIcon className="w-12 h-12 text-green-200" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm">إجمالي الطلبات</p>
                                    <p className="text-3xl font-bold mt-2">{jobRequests?.length || 0}</p>
                                </div>
                                <UserGroupIcon className="w-12 h-12 text-blue-200" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-orange-100 text-sm">إجمالي التطبيقات</p>
                                    <p className="text-3xl font-bold mt-2">{totalApplications}</p>
                                </div>
                                <CheckCircleIcon className="w-12 h-12 text-orange-200" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {jobRequests && jobRequests.length > 0 ? (
                            jobRequests.map((request) => (
                                <div key={request.id} className="bg-white rounded-lg shadow-sm p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                                {request.title}
                                            </h3>
                                            <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm text-gray-600">
                                                <span className="flex items-center">
                                                    <UserGroupIcon className="w-4 h-4 ml-1" />
                                                    {request.number_of_positions} وظيفة متاحة
                                                </span>
                                                <span>•</span>
                                                <span>{request.specialization}</span>
                                                <span>•</span>
                                                <span>{request.experience_years} سنوات خبرة</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                                                {getStatusText(request.status)}
                                            </span>
                                            {request.status === 'open' && (
                                                <select
                                                    value={request.status}
                                                    onChange={(e) => handleStatusChange(request.id, e.target.value)}
                                                    className="text-sm border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value="open">مفتوح</option>
                                                    <option value="closed">مغلق</option>
                                                    <option value="filled">تم التعيين</option>
                                                </select>
                                            )}
                                        </div>
                                    </div>

                                    <p className="text-gray-700 mb-4">{request.description}</p>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div className="bg-gray-50 rounded-lg p-3">
                                            <p className="text-xs text-gray-600 mb-1">نوع التوظيف</p>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {request.employment_type === 'full_time' ? 'دوام كامل' :
                                                    request.employment_type === 'part_time' ? 'دوام جزئي' : 'عمل حر'}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-3">
                                            <p className="text-xs text-gray-600 mb-1">نطاق الراتب</p>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {request.salary_range_min} - {request.salary_range_max}دج
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-3">
                                            <p className="text-xs text-gray-600 mb-1">الموعد النهائي</p>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {new Date(request.deadline).toLocaleDateString('ar')}
                                            </p>
                                        </div>
                                    </div>

                                    {request.requirements && (
                                        <div className="bg-blue-50 rounded-lg p-4">
                                            <h4 className="text-sm font-semibold text-blue-900 mb-2">المتطلبات:</h4>
                                            <p className="text-sm text-blue-800 whitespace-pre-wrap">{request.requirements}</p>
                                        </div>
                                    )}

                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm text-gray-600">
                                            <span>
                                                التطبيقات: {request.applications_count || 0}
                                            </span>
                                            <span>•</span>
                                            <span>
                                                تاريخ النشر: {new Date(request.created_at).toLocaleDateString('ar')}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => router.visit(route('job-requests.applications', request.id))}
                                            className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            عرض التطبيقات
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                                <UserGroupIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    لا توجد طلبات توظيف
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    ابدأ بنشر طلب توظيف جديد للعثور على معلمين مميزين
                                </p>
                                <PrimaryButton onClick={() => setShowModal(true)}>
                                    نشر طلب توظيف جديد
                                </PrimaryButton>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Modal show={showModal} onClose={() => setShowModal(false)} maxWidth="2xl">
                <form onSubmit={handleSubmit} className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">نشر طلب توظيف جديد</h2>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="title" value="عنوان الوظيفة" />
                            <TextInput
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="mt-1 block w-full"
                                placeholder="مثال: معلم رياضيات"
                                required
                            />
                            <InputError message={errors.title} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="description" value="وصف الوظيفة" />
                            <TextArea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="mt-1 block w-full"
                                rows={4}
                                required
                            />
                            <InputError message={errors.description} className="mt-2" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="specialization" value="التخصص" />
                                <TextInput
                                    id="specialization"
                                    name="specialization"
                                    value={formData.specialization}
                                    onChange={handleChange}
                                    className="mt-1 block w-full"
                                    required
                                />
                                <InputError message={errors.specialization} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="experience_years" value="سنوات الخبرة المطلوبة" />
                                <TextInput
                                    id="experience_years"
                                    name="experience_years"
                                    type="number"
                                    value={formData.experience_years}
                                    onChange={handleChange}
                                    className="mt-1 block w-full"
                                    required
                                />
                                <InputError message={errors.experience_years} className="mt-2" />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="requirements" value="المتطلبات والمؤهلات" />
                            <TextArea
                                id="requirements"
                                name="requirements"
                                value={formData.requirements}
                                onChange={handleChange}
                                className="mt-1 block w-full"
                                rows={3}
                            />
                            <InputError message={errors.requirements} className="mt-2" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="employment_type" value="نوع التوظيف" />
                                <select
                                    id="employment_type"
                                    name="employment_type"
                                    value={formData.employment_type}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="full_time">دوام كامل</option>
                                    <option value="part_time">دوام جزئي</option>
                                    <option value="freelance">عمل حر</option>
                                </select>
                                <InputError message={errors.employment_type} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="number_of_positions" value="عدد الوظائف المتاحة" />
                                <TextInput
                                    id="number_of_positions"
                                    name="number_of_positions"
                                    type="number"
                                    min="1"
                                    value={formData.number_of_positions}
                                    onChange={handleChange}
                                    className="mt-1 block w-full"
                                    required
                                />
                                <InputError message={errors.number_of_positions} className="mt-2" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="salary_range_min" value="الحد الأدنى للراتب (دج)" />
                                <TextInput
                                    id="salary_range_min"
                                    name="salary_range_min"
                                    type="number"
                                    step="0.01"
                                    value={formData.salary_range_min}
                                    onChange={handleChange}
                                    className="mt-1 block w-full"
                                />
                                <InputError message={errors.salary_range_min} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="salary_range_max" value="الحد الأقصى للراتب (دج)" />
                                <TextInput
                                    id="salary_range_max"
                                    name="salary_range_max"
                                    type="number"
                                    step="0.01"
                                    value={formData.salary_range_max}
                                    onChange={handleChange}
                                    className="mt-1 block w-full"
                                />
                                <InputError message={errors.salary_range_max} className="mt-2" />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="deadline" value="الموعد النهائي للتقديم" />
                            <TextInput
                                id="deadline"
                                name="deadline"
                                type="date"
                                value={formData.deadline}
                                onChange={handleChange}
                                className="mt-1 block w-full"
                                required
                            />
                            <InputError message={errors.deadline} className="mt-2" />
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end space-x-4 rtl:space-x-reverse">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                        >
                            إلغاء
                        </button>
                        <PrimaryButton type="submit">
                            نشر الطلب
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
