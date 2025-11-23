import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    BookOpenIcon,
    CalendarIcon,
} from '@heroicons/react/24/outline';

const StatusBadge = ({ status }) => {
    const statusConfig = {
        pending: {
            bg: 'bg-yellow-100',
            text: 'text-yellow-800',
            icon: ClockIcon,
            label: 'قيد الانتظار',
        },
        approved: {
            bg: 'bg-green-100',
            text: 'text-green-800',
            icon: CheckCircleIcon,
            label: 'مقبول',
        },
        rejected: {
            bg: 'bg-red-100',
            text: 'text-red-800',
            icon: XCircleIcon,
            label: 'مرفوض',
        },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center space-x-1 rtl:space-x-reverse px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
            <Icon className="w-4 h-4" />
            <span>{config.label}</span>
        </span>
    );
};

const RequestCard = ({ request }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
        >
            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {request.course?.title || 'كورس'}
                        </h3>
                        <p className="text-sm text-gray-600">
                            المعلم: {request.course?.teacher?.user?.name || 'غير محدد'}
                        </p>
                    </div>
                    <StatusBadge status={request.status} />
                </div>

                {request.message && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                            <span className="font-medium">رسالتك:</span> {request.message}
                        </p>
                    </div>
                )}

                <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                        <CalendarIcon className="w-4 h-4 ml-1" />
                        <span>تاريخ الطلب: {new Date(request.created_at).toLocaleDateString('ar-EG')}</span>
                    </div>
                </div>

                {request.status === 'approved' && request.reviewed_at && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-800">
                            <CheckCircleIcon className="w-4 h-4 inline ml-1" />
                            تم القبول في {new Date(request.reviewed_at).toLocaleDateString('ar-EG')}
                        </p>
                    </div>
                )}

                {request.status === 'rejected' && (
                    <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-sm text-red-800 font-medium mb-1">
                            <XCircleIcon className="w-4 h-4 inline ml-1" />
                            تم الرفض
                        </p>
                        {request.rejection_reason && (
                            <p className="text-sm text-red-700">
                                السبب: {request.rejection_reason}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default function EnrollmentRequests({ auth, requests = [] }) {
    const pendingRequests = requests.filter(r => r.status === 'pending');
    const approvedRequests = requests.filter(r => r.status === 'approved');
    const rejectedRequests = requests.filter(r => r.status === 'rejected');

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800">طلبات التسجيل في الكورسات</h2>}
        >
            <Head title="طلبات التسجيل" />

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl p-6 text-white"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-yellow-100">قيد الانتظار</p>
                                <p className="text-3xl font-bold">{pendingRequests.length}</p>
                            </div>
                            <ClockIcon className="w-12 h-12 text-yellow-200" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100">مقبول</p>
                                <p className="text-3xl font-bold">{approvedRequests.length}</p>
                            </div>
                            <CheckCircleIcon className="w-12 h-12 text-green-200" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-r from-red-500 to-rose-600 rounded-xl p-6 text-white"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-red-100">مرفوض</p>
                                <p className="text-3xl font-bold">{rejectedRequests.length}</p>
                            </div>
                            <XCircleIcon className="w-12 h-12 text-red-200" />
                        </div>
                    </motion.div>
                </div>

                {requests.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-xl shadow-lg p-12 text-center"
                    >
                        <BookOpenIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            لا توجد طلبات تسجيل
                        </h3>
                        <p className="text-gray-500">
                            لم تقم بإرسال أي طلبات تسجيل في الكورسات حتى الآن
                        </p>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        {requests.map((request) => (
                            <RequestCard key={request.id} request={request} />
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
