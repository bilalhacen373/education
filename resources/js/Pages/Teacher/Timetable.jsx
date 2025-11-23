import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
    PlusIcon,
    ClockIcon,
    TrashIcon,
    CalendarIcon,
    SparklesIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Modal from '@/Components/Modal';
import AITimetableGeneratorModal from '@/Components/AITimetableGeneratorModal';

const daysOfWeek = {
    sunday: 'الأحد',
    monday: 'الاثنين',
    tuesday: 'الثلاثاء',
    wednesday: 'الأربعاء',
    thursday: 'الخميس',
    friday: 'الجمعة',
    saturday: 'السبت',
};

const TimetableCard = ({ timetable, onDelete }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow p-4 border-r-4 border-blue-500"
    >
        <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
                <h4 className="font-medium text-gray-900">{timetable.subject?.name_ar || timetable.subject?.name}</h4>
                <p className="text-sm text-gray-600">{timetable.class.name_ar || timetable.class.name}</p>
                {timetable.lesson && (
                    <p className="text-xs text-blue-600 mt-1">
                        <span className="font-medium">الدرس:</span> {timetable.lesson.title_ar || timetable.lesson.title}
                    </p>
                )}
            </div>
            <button
                onClick={() => onDelete(timetable)}
                className="text-red-600 hover:text-red-800"
            >
                <TrashIcon className="w-5 h-5" />
            </button>
        </div>
        <div className="flex items-center text-sm text-gray-600 space-x-2 rtl:space-x-reverse">
            <ClockIcon className="w-4 h-4" />
            <span>{timetable.start_time} - {timetable.end_time}</span>
        </div>
        {timetable.room_number && (
            <div className="mt-2 text-sm text-gray-600">
                <span className="font-medium">القاعة:</span> {timetable.room_number}
            </div>
        )}
    </motion.div>
);

export default function Timetable({ auth, timetables = [], groupedByDay = {}, classes = [], subjects = [], lessons = [] }) {
    const [showModal, setShowModal] = useState(false);
    const [showAIModal, setShowAIModal] = useState(false);
    const [isAILoading, setIsAILoading] = useState(false);
    const [formData, setFormData] = useState({
        class_id: '',
        day_of_week: 'sunday',
        subject_id: '',
        lesson_id: '',
        start_time: '',
        end_time: '',
        room_number: '',
    });

    const [filteredLessons, setFilteredLessons] = useState([]);

    useEffect(() => {
        if (formData.subject_id) {
            const filtered = lessons.filter(lesson => lesson.subject_id == formData.subject_id);
            setFilteredLessons(filtered);
        } else {
            setFilteredLessons([]);
            setFormData(prev => ({ ...prev, lesson_id: '' }));
        }
    }, [formData.subject_id, lessons]);

    const handleSubmit = (e) => {
        e.preventDefault();

        router.post(route('teacher.timetable.store'), formData, {
            onSuccess: () => {
                toast.success('تم إضافة الحصة للجدول');
                setShowModal(false);
                setFormData({
                    class_id: '',
                    day_of_week: 'sunday',
                    subject_id: '',
                    lesson_id: '',
                    start_time: '',
                    end_time: '',
                    room_number: '',
                });
                setFilteredLessons([]);
            },
            onError: (errors) => {
                const errorMessage = errors.time || errors.error || 'حدث خطأ أثناء حفظ البيانات';
                toast.error(errorMessage);
            },
        });
    };

    const handleDelete = (timetable) => {
        if (confirm('هل أنت متأكد من حذف هذه الحصة؟')) {
            router.delete(route('timetable.destroy', timetable.id), {
                onSuccess: () => {
                    toast.success('تم حذف الحصة');
                },
                onError: () => {
                    toast.error('حدث خطأ أثناء حذف الحصة');
                },
            });
        }
    };

    const handleAIGeneration = async (payload) => {
        setIsAILoading(true);
        try {
            const response = await fetch(route('teacher.timetable.generate-ai'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (data.success) {
                toast.success('تم إنشاء الجداول بنجاح!');
                router.reload({ only: ['timetables', 'groupedByDay'] });
                return data;
            } else {
                toast.error(data.error || 'فشل في إنشاء الجداول');
                return null;
            }
        } catch (error) {
            toast.error('خطأ في الاتصال بخدمة الذكاء الاصطناعي');
            console.error('AI generation error:', error);
            return null;
        } finally {
            setIsAILoading(false);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800">جدول الحصص</h2>}
        >
            <Head title="جدول الحصص" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">إدارة جدول الحصص</h3>
                        <p className="text-sm text-gray-600">عرض وإدارة جدول الحصص الأسبوعي</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowAIModal(true)}
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md"
                        >
                            <SparklesIcon className="w-5 h-5 ml-2" />
                            إنشاء بالذكاء الاصطناعي
                        </button>
                        <button
                            onClick={() => setShowModal(true)}
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all"
                        >
                            <PlusIcon className="w-5 h-5 ml-2" />
                            إضافة حصة
                        </button>
                    </div>
                </div>

                {Object.keys(groupedByDay).length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-xl shadow-lg p-12 text-center"
                    >
                        <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">لا يوجد جدول</h3>
                        <p className="text-gray-500">ابدأ بإضافة حصص إلى جدولك الأسبوعي</p>
                    </motion.div>
                ) : (
                    <div className="space-y-6">
                        {Object.entries(daysOfWeek).map(([dayKey, dayName]) => {
                            const dayTimetables = groupedByDay[dayKey] || [];

                            if (dayTimetables.length === 0) return null;

                            return (
                                <motion.div
                                    key={dayKey}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-gray-50 rounded-xl p-6"
                                >
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                        <CalendarIcon className="w-6 h-6 ml-2 text-blue-600" />
                                        {dayName}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {dayTimetables.map((timetable) => (
                                            <TimetableCard
                                                key={timetable.id}
                                                timetable={timetable}
                                                onDelete={handleDelete}
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            <Modal show={showModal} onClose={() => setShowModal(false)} maxWidth="2xl">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">إضافة حصة جديدة</h3>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الفصل
                                </label>
                                <select
                                    value={formData.class_id}
                                    onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">اختر الفصل</option>
                                    {classes.map((cls) => (
                                        <option key={cls.id} value={cls.id}>
                                            {cls.name_ar || cls.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    اليوم
                                </label>
                                <select
                                    value={formData.day_of_week}
                                    onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    {Object.entries(daysOfWeek).map(([key, name]) => (
                                        <option key={key} value={key}>{name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    المادة
                                </label>
                                <select
                                    value={formData.subject_id}
                                    onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">اختر المادة</option>
                                    {subjects.map((subject) => (
                                        <option key={subject.id} value={subject.id}>
                                            {subject.name_ar || subject.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الدرس (اختياري)
                                </label>
                                <select
                                    value={formData.lesson_id}
                                    onChange={(e) => setFormData({ ...formData, lesson_id: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={!formData.subject_id}
                                >
                                    <option value="">اختر الدرس (اختياري)</option>
                                    {filteredLessons.map((lesson) => (
                                        <option key={lesson.id} value={lesson.id}>
                                            {lesson.title_ar || lesson.title}
                                        </option>
                                    ))}
                                </select>
                                {formData.subject_id && filteredLessons.length === 0 && (
                                    <p className="text-xs text-gray-500 mt-1">لا توجد دروس متاحة لهذه المادة</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    وقت البداية
                                </label>
                                <input
                                    type="time"
                                    value={formData.start_time}
                                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    وقت النهاية
                                </label>
                                <input
                                    type="time"
                                    value={formData.end_time}
                                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    القاعة (اختياري)
                                </label>
                                <input
                                    type="text"
                                    value={formData.room_number}
                                    onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
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
                                إضافة الحصة
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            <AITimetableGeneratorModal
                show={showAIModal}
                onClose={() => setShowAIModal(false)}
                onSubmit={handleAIGeneration}
                classes={classes}
                isSchoolAdmin={false}
                isLoading={isAILoading}
            />
        </AuthenticatedLayout>
    );
}
