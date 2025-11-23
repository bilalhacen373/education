import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import {
    PlusIcon,
    BriefcaseIcon,
    MapPinIcon,
    CurrencyDollarIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Modal from '@/Components/Modal';

const employmentTypes = {
    full_time: 'دوام كامل',
    part_time: 'دوام جزئي',
    contract: 'عقد',
};

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
};

const JobCard = ({ job, onApply, isMyJob = false }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
    >
        <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
                {job.school && (
                    <p className="text-gray-600 mb-2">{job.school.name_ar || job.school.name}</p>
                )}
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {employmentTypes[job.employment_type]}
            </span>
        </div>

        <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>

        <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-600">
                <MapPinIcon className="w-4 h-4 ml-2" />
                <span>{job.location}</span>
            </div>
            {(job.salary_range_min || job.expected_salary_min) && (
                <div className="flex items-center text-sm text-gray-600">
                    <CurrencyDollarIcon className="w-4 h-4 ml-2" />
                    <span>
                        {job.salary_range_min || job.expected_salary_min} - {job.salary_range_max || job.expected_salary_max}دج
                    </span>
                </div>
            )}
        </div>

        {!isMyJob && (
            <button
                onClick={() => onApply(job)}
                className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all"
            >
                تقديم طلب
            </button>
        )}

        {isMyJob && job.applications && (
            <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600">
                    عدد المتقدمين: <span className="font-medium">{job.applications.length}</span>
                </p>
            </div>
        )}
    </motion.div>
);

const ApplicationCard = ({ application }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6"
    >
        <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {application.job_request.title}
                </h3>
                {application.job_request.school && (
                    <p className="text-gray-600">{application.job_request.school.name_ar || application.job_request.school.name}</p>
                )}
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColors[application.status]}`}>
                {application.status === 'pending' && 'قيد المراجعة'}
                {application.status === 'accepted' && 'مقبول'}
                {application.status === 'rejected' && 'مرفوض'}
            </span>
        </div>

        <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
                <MapPinIcon className="w-4 h-4 ml-2" />
                <span>{application.job_request.location}</span>
            </div>
            {application.expected_salary && (
                <div className="flex items-center text-sm text-gray-600">
                    <CurrencyDollarIcon className="w-4 h-4 ml-2" />
                    <span>الراتب المتوقع: {application.expected_salary}دج</span>
                </div>
            )}
        </div>
    </motion.div>
);

export default function JobRequests({ auth, jobRequests = [], myApplications = [], myJobRequests = [] }) {
    const [showJobModal, setShowJobModal] = useState(false);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [activeTab, setActiveTab] = useState('available');

    const [jobFormData, setJobFormData] = useState({
        title: '',
        description: '',
        requirements: '',
        expected_salary_min: '',
        expected_salary_max: '',
        location: '',
        employment_type: 'full_time',
        availability: '',
    });

    const [applyFormData, setApplyFormData] = useState({
        cover_letter: '',
        expected_salary: '',
    });

    const handleJobSubmit = (e) => {
        e.preventDefault();

        router.post(route('teacher.job-requests.store'), jobFormData, {
            onSuccess: () => {
                toast.success('تم نشر طلب التوظيف');
                setShowJobModal(false);
                setJobFormData({
                    title: '',
                    description: '',
                    requirements: '',
                    expected_salary_min: '',
                    expected_salary_max: '',
                    location: '',
                    employment_type: 'full_time',
                    availability: '',
                });
            },
            onError: () => {
                toast.error('حدث خطأ أثناء حفظ البيانات');
            },
        });
    };

    const handleApply = (job) => {
        setSelectedJob(job);
        setShowApplyModal(true);
    };

    const handleApplySubmit = (e) => {
        e.preventDefault();

        router.post(route('job-requests.apply', selectedJob.id), applyFormData, {
            onSuccess: () => {
                toast.success('تم إرسال طلبك بنجاح');
                setShowApplyModal(false);
                setApplyFormData({
                    cover_letter: '',
                    expected_salary: '',
                });
            },
            onError: () => {
                toast.error('حدث خطأ أثناء إرسال الطلب');
            },
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800">فرص العمل</h2>}
        >
            <Head title="فرص العمل" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">البحث عن وظائف</h3>
                        <p className="text-sm text-gray-600">تصفح فرص العمل المتاحة أو أنشئ طلب توظيف</p>
                    </div>
                    <button
                        onClick={() => setShowJobModal(true)}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all"
                    >
                        <PlusIcon className="w-5 h-5 ml-2" />
                        إنشاء طلب توظيف
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow">
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px">
                            <button
                                onClick={() => setActiveTab('available')}
                                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === 'available'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                الوظائف المتاحة ({jobRequests.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('applications')}
                                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === 'applications'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                طلباتي ({myApplications.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('my-jobs')}
                                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === 'my-jobs'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                طلباتي المنشورة ({myJobRequests.length})
                            </button>
                        </nav>
                    </div>

                    <div className="p-6">
                        {activeTab === 'available' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {jobRequests.length === 0 ? (
                                    <div className="col-span-full text-center py-12">
                                        <BriefcaseIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد وظائف متاحة</h3>
                                        <p className="text-gray-500">سيتم عرض الوظائف الجديدة هنا</p>
                                    </div>
                                ) : (
                                    jobRequests.map((job) => (
                                        <JobCard key={job.id} job={job} onApply={handleApply} />
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'applications' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {myApplications.length === 0 ? (
                                    <div className="col-span-full text-center py-12">
                                        <BriefcaseIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد طلبات</h3>
                                        <p className="text-gray-500">لم تتقدم لأي وظيفة بعد</p>
                                    </div>
                                ) : (
                                    myApplications.map((application) => (
                                        <ApplicationCard key={application.id} application={application} />
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'my-jobs' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {myJobRequests.length === 0 ? (
                                    <div className="col-span-full text-center py-12">
                                        <BriefcaseIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد طلبات منشورة</h3>
                                        <p className="text-gray-500">أنشئ طلب توظيف للبحث عن مدارس</p>
                                    </div>
                                ) : (
                                    myJobRequests.map((job) => (
                                        <JobCard key={job.id} job={job} isMyJob={true} />
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Modal show={showJobModal} onClose={() => setShowJobModal(false)} maxWidth="2xl">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">إنشاء طلب توظيف جديد</h3>
                    </div>

                    <form onSubmit={handleJobSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                العنوان
                            </label>
                            <input
                                type="text"
                                value={jobFormData.title}
                                onChange={(e) => setJobFormData({ ...jobFormData, title: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                الوصف
                            </label>
                            <textarea
                                value={jobFormData.description}
                                onChange={(e) => setJobFormData({ ...jobFormData, description: e.target.value })}
                                rows="4"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الموقع
                                </label>
                                <input
                                    type="text"
                                    value={jobFormData.location}
                                    onChange={(e) => setJobFormData({ ...jobFormData, location: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    نوع التوظيف
                                </label>
                                <select
                                    value={jobFormData.employment_type}
                                    onChange={(e) => setJobFormData({ ...jobFormData, employment_type: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    {Object.entries(employmentTypes).map(([key, name]) => (
                                        <option key={key} value={key}>{name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الراتب المتوقع (من)
                                </label>
                                <input
                                    type="number"
                                    value={jobFormData.expected_salary_min}
                                    onChange={(e) => setJobFormData({ ...jobFormData, expected_salary_min: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الراتب المتوقع (إلى)
                                </label>
                                <input
                                    type="number"
                                    value={jobFormData.expected_salary_max}
                                    onChange={(e) => setJobFormData({ ...jobFormData, expected_salary_max: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end space-x-4 rtl:space-x-reverse pt-4">
                            <button
                                type="button"
                                onClick={() => setShowJobModal(false)}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all"
                            >
                                نشر الطلب
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            <Modal show={showApplyModal} onClose={() => setShowApplyModal(false)} maxWidth="2xl">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">التقديم على الوظيفة</h3>
                    </div>

                    <form onSubmit={handleApplySubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                رسالة التغطية
                            </label>
                            <textarea
                                value={applyFormData.cover_letter}
                                onChange={(e) => setApplyFormData({ ...applyFormData, cover_letter: e.target.value })}
                                rows="6"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="اكتب رسالة تعريفية تشرح فيها مهاراتك وخبراتك..."
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                الراتب المتوقع (دج)
                            </label>
                            <input
                                type="number"
                                value={applyFormData.expected_salary}
                                onChange={(e) => setApplyFormData({ ...applyFormData, expected_salary: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div className="flex items-center justify-end space-x-4 rtl:space-x-reverse pt-4">
                            <button
                                type="button"
                                onClick={() => setShowApplyModal(false)}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all"
                            >
                                إرسال الطلب
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
