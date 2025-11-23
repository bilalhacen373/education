import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import {
    PlusIcon,
    ClockIcon,
    TrashIcon,
    CalendarIcon,
    PencilIcon,
    AcademicCapIcon,
    UserIcon,
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

const TimetableCard = ({ timetable, onEdit, onDelete }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-md p-4 border-r-4 border-blue-500 hover:shadow-lg transition-shadow"
    >
        <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
                <h4 className="font-bold text-gray-900 text-lg mb-1">
                    {timetable.subject?.name_ar || timetable.subject?.name}
                </h4>
                <p className="text-sm text-gray-600 flex items-center">
                    <AcademicCapIcon className="w-4 h-4 ml-1" />
                    {timetable.class?.name_ar || timetable.class?.name}
                </p>
                <p className="text-sm text-gray-600 flex items-center mt-1">
                    <UserIcon className="w-4 h-4 ml-1" />
                    {timetable.teacher?.user?.name || 'معلم غير محدد'}
                </p>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={() => onEdit(timetable)}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                    title="تعديل"
                >
                    <PencilIcon className="w-5 h-5" />
                </button>
                <button
                    onClick={() => onDelete(timetable)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                    title="حذف"
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
        <div className="flex items-center text-sm text-gray-700 font-medium bg-gray-50 rounded-lg p-2">
            <ClockIcon className="w-5 h-5 ml-2 text-blue-600" />
            <span>{timetable.start_time} - {timetable.end_time}</span>
        </div>
        {timetable.room_number && (
            <div className="mt-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
                <span className="font-medium">القاعة:</span> {timetable.room_number}
            </div>
        )}
    </motion.div>
);

export default function Timetable({
                                      auth,
                                      timetables = [],
                                      groupedByDay = {},
                                      classes = [],
                                      subjects = [],
                                      teachers = []
                                  }) {
    const [showModal, setShowModal] = useState(false);
    const [showAIModal, setShowAIModal] = useState(false);
    const [isAILoading, setIsAILoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedTimetable, setSelectedTimetable] = useState(null);
    const [selectedClass, setSelectedClass] = useState('');
    const [formData, setFormData] = useState({
        class_id: '',
        subject_id: '',
        teacher_id: '',
        day_of_week: 'sunday',
        start_time: '',
        end_time: '',
        room_number: '',
    });

    const [classTeachers, setClassTeachers] = useState([]);
    const [classSubjects, setClassSubjects] = useState([]);

    const handleClassChange = (classId) => {
        setFormData({ ...formData, class_id: classId, teacher_id: '', subject_id: '' });

        const selectedClassData = classes.find(c => c.id === parseInt(classId));
        if (selectedClassData) {
            setClassTeachers(selectedClassData.teachers || []);
            setClassSubjects(selectedClassData.subjects || []);
        } else {
            setClassTeachers([]);
            setClassSubjects([]);
        }
    };

    const openAddModal = () => {
        setEditMode(false);
        setSelectedTimetable(null);
        setFormData({
            class_id: '',
            subject_id: '',
            teacher_id: '',
            day_of_week: 'sunday',
            start_time: '',
            end_time: '',
            room_number: '',
        });
        setClassTeachers([]);
        setClassSubjects([]);
        setShowModal(true);
    };

    const openEditModal = (timetable) => {
        setEditMode(true);
        setSelectedTimetable(timetable);
        setFormData({
            class_id: timetable.class_id,
            subject_id: timetable.subject_id,
            teacher_id: timetable.teacher_id,
            day_of_week: timetable.day_of_week,
            start_time: timetable.start_time,
            end_time: timetable.end_time,
            room_number: timetable.room_number || '',
        });

        const selectedClassData = classes.find(c => c.id === timetable.class_id);
        if (selectedClassData) {
            setClassTeachers(selectedClassData.teachers || []);
            setClassSubjects(selectedClassData.subjects || []);
        }

        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editMode && selectedTimetable) {
            router.put(route('school-admin.timetable.update', selectedTimetable.id), formData, {
                onSuccess: () => {
                    toast.success('تم تحديث الحصة بنجاح');
                    setShowModal(false);
                    resetForm();
                },
                onError: (errors) => {
                    const errorMessage = errors.time || errors.error || 'حدث خطأ أثناء حفظ البيانات';
                    toast.error(errorMessage);
                },
            });
        } else {
            router.post(route('school-admin.timetable.store'), formData, {
                onSuccess: () => {
                    toast.success('تم إضافة الحصة للجدول بنجاح');
                    setShowModal(false);
                    resetForm();
                },
                onError: (errors) => {
                    const errorMessage = errors.time || errors.error || 'حدث خطأ أثناء حفظ البيانات';
                    toast.error(errorMessage);
                },
            });
        }
    };

    const resetForm = () => {
        setFormData({
            class_id: '',
            subject_id: '',
            teacher_id: '',
            day_of_week: 'sunday',
            start_time: '',
            end_time: '',
            room_number: '',
        });
        setClassTeachers([]);
        setClassSubjects([]);
        setEditMode(false);
        setSelectedTimetable(null);
    };

    const handleDelete = (timetable) => {
        if (confirm('هل أنت متأكد من حذف هذه الحصة؟')) {
            router.delete(route('school-admin.timetable.destroy', timetable.id), {
                onSuccess: () => {
                    toast.success('تم حذف الحصة بنجاح');
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
            const response = await fetch(route('school-admin.timetable.generate-ai'), {
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

    const filteredTimetables = selectedClass
        ? timetables.filter(t => t.class_id === parseInt(selectedClass))
        : timetables;

    const filteredGroupedByDay = Object.entries(groupedByDay).reduce((acc, [day, items]) => {
        const filtered = selectedClass
            ? items.filter(t => t.class_id === parseInt(selectedClass))
            : items;
        if (filtered.length > 0) {
            acc[day] = filtered;
        }
        return acc;
    }, {});

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800">جدول الحصص</h2>}
        >
            <Head title="جدول الحصص" />

            <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">إدارة جدول الحصص</h3>
                            <p className="text-sm text-gray-600 mt-1">عرض وإدارة جدول الحصص الأسبوعي للمدرسة</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <select
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">جميع الفصول</option>
                                {classes.map((cls) => (
                                    <option key={cls.id} value={cls.id}>
                                        {cls.name_ar || cls.name}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={() => setShowAIModal(true)}
                                className="inline-flex items-center justify-center px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
                            >
                                <SparklesIcon className="w-5 h-5 ml-2" />
                                إنشاء بالذكاء الاصطناعي
                            </button>
                            <button
                                onClick={openAddModal}
                                className="inline-flex items-center justify-center px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
                            >
                                <PlusIcon className="w-5 h-5 ml-2" />
                                إضافة حصة
                            </button>
                        </div>
                    </div>
                </div>

                {Object.keys(filteredGroupedByDay).length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-xl shadow-lg p-12 text-center"
                    >
                        <CalendarIcon className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">لا يوجد جدول</h3>
                        <p className="text-gray-500 mb-6">ابدأ بإضافة حصص إلى الجدول الأسبوعي</p>
                        <button
                            onClick={openAddModal}
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all"
                        >
                            <PlusIcon className="w-5 h-5 ml-2" />
                            إضافة أول حصة
                        </button>
                    </motion.div>
                ) : (
                    <div className="space-y-6">
                        {Object.entries(daysOfWeek).map(([dayKey, dayName]) => {
                            const dayTimetables = filteredGroupedByDay[dayKey] || [];

                            if (dayTimetables.length === 0) return null;

                            return (
                                <motion.div
                                    key={dayKey}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 shadow-sm"
                                >
                                    <div className="flex items-center mb-5">
                                        <CalendarIcon className="w-7 h-7 ml-3 text-blue-600" />
                                        <h3 className="text-xl font-bold text-gray-900">{dayName}</h3>
                                        <span className="mr-3 text-sm text-gray-500">
                                            ({dayTimetables.length} حصة)
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {dayTimetables.map((timetable) => (
                                            <TimetableCard
                                                key={timetable.id}
                                                timetable={timetable}
                                                onEdit={openEditModal}
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

            <Modal show={showModal} onClose={() => { setShowModal(false); resetForm(); }} maxWidth="3xl">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-gray-900">
                            {editMode ? 'تعديل الحصة' : 'إضافة حصة جديدة'}
                        </h3>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    الفصل <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.class_id}
                                    onChange={(e) => handleClassChange(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    اليوم <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.day_of_week}
                                    onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    {Object.entries(daysOfWeek).map(([key, name]) => (
                                        <option key={key} value={key}>{name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    المادة <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.subject_id}
                                    onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                    disabled={!formData.class_id}
                                >
                                    <option value="">اختر المادة</option>
                                    {classSubjects.map((subject) => (
                                        <option key={subject.id} value={subject.id}>
                                            {subject.name_ar || subject.name}
                                        </option>
                                    ))}
                                </select>
                                {!formData.class_id && (
                                    <p className="text-xs text-gray-500 mt-1">اختر الفصل أولاً</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    المعلم <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.teacher_id}
                                    onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                    disabled={!formData.class_id}
                                >
                                    <option value="">اختر المعلم</option>
                                    {classTeachers.map((teacher) => (
                                        <option key={teacher.id} value={teacher.id}>
                                            {teacher.user ? teacher.user.name : (teacher.name || 'معلم غير محدد')}
                                        </option>
                                    ))}
                                </select>
                                {!formData.class_id && (
                                    <p className="text-xs text-gray-500 mt-1">اختر الفصل أولاً</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    وقت البداية <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="time"
                                    value={formData.start_time}
                                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    وقت النهاية <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="time"
                                    value={formData.end_time}
                                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    رقم القاعة (اختياري)
                                </label>
                                <input
                                    type="text"
                                    value={formData.room_number}
                                    onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="مثال: A101"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-5 border-t">
                            <button
                                type="button"
                                onClick={() => { setShowModal(false); resetForm(); }}
                                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                إلغاء
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md font-medium"
                            >
                                {editMode ? 'تحديث الحصة' : 'إضافة الحصة'}
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
                teachers={teachers}
                isSchoolAdmin={true}
                isLoading={isAILoading}
            />
        </AuthenticatedLayout>
    );
}
