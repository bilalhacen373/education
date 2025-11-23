import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import { toast } from 'react-hot-toast';
import { CalendarIcon, ClockIcon, XCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function TeacherAttendance({ auth, attendances, teachers, penalties, school }) {
    const [showModal, setShowModal] = useState(false);
    const [showPenaltyModal, setShowPenaltyModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceData, setAttendanceData] = useState({});
    const [penaltyData, setPenaltyData] = useState({
        teacher_id: '',
        absence_date: '',
        penalty_amount: '',
        penalty_type: 'deduction',
        reason: '',
    });

    const handleMarkAttendance = (teacherId, status) => {
        setAttendanceData(prev => ({
            ...prev,
            [teacherId]: status
        }));
    };

    const submitAttendance = () => {
        const data = {
            date: selectedDate,
            attendances: Object.entries(attendanceData).map(([teacher_id, status]) => ({
                teacher_id: parseInt(teacher_id),
                status,
                check_in_time: status === 'present' ? '08:00' : null,
                check_out_time: status === 'present' ? '14:00' : null,
            }))
        };

        router.post(route('school-admin.teacher-attendance.store'), data, {
            onSuccess: () => {
                toast.success('تم تسجيل الحضور بنجاح');
                setShowModal(false);
                setAttendanceData({});
            },
            onError: () => {
                toast.error('حدث خطأ أثناء تسجيل الحضور');
            },
        });
    };

    const submitPenalty = (e) => {
        e.preventDefault();

        router.post(route('school-admin.penalties.store'), penaltyData, {
            onSuccess: () => {
                toast.success('تم تطبيق الجزاء بنجاح');
                setShowPenaltyModal(false);
                setPenaltyData({
                    teacher_id: '',
                    absence_date: '',
                    penalty_amount: '',
                    penalty_type: 'deduction',
                    reason: '',
                });
            },
            onError: () => {
                toast.error('حدث خطأ أثناء تطبيق الجزاء');
            },
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'present': return 'bg-green-100 text-green-800';
            case 'absent': return 'bg-red-100 text-red-800';
            case 'late': return 'bg-yellow-100 text-yellow-800';
            case 'excused': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'present': return 'حاضر';
            case 'absent': return 'غائب';
            case 'late': return 'متأخر';
            case 'excused': return 'إجازة';
            default: return status;
        }
    };

    const totalPenalties = penalties?.reduce((sum, p) => sum + parseFloat(p.penalty_amount || 0), 0) || 0;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="حضور المعلمين والجزاءات" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">حضور المعلمين والجزاءات</h1>
                            <p className="mt-2 text-sm text-gray-600">
                                إدارة حضور المعلمين ونظام الجزاءات
                            </p>
                        </div>
                        <div className="flex space-x-3 rtl:space-x-reverse">
                            <button
                                onClick={() => setShowPenaltyModal(true)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
                            >
                                تطبيق جزاء
                            </button>
                            <PrimaryButton onClick={() => setShowModal(true)}>
                                <ClockIcon className="w-5 h-5 ml-2" />
                                تسجيل الحضور
                            </PrimaryButton>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm">الحضور اليوم</p>
                                    <p className="text-3xl font-bold mt-2">
                                        {attendances?.filter(a => a.status === 'present' &&
                                            new Date(a.date).toDateString() === new Date().toDateString()).length || 0}
                                    </p>
                                </div>
                                <CheckCircleIcon className="w-12 h-12 text-green-200" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-red-100 text-sm">الغياب اليوم</p>
                                    <p className="text-3xl font-bold mt-2">
                                        {attendances?.filter(a => a.status === 'absent' &&
                                            new Date(a.date).toDateString() === new Date().toDateString()).length || 0}
                                    </p>
                                </div>
                                <XCircleIcon className="w-12 h-12 text-red-200" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-yellow-100 text-sm">التأخير اليوم</p>
                                    <p className="text-3xl font-bold mt-2">
                                        {attendances?.filter(a => a.status === 'late' &&
                                            new Date(a.date).toDateString() === new Date().toDateString()).length || 0}
                                    </p>
                                </div>
                                <ClockIcon className="w-12 h-12 text-yellow-200" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-orange-100 text-sm">إجمالي الجزاءات</p>
                                    <p className="text-3xl font-bold mt-2">{totalPenalties.toFixed(2)}دج</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">سجل الحضور الأخير</h2>
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {attendances && attendances.length > 0 ? (
                                    attendances.slice(0, 10).map((attendance) => (
                                        <div key={attendance.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                                                    {attendance.teacher?.user?.name?.charAt(0)}
                                                </div>
                                                <div className="mr-3">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {attendance.teacher?.user?.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(attendance.date).toLocaleDateString('ar')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(attendance.status)}`}>
                                                    {getStatusText(attendance.status)}
                                                </span>
                                                {attendance.check_in_time && (
                                                    <span className="text-xs text-gray-500">
                                                        {attendance.check_in_time}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-gray-500 py-8">لا يوجد سجل حضور</p>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">الجزاءات الأخيرة</h2>
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {penalties && penalties.length > 0 ? (
                                    penalties.slice(0, 10).map((penalty) => (
                                        <div key={penalty.id} className="p-4 bg-red-50 border-r-4 border-red-500 rounded-lg">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {penalty.teacher?.user?.name}
                                                    </p>
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        {penalty.reason}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        التاريخ: {new Date(penalty.absence_date).toLocaleDateString('ar')}
                                                    </p>
                                                </div>
                                                <div className="text-left mr-4">
                                                    <p className="text-lg font-bold text-red-600">
                                                        {penalty.penalty_amount}دج
                                                    </p>
                                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                                        penalty.penalty_type === 'deduction'
                                                            ? 'bg-red-100 text-red-700'
                                                            : 'bg-orange-100 text-orange-700'
                                                    }`}>
                                                        {penalty.penalty_type === 'deduction' ? 'خصم' : 'تحذير'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-gray-500 py-8">لا توجد جزاءات</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={showModal} onClose={() => setShowModal(false)} maxWidth="3xl">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">تسجيل حضور المعلمين</h2>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            التاريخ
                        </label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="space-y-3 max-h-96 overflow-y-auto mb-6">
                        {teachers && teachers.map((teacher) => (
                            <div key={teacher.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                                        {teacher.user?.name?.charAt(0)}
                                    </div>
                                    <div className="mr-3">
                                        <p className="text-sm font-medium text-gray-900">
                                            {teacher.user?.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {teacher.specialization}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex space-x-2 rtl:space-x-reverse">
                                    <button
                                        onClick={() => handleMarkAttendance(teacher.id, 'present')}
                                        className={`px-3 py-1 text-xs font-semibold rounded-lg ${
                                            attendanceData[teacher.id] === 'present'
                                                ? 'bg-green-600 text-white'
                                                : 'bg-gray-200 text-gray-700 hover:bg-green-100'
                                        }`}
                                    >
                                        حاضر
                                    </button>
                                    <button
                                        onClick={() => handleMarkAttendance(teacher.id, 'absent')}
                                        className={`px-3 py-1 text-xs font-semibold rounded-lg ${
                                            attendanceData[teacher.id] === 'absent'
                                                ? 'bg-red-600 text-white'
                                                : 'bg-gray-200 text-gray-700 hover:bg-red-100'
                                        }`}
                                    >
                                        غائب
                                    </button>
                                    <button
                                        onClick={() => handleMarkAttendance(teacher.id, 'late')}
                                        className={`px-3 py-1 text-xs font-semibold rounded-lg ${
                                            attendanceData[teacher.id] === 'late'
                                                ? 'bg-yellow-600 text-white'
                                                : 'bg-gray-200 text-gray-700 hover:bg-yellow-100'
                                        }`}
                                    >
                                        متأخر
                                    </button>
                                    <button
                                        onClick={() => handleMarkAttendance(teacher.id, 'excused')}
                                        className={`px-3 py-1 text-xs font-semibold rounded-lg ${
                                            attendanceData[teacher.id] === 'excused'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 text-gray-700 hover:bg-blue-100'
                                        }`}
                                    >
                                        إجازة
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-end space-x-4 rtl:space-x-reverse">
                        <button
                            onClick={() => setShowModal(false)}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                        >
                            إلغاء
                        </button>
                        <PrimaryButton onClick={submitAttendance}>
                            حفظ الحضور
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>

            <Modal show={showPenaltyModal} onClose={() => setShowPenaltyModal(false)} maxWidth="lg">
                <form onSubmit={submitPenalty} className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">تطبيق جزاء على معلم</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                اختر المعلم
                            </label>
                            <select
                                value={penaltyData.teacher_id}
                                onChange={(e) => setPenaltyData(prev => ({ ...prev, teacher_id: e.target.value }))}
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                required
                            >
                                <option value="">اختر معلم</option>
                                {teachers && teachers.map((teacher) => (
                                    <option key={teacher.id} value={teacher.id}>
                                        {teacher.user?.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                تاريخ الغياب
                            </label>
                            <input
                                type="date"
                                value={penaltyData.absence_date}
                                onChange={(e) => setPenaltyData(prev => ({ ...prev, absence_date: e.target.value }))}
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                نوع الجزاء
                            </label>
                            <select
                                value={penaltyData.penalty_type}
                                onChange={(e) => setPenaltyData(prev => ({ ...prev, penalty_type: e.target.value }))}
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="deduction">خصم من الراتب</option>
                                <option value="warning">تحذير</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                قيمة الخصم (دج)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={penaltyData.penalty_amount}
                                onChange={(e) => setPenaltyData(prev => ({ ...prev, penalty_amount: e.target.value }))}
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                السبب
                            </label>
                            <textarea
                                value={penaltyData.reason}
                                onChange={(e) => setPenaltyData(prev => ({ ...prev, reason: e.target.value }))}
                                rows={3}
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder="اكتب سبب الجزاء..."
                                required
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end space-x-4 rtl:space-x-reverse">
                        <button
                            type="button"
                            onClick={() => setShowPenaltyModal(false)}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                        >
                            تطبيق الجزاء
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
