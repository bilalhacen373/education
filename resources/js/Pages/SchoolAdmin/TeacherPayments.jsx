import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import { toast } from 'react-hot-toast';
import { BanknotesIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function TeacherPayments({ auth, payments, teachers, school }) {
    const [showModal, setShowModal] = useState(false);
    const [paymentData, setPaymentData] = useState({
        teacher_id: '',
        amount: '',
        payment_type: 'salary',
        payment_method: 'bank_transfer',
        payment_date: new Date().toISOString().split('T')[0],
        month: new Date().toISOString().slice(0, 7),
        notes: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        router.post(route('school-admin.teacher-payments.store'), paymentData, {
            onSuccess: () => {
                toast.success('تم تسجيل الدفعة بنجاح');
                setShowModal(false);
                setPaymentData({
                    teacher_id: '',
                    amount: '',
                    payment_type: 'salary',
                    payment_method: 'bank_transfer',
                    payment_date: new Date().toISOString().split('T')[0],
                    month: new Date().toISOString().slice(0, 7),
                    notes: '',
                });
            },
            onError: () => {
                toast.error('حدث خطأ أثناء التسجيل');
            },
        });
    };

    const totalPaid = payments?.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0) || 0;
    const pendingPayments = payments?.filter(p => p.status === 'pending').length || 0;
    const completedPayments = payments?.filter(p => p.status === 'completed').length || 0;

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'failed': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'completed': return 'مكتمل';
            case 'pending': return 'قيد الانتظار';
            case 'failed': return 'فشل';
            default: return status;
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="إدارة رواتب المعلمين" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">إدارة رواتب المعلمين</h1>
                            <p className="mt-2 text-sm text-gray-600">
                                متابعة وإدارة رواتب ودفعات المعلمين
                            </p>
                        </div>
                        <PrimaryButton onClick={() => setShowModal(true)}>
                            <BanknotesIcon className="w-5 h-5 ml-2" />
                            تسجيل دفعة جديدة
                        </PrimaryButton>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm">إجمالي المدفوعات</p>
                                    <p className="text-3xl font-bold mt-2">{totalPaid.toFixed(2)}دج</p>
                                </div>
                                <BanknotesIcon className="w-12 h-12 text-blue-200" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-yellow-100 text-sm">دفعات قيد الانتظار</p>
                                    <p className="text-3xl font-bold mt-2">{pendingPayments}</p>
                                </div>
                                <ClockIcon className="w-12 h-12 text-yellow-200" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm">دفعات مكتملة</p>
                                    <p className="text-3xl font-bold mt-2">{completedPayments}</p>
                                </div>
                                <CheckCircleIcon className="w-12 h-12 text-green-200" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        المعلم
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        المبلغ
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        نوع الدفعة
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        طريقة الدفع
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        الشهر
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        تاريخ الدفع
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        الحالة
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {payments && payments.length > 0 ? (
                                    payments.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                                                        {payment.teacher?.user?.name?.charAt(0)}
                                                    </div>
                                                    <div className="mr-3">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {payment.teacher?.user?.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {payment.teacher?.specialization}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-gray-900">
                                                    {parseFloat(payment.amount).toFixed(2)}دج
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {payment.payment_type === 'salary' ? 'راتب' :
                                                    payment.payment_type === 'bonus' ? 'مكافأة' : 'أخرى'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {payment.payment_method === 'bank_transfer' ? 'تحويل بنكي' :
                                                    payment.payment_method === 'cash' ? 'نقداً' : 'أخرى'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {payment.month ? new Date(payment.month).toLocaleDateString('ar', { month: 'long', year: 'numeric' }) : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {new Date(payment.payment_date).toLocaleDateString('ar')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                                                        {getStatusText(payment.status)}
                                                    </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                            لا توجد دفعات مسجلة
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={showModal} onClose={() => setShowModal(false)} maxWidth="lg">
                <form onSubmit={handleSubmit} className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">تسجيل دفعة جديدة</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                اختر المعلم
                            </label>
                            <select
                                value={paymentData.teacher_id}
                                onChange={(e) => {
                                    const teacher = teachers.find(t => t.id === parseInt(e.target.value));
                                    setPaymentData(prev => ({
                                        ...prev,
                                        teacher_id: e.target.value,
                                        amount: teacher?.monthly_salary || ''
                                    }));
                                }}
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                required
                            >
                                <option value="">اختر معلم</option>
                                {teachers && teachers.map((teacher) => (
                                    <option key={teacher.id} value={teacher.id}>
                                        {teacher.user?.name} - {teacher.monthly_salary ? `${teacher.monthly_salary}دج` : 'لم يحدد الراتب'}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                المبلغ (دج)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={paymentData.amount}
                                onChange={(e) => setPaymentData(prev => ({ ...prev, amount: e.target.value }))}
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    نوع الدفعة
                                </label>
                                <select
                                    value={paymentData.payment_type}
                                    onChange={(e) => setPaymentData(prev => ({ ...prev, payment_type: e.target.value }))}
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="salary">راتب شهري</option>
                                    <option value="bonus">مكافأة</option>
                                    <option value="overtime">ساعات إضافية</option>
                                    <option value="deduction">خصم</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    طريقة الدفع
                                </label>
                                <select
                                    value={paymentData.payment_method}
                                    onChange={(e) => setPaymentData(prev => ({ ...prev, payment_method: e.target.value }))}
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="bank_transfer">تحويل بنكي</option>
                                    <option value="cash">نقداً</option>
                                    <option value="check">شيك</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الشهر
                                </label>
                                <input
                                    type="month"
                                    value={paymentData.month}
                                    onChange={(e) => setPaymentData(prev => ({ ...prev, month: e.target.value }))}
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    تاريخ الدفع
                                </label>
                                <input
                                    type="date"
                                    value={paymentData.payment_date}
                                    onChange={(e) => setPaymentData(prev => ({ ...prev, payment_date: e.target.value }))}
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                ملاحظات
                            </label>
                            <textarea
                                value={paymentData.notes}
                                onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                                rows={3}
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder="أضف أي ملاحظات..."
                            />
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
                            تسجيل الدفعة
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
