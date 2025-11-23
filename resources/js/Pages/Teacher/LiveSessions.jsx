import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    PlusIcon,
    VideoCameraIcon,
    CalendarIcon,
    ClockIcon,
    UserGroupIcon,
    PlayIcon,
    StopIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    LinkIcon,
} from '@heroicons/react/24/outline';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';

const SessionCard = ({ session, onEdit, onDelete, onView, onStart, onJoin }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'scheduled': return 'bg-blue-100 text-blue-800';
            case 'live': return 'bg-green-100 text-green-800';
            case 'ended': return 'bg-gray-100 text-gray-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'scheduled': return 'مجدولة';
            case 'live': return 'مباشرة الآن';
            case 'ended': return 'انتهت';
            case 'cancelled': return 'ملغية';
            default: return status;
        }
    };

    const isUpcoming = () => {
        const now = new Date();
        const sessionTime = new Date(session.scheduled_at);
        return sessionTime > now && session.status === 'scheduled';
    };

    const canStart = () => {
        const now = new Date();
        const sessionTime = new Date(session.scheduled_at);
        const timeDiff = sessionTime.getTime() - now.getTime();
        const minutesDiff = timeDiff / (1000 * 60);
        return minutesDiff <= 15 && minutesDiff >= -5 && session.status === 'scheduled';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        session.status === 'live'
                            ? 'bg-gradient-to-r from-red-500 to-red-600'
                            : 'bg-gradient-to-r from-indigo-500 to-purple-600'
                    }`}>
                        <VideoCameraIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">{session.title_ar}</h3>
                        <p className="text-sm text-gray-500">{session.class?.name_ar}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                        {getStatusText(session.status)}
                    </span>
                    <div className="flex items-center space-x-1 rtl:space-x-reverse">
                        <button
                            onClick={() => onView(session)}
                            className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                        >
                            <EyeIcon className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => onEdit(session)}
                            className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                            <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => onDelete(session)}
                            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                    <CalendarIcon className="w-4 h-4 ml-2" />
                    <span>{new Date(session.scheduled_at).toLocaleDateString('ar-SA')}</span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                    <ClockIcon className="w-4 h-4 ml-2" />
                    <span>
                        {new Date(session.scheduled_at).toLocaleTimeString('ar-SA', {
                            hour: '2-digit',
                            minute: '2-digit'
                        })} - {session.duration_minutes} دقيقة
                    </span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                    <UserGroupIcon className="w-4 h-4 ml-2" />
                    <span>{session.attendees_count || 0} مشارك</span>
                </div>

                {session.meeting_url && (
                    <div className="flex items-center text-sm text-gray-600">
                        <LinkIcon className="w-4 h-4 ml-2" />
                        <span className="truncate">رابط الجلسة متوفر</span>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                {session.status === 'live' ? (
                    <PrimaryButton
                        onClick={() => onJoin(session)}
                        className="bg-red-600 hover:bg-red-700 flex-1"
                    >
                        <PlayIcon className="w-4 h-4 ml-2" />
                        الانضمام للجلسة المباشرة
                    </PrimaryButton>
                ) : canStart() ? (
                    <PrimaryButton
                        onClick={() => onStart(session)}
                        className="bg-green-600 hover:bg-green-700 flex-1"
                    >
                        <PlayIcon className="w-4 h-4 ml-2" />
                        بدء الجلسة
                    </PrimaryButton>
                ) : isUpcoming() ? (
                    <div className="flex-1 text-center">
                        <span className="text-sm text-gray-500">
                            ستبدأ في {Math.ceil((new Date(session.scheduled_at) - new Date()) / (1000 * 60))} دقيقة
                        </span>
                    </div>
                ) : (
                    <div className="flex-1 text-center">
                        <span className="text-sm text-gray-500">
                            {session.status === 'ended' ? 'انتهت الجلسة' : 'جلسة ملغية'}
                        </span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default function LiveSessions({ auth, sessions = [], classes = [], courses = [] }) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        title: '',
        title_ar: '',
        description: '',
        description_ar: '',
        class_id: '',
        course_id: '',
        scheduled_at: '',
        duration_minutes: 60,
        meeting_url: '',
        meeting_password: '',
    });

    const handleCreate = (e) => {
        e.preventDefault();
        post(route('teacher.live-sessions.store'), {
            onSuccess: () => {
                setShowCreateModal(false);
                reset();
            }
        });
    };

    const handleEdit = (session) => {
        setSelectedSession(session);
        setData({
            title: session.title || '',
            title_ar: session.title_ar || '',
            description: session.description || '',
            description_ar: session.description_ar || '',
            class_id: session.class_id || '',
            course_id: session.course_id || '',
            scheduled_at: session.scheduled_at ? new Date(session.scheduled_at).toISOString().slice(0, 16) : '',
            duration_minutes: session.duration_minutes || 60,
            meeting_url: session.meeting_url || '',
            meeting_password: session.meeting_password || '',
        });
        setShowEditModal(true);
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        put(route('teacher.live-sessions.update', selectedSession.id), {
            onSuccess: () => {
                setShowEditModal(false);
                reset();
                setSelectedSession(null);
            }
        });
    };

    const handleView = (session) => {
        setSelectedSession(session);
        setShowViewModal(true);
    };

    const handleDelete = (session) => {
        if (confirm('هل أنت متأكد من حذف هذه الجلسة؟')) {
            // Delete logic here
        }
    };

    const handleStart = (session) => {
        // Start session logic
        if (session.meeting_url) {
            window.open(session.meeting_url, '_blank');
        }
    };

    const handleJoin = (session) => {
        // Join session logic
        if (session.meeting_url) {
            window.open(session.meeting_url, '_blank');
        }
    };

    const getSessionStats = () => {
        const totalSessions = sessions.length;
        const liveSessions = sessions.filter(s => s.status === 'live').length;
        const scheduledSessions = sessions.filter(s => s.status === 'scheduled').length;
        const completedSessions = sessions.filter(s => s.status === 'ended').length;

        return { totalSessions, liveSessions, scheduledSessions, completedSessions };
    };

    const stats = getSessionStats();

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">الجلسات المباشرة</h2>
                    <PrimaryButton onClick={() => setShowCreateModal(true)}>
                        <PlusIcon className="w-5 h-5 ml-2" />
                        جدولة جلسة جديدة
                    </PrimaryButton>
                </div>
            }
        >
            <Head title="الجلسات المباشرة" />

            <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white"
                    >
                        <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
                            <div>
                                <p className="text-blue-100">إجمالي الجلسات</p>
                                <p className="text-3xl font-bold">{stats.totalSessions}</p>
                            </div>
                            <VideoCameraIcon className="w-12 h-12 text-blue-200" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white"
                    >
                        <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
                            <div>
                                <p className="text-red-100">مباشرة الآن</p>
                                <p className="text-3xl font-bold">{stats.liveSessions}</p>
                            </div>
                            <PlayIcon className="w-12 h-12 text-red-200" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white"
                    >
                        <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
                            <div>
                                <p className="text-yellow-100">مجدولة</p>
                                <p className="text-3xl font-bold">{stats.scheduledSessions}</p>
                            </div>
                            <CalendarIcon className="w-12 h-12 text-yellow-200" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white"
                    >
                        <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
                            <div>
                                <p className="text-green-100">مكتملة</p>
                                <p className="text-3xl font-bold">{stats.completedSessions}</p>
                            </div>
                            <StopIcon className="w-12 h-12 text-green-200" />
                        </div>
                    </motion.div>
                </div>

                {/* Sessions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sessions.map((session, index) => (
                        <SessionCard
                            key={session.id}
                            session={session}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onView={handleView}
                            onStart={handleStart}
                            onJoin={handleJoin}
                        />
                    ))}
                </div>

                {sessions.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                    >
                        <VideoCameraIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد جلسات مباشرة</h3>
                        <p className="text-gray-500 mb-6">ابدأ بجدولة جلسة مباشرة جديدة</p>
                        <PrimaryButton onClick={() => setShowCreateModal(true)}>
                            جدولة جلسة جديدة
                        </PrimaryButton>
                    </motion.div>
                )}
            </div>

            {/* Create Modal */}
            <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)} maxWidth="3xl">
                <form onSubmit={handleCreate} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">جدولة جلسة مباشرة جديدة</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <InputLabel htmlFor="title_ar" value="عنوان الجلسة (عربي)" />
                            <TextInput
                                id="title_ar"
                                value={data.title_ar}
                                onChange={(e) => setData('title_ar', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            />
                            <InputError message={errors.title_ar} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="title" value="عنوان الجلسة (إنجليزي)" />
                            <TextInput
                                id="title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors.title} className="mt-2" />
                        </div>
                    </div>

                    <div className="mb-4">
                        <InputLabel htmlFor="description_ar" value="وصف الجلسة" />
                        <textarea
                            id="description_ar"
                            value={data.description_ar}
                            onChange={(e) => setData('description_ar', e.target.value)}
                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                            rows="3"
                        />
                        <InputError message={errors.description_ar} className="mt-2" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <InputLabel htmlFor="class_id" value="الفصل" />
                            <select
                                id="class_id"
                                value={data.class_id}
                                onChange={(e) => setData('class_id', e.target.value)}
                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                            >
                                <option value="">اختر الفصل</option>
                                {classes.map(classItem => (
                                    <option key={classItem.id} value={classItem.id}>
                                        {classItem.name_ar}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.class_id} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="course_id" value="الكورس (اختياري)" />
                            <select
                                id="course_id"
                                value={data.course_id}
                                onChange={(e) => setData('course_id', e.target.value)}
                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                            >
                                <option value="">اختر الكورس</option>
                                {courses.map(course => (
                                    <option key={course.id} value={course.id}>
                                        {course.title_ar}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.course_id} className="mt-2" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <InputLabel htmlFor="scheduled_at" value="تاريخ ووقت الجلسة" />
                            <TextInput
                                id="scheduled_at"
                                type="datetime-local"
                                value={data.scheduled_at}
                                onChange={(e) => setData('scheduled_at', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            />
                            <InputError message={errors.scheduled_at} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="duration_minutes" value="مدة الجلسة (دقيقة)" />
                            <TextInput
                                id="duration_minutes"
                                type="number"
                                value={data.duration_minutes}
                                onChange={(e) => setData('duration_minutes', e.target.value)}
                                className="mt-1 block w-full"
                                min="15"
                                max="300"
                                required
                            />
                            <InputError message={errors.duration_minutes} className="mt-2" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <InputLabel htmlFor="meeting_url" value="رابط الاجتماع" />
                            <TextInput
                                id="meeting_url"
                                type="url"
                                value={data.meeting_url}
                                onChange={(e) => setData('meeting_url', e.target.value)}
                                className="mt-1 block w-full"
                                placeholder="https://zoom.us/j/..."
                            />
                            <InputError message={errors.meeting_url} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="meeting_password" value="كلمة مرور الاجتماع" />
                            <TextInput
                                id="meeting_password"
                                value={data.meeting_password}
                                onChange={(e) => setData('meeting_password', e.target.value)}
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors.meeting_password} className="mt-2" />
                        </div>
                    </div>

                    <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse">
                        <SecondaryButton onClick={() => setShowCreateModal(false)}>
                            إلغاء
                        </SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            {processing ? 'جاري الحفظ...' : 'جدولة الجلسة'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* View Modal */}
            <Modal show={showViewModal} onClose={() => setShowViewModal(false)} maxWidth="2xl">
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">تفاصيل الجلسة</h2>

                    {selectedSession && (
                        <div className="space-y-6">
                            <div className="flex items-center space-x-4 rtl:space-x-reverse">
                                <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                                    selectedSession.status === 'live'
                                        ? 'bg-gradient-to-r from-red-500 to-red-600'
                                        : 'bg-gradient-to-r from-indigo-500 to-purple-600'
                                }`}>
                                    <VideoCameraIcon className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{selectedSession.title_ar}</h3>
                                    <p className="text-gray-600">{selectedSession.class?.name_ar}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">التاريخ</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {new Date(selectedSession.scheduled_at).toLocaleDateString('ar-SA')}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">الوقت</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {new Date(selectedSession.scheduled_at).toLocaleTimeString('ar-SA', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">المدة</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedSession.duration_minutes} دقيقة</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">الحالة</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {selectedSession.status === 'scheduled' ? 'مجدولة' :
                                            selectedSession.status === 'live' ? 'مباشرة الآن' :
                                                selectedSession.status === 'ended' ? 'انتهت' : 'ملغية'}
                                    </p>
                                </div>
                            </div>

                            {selectedSession.description_ar && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">الوصف</label>
                                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedSession.description_ar}</p>
                                </div>
                            )}

                            {selectedSession.meeting_url && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">رابط الاجتماع</label>
                                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                        <TextInput
                                            value={selectedSession.meeting_url}
                                            className="flex-1"
                                            readOnly
                                        />
                                        <SecondaryButton
                                            onClick={() => navigator.clipboard.writeText(selectedSession.meeting_url)}
                                        >
                                            نسخ
                                        </SecondaryButton>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end space-x-3 rtl:space-x-reverse">
                                <SecondaryButton onClick={() => setShowViewModal(false)}>
                                    إغلاق
                                </SecondaryButton>
                                {selectedSession.meeting_url && (
                                    <PrimaryButton
                                        onClick={() => window.open(selectedSession.meeting_url, '_blank')}
                                    >
                                        فتح الرابط
                                    </PrimaryButton>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
