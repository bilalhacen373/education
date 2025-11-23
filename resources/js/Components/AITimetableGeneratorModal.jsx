import { useState } from 'react';
import {
    SparklesIcon,
    XMarkIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Modal from './Modal';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const daysOfWeekAr = {
    Monday: 'الاثنين',
    Tuesday: 'الثلاثاء',
    Wednesday: 'الأربعاء',
    Thursday: 'الخميس',
    Friday: 'الجمعة',
    Saturday: 'السبت',
    Sunday: 'الأحد',
};

export default function AITimetableGeneratorModal({
                                                      show,
                                                      onClose,
                                                      onSubmit,
                                                      classes = [],
                                                      teachers = [],
                                                      isSchoolAdmin = false,
                                                      isLoading = false,
                                                  }) {
    const [formData, setFormData] = useState({
        class_ids: [],
        teacher_ids: isSchoolAdmin ? [] : undefined,
        start_time: '08:00',
        end_time: '16:00',
        session_duration: 50,
        days_of_week: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    });

    const [results, setResults] = useState(null);
    const [showResults, setShowResults] = useState(false);

    const handleClassToggle = (classId) => {
        setFormData(prev => ({
            ...prev,
            class_ids: prev.class_ids.includes(classId)
                ? prev.class_ids.filter(id => id !== classId)
                : [...prev.class_ids, classId]
        }));
    };

    const handleTeacherToggle = (teacherId) => {
        if (!isSchoolAdmin) return;
        setFormData(prev => ({
            ...prev,
            teacher_ids: (prev.teacher_ids || []).includes(teacherId)
                ? prev.teacher_ids.filter(id => id !== teacherId)
                : [...(prev.teacher_ids || []), teacherId]
        }));
    };

    const handleDayToggle = (day) => {
        setFormData(prev => ({
            ...prev,
            days_of_week: prev.days_of_week.includes(day)
                ? prev.days_of_week.filter(d => d !== day)
                : [...prev.days_of_week, day]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.class_ids.length === 0) {
            toast.error('يرجى اختيار فصل واحد على الأقل');
            return;
        }

        if (formData.days_of_week.length === 0) {
            toast.error('يرجى اختيار يوم واحد على الأقل');
            return;
        }

        const payload = {
            class_ids: formData.class_ids,
            start_time: formData.start_time,
            end_time: formData.end_time,
            session_duration: formData.session_duration,
            days_of_week: formData.days_of_week,
        };

        if (isSchoolAdmin && formData.teacher_ids) {
            payload.teacher_ids = formData.teacher_ids.length > 0 ? formData.teacher_ids : undefined;
        }

        try {
            const response = await onSubmit(payload);
            if (response && response.results) {
                setResults(response);
                setShowResults(true);
            }
        } catch (error) {
            console.error('Generation error:', error);
        }
    };

    const handleClose = () => {
        setFormData({
            class_ids: [],
            teacher_ids: isSchoolAdmin ? [] : undefined,
            start_time: '08:00',
            end_time: '16:00',
            session_duration: 50,
            days_of_week: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        });
        setResults(null);
        setShowResults(false);
        onClose();
    };

    if (showResults && results) {
        return (
            <Modal show={show} onClose={handleClose} maxWidth="4xl">
                <div className="p-8 bg-gradient-to-br from-gray-50 to-white">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                            <CheckCircleIcon className="w-8 h-8 text-green-500" />
                            نتائج الإنشاء
                        </h3>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {results.results.map((result, idx) => (
                            <div
                                key={idx}
                                className={`p-4 rounded-lg border-l-4 ${
                                    result.success
                                        ? 'bg-green-50 border-green-500'
                                        : 'bg-red-50 border-red-500'
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900">
                                            {result.class_name}
                                            {result.teacher_name && ` - ${result.teacher_name}`}
                                        </h4>
                                        {result.success ? (
                                            <>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    تم إنشاء {result.created_slots} حصة بنجاح
                                                </p>
                                                {result.explanation && (
                                                    <p className="text-sm text-gray-700 mt-2 italic">
                                                        {result.explanation}
                                                    </p>
                                                )}
                                                {result.suggestions && result.suggestions.length > 0 && (
                                                    <div className="mt-2">
                                                        <p className="text-xs font-semibold text-gray-600 mb-1">اقتراحات:</p>
                                                        <ul className="text-xs text-gray-600 space-y-1">
                                                            {result.suggestions.map((suggestion, i) => (
                                                                <li key={i} className="flex items-start gap-1">
                                                                    <span className="text-green-600">•</span>
                                                                    <span>{suggestion}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <p className="text-sm text-red-600 mt-1">
                                                {result.error}
                                            </p>
                                        )}
                                    </div>
                                    <div className="mr-4">
                                        {result.success ? (
                                            <CheckCircleIcon className="w-6 h-6 text-green-500" />
                                        ) : (
                                            <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 pt-6 border-t flex items-center justify-end gap-3">
                        <button
                            onClick={handleClose}
                            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md font-medium"
                        >
                            إغلاق
                        </button>
                    </div>
                </div>
            </Modal>
        );
    }

    return (
        <Modal show={show} onClose={handleClose} maxWidth="4xl">
            <div className="p-8 bg-gradient-to-br from-gray-50 to-white">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <SparklesIcon className="w-8 h-8 text-blue-600" />
                        إنشاء جدول بالذكاء الاصطناعي
                    </h3>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3">
                                الفصول <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {classes.map((cls) => (
                                    <label
                                        key={cls.id}
                                        className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formData.class_ids.includes(cls.id)}
                                            onChange={() => handleClassToggle(cls.id)}
                                            className="rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">
                                            {cls.name_ar || cls.name}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            {classes.length === 0 && (
                                <p className="text-sm text-gray-500 mt-2">لا توجد فصول متاحة</p>
                            )}
                        </div>

                        {isSchoolAdmin && teachers && teachers.length > 0 && (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3">
                                    المعلمون (اختياري - اتركها فارغة للاختيار الجميع)
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {teachers.map((teacher) => (
                                        <label
                                            key={teacher.id}
                                            className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={(formData.teacher_ids || []).includes(teacher.id)}
                                                onChange={() => handleTeacherToggle(teacher.id)}
                                                className="rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">
                                                {teacher.user?.name || teacher.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3">
                                أيام الدراسة <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {daysOfWeek.map((day) => (
                                    <label
                                        key={day}
                                        className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formData.days_of_week.includes(day)}
                                            onChange={() => handleDayToggle(day)}
                                            className="rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">
                                            {daysOfWeekAr[day]}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    وقت البداية <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="time"
                                    value={formData.start_time}
                                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    مدة الحصة (دقيقة) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={formData.session_duration}
                                    onChange={(e) => setFormData({ ...formData, session_duration: parseInt(e.target.value) })}
                                    min="30"
                                    max="120"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                            <strong>ملاحظة:</strong> سيقوم الذكاء الاصطناعي بتحليل تخصص المعلم وأسماء الفصول لتوزيع المواد بشكل ذكي وتجنب التعارضات الزمنية.
                        </p>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-6 border-t">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            disabled={isLoading}
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || formData.class_ids.length === 0}
                            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <SparklesIcon className="w-5 h-5" />
                            {isLoading ? 'جاري الإنشاء...' : 'إنشاء الجدول'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
