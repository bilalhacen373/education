import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    CurrencyDollarIcon,
    BanknotesIcon,
    CalendarIcon,
    CheckCircleIcon,
    ClockIcon,
    XCircleIcon,
    EyeIcon,
    ArrowDownTrayIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import SecondaryButton from '@/Components/SecondaryButton';
import Modal from '@/Components/Modal';

const PaymentCard = ({ payment, onView }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'failed': return 'bg-red-100 text-red-800 border-red-200';
            case 'refunded': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
            case 'pending': return <ClockIcon className="w-5 h-5 text-yellow-600" />;
            case 'failed': return <XCircleIcon className="w-5 h-5 text-red-600" />;
            case 'refunded': return <ArrowDownTrayIcon className="w-5 h-5 text-gray-600" />;
            default: return <ClockIcon className="w-5 h-5 text-gray-600" />;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'completed': return 'مكتملة';
            case 'pending': return 'قيد الانتظار';
            case 'failed': return 'فشلت';
            case 'refunded': return 'مسترد';
            default: return status;
        }
    };

    const getTypeText = (type) => {
        switch (type) {
            case 'salary': return 'راتب';
            case 'course': return 'كورس';
            case 'tuition': return 'رسوم دراسية';
            case 'subscription': return 'اشتراك';
            case 'refund': return 'استرداد';
            default: return type;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <CurrencyDollarIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">{payment.description_ar}</h3>
                        <p className="text-sm text-gray-500">
                            {payment.payer_type === 'student' ? 'من طالب' :
                                payment.payer_type === 'school' ? 'من مدرسة' : 'من النظام'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <div className={`flex items-center px-3 py-2 rounded-lg border ${getStatusColor(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        <span className="mr-2 text-sm font-medium">
                            {getStatusText(payment.status)}
                        </span>
                    </div>
                    <button
                        onClick={() => onView(payment)}
                        className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                        <EyeIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
                    <span className="text-sm text-gray-600">المبلغ</span>
                    <span className="text-xl font-bold text-gray-900">
                        {payment.formatted_amount || `${payment.amount} ${payment.currency}`}
                    </span>
                </div>

                <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
                    <span className="text-sm text-gray-600">نوع المعاملة</span>
                    <span className="text-sm font-medium text-gray-900">
                        {getTypeText(payment.type)}
                    </span>
                </div>

                <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
                    <span className="text-sm text-gray-600">طريقة الدفع</span>
                    <span className="text-sm text-gray-900">
                        {payment.payment_method || 'غير محدد'}
                    </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center text-sm text-gray-500">
                        <CalendarIcon className="w-4 h-4 ml-1" />
                        <span>
                            {payment.paid_at
                                ? new Date(payment.paid_at).toLocaleDateString('ar-SA')
                                : new Date(payment.created_at).toLocaleDateString('ar-SA')
                            }
                        </span>
                    </div>
                    {payment.transaction_id && (
                        <span className="text-xs text-gray-400">
                            #{payment.transaction_id.slice(-8)}
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default function Payments({ auth, payments = [] }) {
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');

    const filteredPayments = payments.filter(payment => {
        const matchesSearch = payment.description_ar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !statusFilter || payment.status === statusFilter;
        const matchesType = !typeFilter || payment.type === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    });

    const handleView = (payment) => {
        setSelectedPayment(payment);
        setShowViewModal(true);
    };

    const getPaymentStats = () => {
        const totalPayments = payments.length;
        const completedPayments = payments.filter(p => p.status === 'completed');
        const totalEarnings = completedPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
        const pendingPayments = payments.filter(p => p.status === 'pending').length;
        const thisMonthEarnings = completedPayments
            .filter(p => new Date(p.paid_at || p.created_at).getMonth() === new Date().getMonth())
            .reduce((sum, p) => sum + parseFloat(p.amount), 0);

        return { totalPayments, totalEarnings, pendingPayments, thisMonthEarnings };
    };

    const stats = getPaymentStats();

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">المدفوعات والأرباح</h2>}
        >
            <Head title="المدفوعات والأرباح" />

            <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white"
                    >
                        <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
                            <div>
                                <p className="text-green-100">إجمالي الأرباح</p>
                                <p className="text-3xl font-bold">{stats.totalEarnings.toFixed(2)}دج</p>
                            </div>
                            <BanknotesIcon className="w-12 h-12 text-green-200" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white"
                    >
                        <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
                            <div>
                                <p className="text-blue-100">أرباح هذا الشهر</p>
                                <p className="text-3xl font-bold">{stats.thisMonthEarnings.toFixed(2)}دج</p>
                            </div>
                            <CalendarIcon className="w-12 h-12 text-blue-200" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white"
                    >
                        <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
                            <div>
                                <p className="text-purple-100">إجمالي المعاملات</p>
                                <p className="text-3xl font-bold">{stats.totalPayments}</p>
                            </div>
                            <CurrencyDollarIcon className="w-12 h-12 text-purple-200" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white"
                    >
                        <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
                            <div>
                                <p className="text-yellow-100">قيد الانتظار</p>
                                <p className="text-3xl font-bold">{stats.pendingPayments}</p>
                            </div>
                            <ClockIcon className="w-12 h-12 text-yellow-200" />
                        </div>
                    </motion.div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <InputLabel htmlFor="search" value="البحث" />
                            <div className="relative mt-1">
                                <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <TextInput
                                    id="search"
                                    type="text"
                                    placeholder="البحث في المدفوعات..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pr-10"
                                />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="status_filter" value="الحالة" />
                            <select
                                id="status_filter"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                            >
                                <option value="">جميع الحالات</option>
                                <option value="completed">مكتملة</option>
                                <option value="pending">قيد الانتظار</option>
                                <option value="failed">فشلت</option>
                                <option value="refunded">مسترد</option>
                            </select>
                        </div>

                        <div>
                            <InputLabel htmlFor="type_filter" value="نوع المعاملة" />
                            <select
                                id="type_filter"
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                            >
                                <option value="">جميع الأنواع</option>
                                <option value="salary">راتب</option>
                                <option value="course">كورس</option>
                                <option value="tuition">رسوم دراسية</option>
                                <option value="subscription">اشتراك</option>
                                <option value="refund">استرداد</option>
                            </select>
                        </div>

                        <div className="flex items-end">
                            <SecondaryButton
                                onClick={() => {
                                    setSearchTerm('');
                                    setStatusFilter('');
                                    setTypeFilter('');
                                }}
                                className="w-full"
                            >
                                إعادة تعيين
                            </SecondaryButton>
                        </div>
                    </div>
                </div>

                {/* Payments Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPayments.map((payment, index) => (
                        <PaymentCard
                            key={payment.id}
                            payment={payment}
                            onView={handleView}
                        />
                    ))}
                </div>

                {filteredPayments.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                    >
                        <CurrencyDollarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {searchTerm || statusFilter || typeFilter ? 'لا توجد نتائج' : 'لا توجد مدفوعات'}
                        </h3>
                        <p className="text-gray-500">
                            {searchTerm || statusFilter || typeFilter
                                ? 'جرب تغيير معايير البحث'
                                : 'ستظهر المدفوعات والأرباح هنا'
                            }
                        </p>
                    </motion.div>
                )}
            </div>

            {/* View Modal */}
            <Modal show={showViewModal} onClose={() => setShowViewModal(false)} maxWidth="2xl">
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">تفاصيل المدفوعة</h2>

                    {selectedPayment && (
                        <div className="space-y-6">
                            <div className="flex items-center space-x-4 rtl:space-x-reverse">
                                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                                    <CurrencyDollarIcon className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{selectedPayment.description_ar}</h3>
                                    <p className="text-gray-600">
                                        {selectedPayment.formatted_amount || `${selectedPayment.amount} ${selectedPayment.currency}`}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">الحالة</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {selectedPayment.status === 'completed' ? 'مكتملة' :
                                            selectedPayment.status === 'pending' ? 'قيد الانتظار' :
                                                selectedPayment.status === 'failed' ? 'فشلت' : 'مسترد'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">نوع المعاملة</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {selectedPayment.type === 'salary' ? 'راتب' :
                                            selectedPayment.type === 'course' ? 'كورس' :
                                                selectedPayment.type === 'tuition' ? 'رسوم دراسية' :
                                                    selectedPayment.type === 'subscription' ? 'اشتراك' : 'استرداد'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">طريقة الدفع</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedPayment.payment_method || 'غير محدد'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">تاريخ المعاملة</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {selectedPayment.paid_at
                                            ? new Date(selectedPayment.paid_at).toLocaleDateString('ar-SA')
                                            : new Date(selectedPayment.created_at).toLocaleDateString('ar-SA')
                                        }
                                    </p>
                                </div>
                            </div>

                            {selectedPayment.transaction_id && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">رقم المعاملة</label>
                                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                        <TextInput
                                            value={selectedPayment.transaction_id}
                                            className="flex-1"
                                            readOnly
                                        />
                                        <SecondaryButton
                                            onClick={() => navigator.clipboard.writeText(selectedPayment.transaction_id)}
                                        >
                                            نسخ
                                        </SecondaryButton>
                                    </div>
                                </div>
                            )}

                            {selectedPayment.metadata && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">معلومات إضافية</label>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <pre className="text-sm text-gray-900 whitespace-pre-wrap">
                                            {JSON.stringify(selectedPayment.metadata, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end">
                                <SecondaryButton onClick={() => setShowViewModal(false)}>
                                    إغلاق
                                </SecondaryButton>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
