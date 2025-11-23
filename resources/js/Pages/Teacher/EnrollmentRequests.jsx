import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextArea from '@/Components/TextArea';
import {
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    UserIcon,
    BookOpenIcon,
} from '@heroicons/react/24/outline';

const RequestCard = ({ request, onApprove, onReject }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                        <UserIcon className="w-5 h-5 text-gray-400" />
                        <h3 className="text-lg font-bold text-gray-900">
                            {request.student?.user?.name}
                        </h3>
                    </div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-600">
                        <BookOpenIcon className="w-4 h-4" />
                        <span>{request.course?.title_ar}</span>
                    </div>
                </div>
            </div>

            {request.message && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                        <span className="font-medium">رسالة الطالب:</span> {request.message}
                    </p>
                </div>
            )}

            <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs text-gray-500 mb-4">
                <ClockIcon className="w-4 h-4" />
                <span>{new Date(request.created_at).toLocaleDateString('ar-EG')}</span>
            </div>

            <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <button
                    onClick={() => onApprove(request)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 rtl:space-x-reverse"
                >
                    <CheckCircleIcon className="w-5 h-5" />
                    <span>قبول</span>
                </button>
                <button
                    onClick={() => onReject(request)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 rtl:space-x-reverse"
                >
                    <XCircleIcon className="w-5 h-5" />
                    <span>رفض</span>
                </button>
            </div>
        </motion.div>
    );
};

export default function EnrollmentRequests({ auth, requests = [] }) {
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    const pendingRequests = requests.filter(r => r.status === 'pending');

    const handleApprove = (request) => {
        if (confirm('هل أنت متأكد من قبول هذا الطالب؟')) {
            router.post(`/teacher/enrollment-requests/${request.id}/approve`, {}, {
                onSuccess: () => toast.success('تم قبول الطالب بنجاح'),
                onError: () => toast.error('حدث خطأ'),
            });
        }
    };

    const handleReject = (request) => {
        setSelectedRequest(request);
        setShowRejectModal(true);
    };

    const submitRejection = () => {
        router.post(`/teacher/enrollment-requests/${selectedRequest.id}/reject`, {
            rejection_reason: rejectionReason,
        }, {
            onSuccess: () => {
                toast.success('تم رفض الطلب');
                setShowRejectModal(false);
                setRejectionReason('');
            },
            onError: () => toast.error('حدث خطأ'),
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800">طلبات التسجيل</h2>}
        >
            <Head title="طلبات التسجيل" />

            <div className="space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl p-6 text-white"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-yellow-100">طلبات قيد الانتظار</p>
                            <p className="text-3xl font-bold">{pendingRequests.length}</p>
                        </div>
                        <ClockIcon className="w-12 h-12 text-yellow-200" />
                    </div>
                </motion.div>

                {pendingRequests.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-xl shadow-lg p-12 text-center"
                    >
                        <BookOpenIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            لا توجد طلبات قيد الانتظار
                        </h3>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {pendingRequests.map((request) => (
                            <RequestCard
                                key={request.id}
                                request={request}
                                onApprove={handleApprove}
                                onReject={handleReject}
                            />
                        ))}
                    </div>
                )}
            </div>

            <Modal show={showRejectModal} onClose={() => setShowRejectModal(false)}>
                <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                        سبب الرفض
                    </h2>
                    <TextArea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="mt-1 block w-full"
                        rows="4"
                        placeholder="اكتب سبب الرفض (اختياري)..."
                    />
                    <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse mt-6">
                        <SecondaryButton onClick={() => setShowRejectModal(false)}>
                            إلغاء
                        </SecondaryButton>
                        <button
                            onClick={submitRejection}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            تأكيد الرفض
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
