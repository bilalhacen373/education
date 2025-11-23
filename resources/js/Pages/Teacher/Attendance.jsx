import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    CalendarIcon,
    UserGroupIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';

const AttendanceCard = ({ student, attendance, onMarkAttendance }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'present': return 'bg-green-100 text-green-800 border-green-200';
            case 'absent': return 'bg-red-100 text-red-800 border-red-200';
            case 'late': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'excused': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'present': return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
            case 'absent': return <XCircleIcon className="w-5 h-5 text-red-600" />;
            case 'late': return <ClockIcon className="w-5 h-5 text-yellow-600" />;
            case 'excused': return <ExclamationTriangleIcon className="w-5 h-5 text-blue-600" />;
            default: return <UserGroupIcon className="w-5 h-5 text-gray-600" />;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'present': return 'حاضر';
            case 'absent': return 'غائب';
            case 'late': return 'متأخر';
            case 'excused': return 'غياب بعذر';
            default: return 'غير محدد';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                            {student.user?.name?.charAt(0)}
                        </span>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{student.user?.name}</h3>
                        <p className="text-sm text-gray-500">رقم الطالب: {student.student_id}</p>
                    </div>
                </div>

                <div className={`flex items-center px-3 py-2 rounded-lg border ${getStatusColor(attendance?.status)}`}>
                    {getStatusIcon(attendance?.status)}
                    <span className="mr-2 text-sm font-medium">
                        {getStatusText(attendance?.status)}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
                <button
                    onClick={() => onMarkAttendance(student.id, 'present')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                        attendance?.status === 'present'
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                    }`}
                >
                    <CheckCircleIcon className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs font-medium">حاضر</span>
                </button>

                <button
                    onClick={() => onMarkAttendance(student.id, 'absent')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                        attendance?.status === 'absent'
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                    }`}
                >
                    <XCircleIcon className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs font-medium">غائب</span>
                </button>

                <button
                    onClick={() => onMarkAttendance(student.id, 'late')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                        attendance?.status === 'late'
                            ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                            : 'border-gray-200 hover:border-yellow-300 hover:bg-yellow-50'
                    }`}
                >
                    <ClockIcon className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs font-medium">متأخر</span>
                </button>

                <button
                    onClick={() => onMarkAttendance(student.id, 'excused')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                        attendance?.status === 'excused'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                >
                    <ExclamationTriangleIcon className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs font-medium">بعذر</span>
                </button>
            </div>

            {attendance?.check_in_time && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>وقت الوصول: {attendance.check_in_time}</span>
                        {attendance.check_out_time && (
                            <span>وقت المغادرة: {attendance.check_out_time}</span>
                        )}
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default function Attendance({ auth, classes = [], students = [], attendances = [] }) {
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchTerm, setSearchTerm] = useState('');

    const { data, setData, post, processing } = useForm({
        class_id: '',
        date: new Date().toISOString().split('T')[0],
        attendances: {}
    });

    const filteredStudents = students.filter(student => {
        const matchesSearch = student.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.student_id?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesClass = !selectedClass || student.class_id == selectedClass;
        return matchesSearch && matchesClass;
    });

    const handleMarkAttendance = (studentId, status) => {
        const currentTime = new Date().toLocaleTimeString('ar-SA', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
        });

        setData('attendances', {
            ...data.attendances,
            [studentId]: {
                status,
                check_in_time: status === 'present' || status === 'late' ? currentTime : null,
                notes: ''
            }
        });
    };

    const handleSaveAttendance = () => {
        if (!selectedClass) {
            alert('يرجى اختيار الفصل أولاً');
            return;
        }

        post(route('teacher.attendance.store'), {
            class_id: selectedClass,
            date: selectedDate,
            attendances: data.attendances
        });
    };

    const getAttendanceForStudent = (studentId) => {
        return attendances.find(att => att.student_id === studentId && att.date === selectedDate) ||
            data.attendances[studentId];
    };

    const getAttendanceStats = () => {
        const totalStudents = filteredStudents.length;
        const presentCount = filteredStudents.filter(student => {
            const attendance = getAttendanceForStudent(student.id);
            return attendance?.status === 'present';
        }).length;
        const absentCount = filteredStudents.filter(student => {
            const attendance = getAttendanceForStudent(student.id);
            return attendance?.status === 'absent';
        }).length;
        const lateCount = filteredStudents.filter(student => {
            const attendance = getAttendanceForStudent(student.id);
            return attendance?.status === 'late';
        }).length;

        return { totalStudents, presentCount, absentCount, lateCount };
    };

    const stats = getAttendanceStats();

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">إدارة الحضور</h2>}
        >
            <Head title="إدارة الحضور" />

            <div className="space-y-6">
                {/* Controls */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <InputLabel htmlFor="class_select" value="اختر الفصل" />
                            <select
                                id="class_select"
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                            >
                                <option value="">جميع الفصول</option>
                                {classes.map(classItem => (
                                    <option key={classItem.id} value={classItem.id}>
                                        {classItem.name_ar}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <InputLabel htmlFor="date_select" value="التاريخ" />
                            <TextInput
                                id="date_select"
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="mt-1 block w-full"
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor="search" value="البحث" />
                            <div className="relative mt-1">
                                <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <TextInput
                                    id="search"
                                    type="text"
                                    placeholder="البحث عن طالب..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pr-10"
                                />
                            </div>
                        </div>

                        <div className="flex items-end">
                            <PrimaryButton
                                onClick={handleSaveAttendance}
                                disabled={processing || !selectedClass}
                                className="w-full"
                            >
                                {processing ? 'جاري الحفظ...' : 'حفظ الحضور'}
                            </PrimaryButton>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white"
                    >
                        <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
                            <div>
                                <p className="text-blue-100">إجمالي الطلاب</p>
                                <p className="text-3xl font-bold">{stats.totalStudents}</p>
                            </div>
                            <UserGroupIcon className="w-12 h-12 text-blue-200" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white"
                    >
                        <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
                            <div>
                                <p className="text-green-100">الحاضرون</p>
                                <p className="text-3xl font-bold">{stats.presentCount}</p>
                            </div>
                            <CheckCircleIcon className="w-12 h-12 text-green-200" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white"
                    >
                        <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
                            <div>
                                <p className="text-red-100">الغائبون</p>
                                <p className="text-3xl font-bold">{stats.absentCount}</p>
                            </div>
                            <XCircleIcon className="w-12 h-12 text-red-200" />
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
                                <p className="text-yellow-100">المتأخرون</p>
                                <p className="text-3xl font-bold">{stats.lateCount}</p>
                            </div>
                            <ClockIcon className="w-12 h-12 text-yellow-200" />
                        </div>
                    </motion.div>
                </div>

                {/* Attendance Grid */}
                {selectedClass ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredStudents.map((student, index) => (
                            <AttendanceCard
                                key={student.id}
                                student={student}
                                attendance={getAttendanceForStudent(student.id)}
                                onMarkAttendance={handleMarkAttendance}
                            />
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12 bg-white rounded-xl shadow-lg"
                    >
                        <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">اختر فصلاً لبدء تسجيل الحضور</h3>
                        <p className="text-gray-500">يرجى اختيار الفصل والتاريخ لعرض قائمة الطلاب</p>
                    </motion.div>
                )}

                {selectedClass && filteredStudents.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12 bg-white rounded-xl shadow-lg"
                    >
                        <UserGroupIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">لا يوجد طلاب</h3>
                        <p className="text-gray-500">لا يوجد طلاب في هذا الفصل أو لا توجد نتائج للبحث</p>
                    </motion.div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
