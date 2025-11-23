import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import {
    PlayCircleIcon,
    DocumentIcon,
    CheckCircleIcon,
    ClockIcon,
    BookOpenIcon,
    ChevronRightIcon,
} from '@heroicons/react/24/outline';
import ReactPlayer from 'react-player';
import toast from 'react-hot-toast';

const LessonItem = ({ lesson, isCompleted, onSelect, isActive }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => onSelect(lesson)}
        className={`p-4 rounded-lg cursor-pointer transition-all ${
            isActive
                ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-500'
                : 'bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md'
        }`}
    >
        <div className="flex items-start space-x-3 rtl:space-x-reverse">
            <div
                className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                    isCompleted
                        ? 'bg-green-500 text-white'
                        : isActive
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-500'
                }`}
            >
                {isCompleted ? (
                    <CheckCircleIcon className="w-6 h-6" />
                ) : lesson.content_type === 'video' ? (
                    <PlayCircleIcon className="w-6 h-6" />
                ) : (
                    <DocumentIcon className="w-6 h-6" />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-medium ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                    {lesson.title}
                </h4>
                <div className="flex items-center space-x-2 rtl:space-x-reverse mt-1">
                    <span className="text-xs text-gray-500 flex items-center">
                        <ClockIcon className="w-3 h-3 ml-1" />
                        {lesson.duration_minutes} دقيقة
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500 capitalize">{lesson.content_type}</span>
                </div>
            </div>
            {isCompleted && (
                <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
            )}
        </div>
    </motion.div>
);

export default function Lessons({ auth, course = null, lessons = [], completedLessonIds = [] }) {
    const [selectedLesson, setSelectedLesson] = useState(lessons[0] || null);
    const [watchedPercentage, setWatchedPercentage] = useState(0);

    const handleProgress = (state) => {
        const percentage = state.played * 100;
        setWatchedPercentage(percentage);

        if (percentage > 80 && selectedLesson && !completedLessonIds.includes(selectedLesson.id)) {
            handleCompleteLesson(selectedLesson.id);
        }
    };

    const handleCompleteLesson = (lessonId) => {
        router.post(`/student/lessons/${lessonId}/complete`, {}, {
            onSuccess: () => {
                toast.success('تم تسجيل إكمال الدرس');
            },
        });
    };

    const completedCount = completedLessonIds.length;
    const totalLessons = lessons.length;
    const progressPercentage = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                course ? (
                    <div>
                        <h2 className="font-semibold text-xl text-gray-800">{course.title}</h2>
                        <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                    </div>
                ) : (
                    <h2 className="font-semibold text-xl text-gray-800">جميع الدروس المتاحة</h2>
                )
            }
        >
            <Head title={course ? `دروس ${course.title}` : 'جميع الدروس'} />

            <div className="space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 text-white"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-medium">تقدمك في الكورس</h3>
                            <p className="text-blue-100 text-sm">
                                {completedCount} من {totalLessons} درس مكتمل
                            </p>
                        </div>
                        <div className="text-3xl font-bold">{Math.round(progressPercentage)}%</div>
                    </div>
                    <div className="w-full bg-blue-400 rounded-full h-3">
                        <div
                            className="bg-white h-3 rounded-full transition-all duration-500"
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {selectedLesson ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-xl shadow-lg overflow-hidden"
                            >
                                {(selectedLesson.content_type === 'video' || selectedLesson.content_type === 'mixed') && selectedLesson.video_url && (
                                    <div className="aspect-video bg-black">
                                        <ReactPlayer
                                            url={selectedLesson.video_url}
                                            width="100%"
                                            height="100%"
                                            controls
                                            onProgress={handleProgress}
                                            config={{
                                                file: {
                                                    attributes: {
                                                        controlsList: 'nodownload',
                                                    },
                                                },
                                            }}
                                        />
                                    </div>
                                )}

                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                                {selectedLesson.title}
                                            </h3>
                                            <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm text-gray-500">
                                                <span className="flex items-center">
                                                    <ClockIcon className="w-4 h-4 ml-1" />
                                                    {selectedLesson.duration_minutes} دقيقة
                                                </span>
                                                <span className="flex items-center capitalize">
                                                    {selectedLesson.content_type === 'video' ? (
                                                        <PlayCircleIcon className="w-4 h-4 ml-1" />
                                                    ) : (
                                                        <DocumentIcon className="w-4 h-4 ml-1" />
                                                    )}
                                                    {selectedLesson.content_type}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {selectedLesson.teacher && selectedLesson.teacher.user && (
                                                <div className="text-sm text-gray-500 mb-1">
                                                    المعلم: {selectedLesson.teacher.user.name}
                                                </div>
                                            )}
                                            {selectedLesson.course && (
                                                <div className="text-sm text-gray-500 mb-2">
                                                    الدورة: {selectedLesson.course.title}
                                                </div>
                                            )}
                                            {completedLessonIds.includes(selectedLesson.id) ? (
                                                <div className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                                                    <CheckCircleIcon className="w-5 h-5" />
                                                    <span className="font-medium">مكتمل</span>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleCompleteLesson(selectedLesson.id)}
                                                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all font-medium"
                                                >
                                                    تعيين كمكتمل
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {selectedLesson.description && (
                                        <div className="prose max-w-none">
                                            <p className="text-gray-700">{selectedLesson.description}</p>
                                        </div>
                                    )}

                                    {selectedLesson.content && (
                                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                            <h4 className="font-medium text-gray-900 mb-2">محتوى الدرس</h4>
                                            <div
                                                className="prose max-w-none text-gray-700"
                                                dangerouslySetInnerHTML={{ __html: selectedLesson.content }}
                                            />
                                        </div>
                                    )}

                                    {selectedLesson.documents && selectedLesson.documents.length > 0 && (
                                        <div className="mt-6">
                                            <h4 className="font-medium text-gray-900 mb-3">المستندات</h4>
                                            <div className="space-y-2">
                                                {selectedLesson.documents.map((doc, index) => (
                                                    <a
                                                        key={index}
                                                        href={doc.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center space-x-3 rtl:space-x-reverse p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                                    >
                                                        <DocumentIcon className="w-5 h-5 text-gray-500" />
                                                        <span className="flex-1 text-sm font-medium text-gray-900">
                                                            {doc.name}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {(doc.size / 1024 / 1024).toFixed(2)} MB
                                                        </span>
                                                        <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {selectedLesson.resources && selectedLesson.resources.length > 0 && (
                                        <div className="mt-6">
                                            <h4 className="font-medium text-gray-900 mb-3">المرفقات والموارد</h4>
                                            <div className="space-y-2">
                                                {selectedLesson.resources.map((resource, index) => (
                                                    <a
                                                        key={index}
                                                        href={resource.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center space-x-3 rtl:space-x-reverse p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                                    >
                                                        <DocumentIcon className="w-5 h-5 text-gray-500" />
                                                        <span className="flex-1 text-sm font-medium text-gray-900">
                                                            {resource.name}
                                                        </span>
                                                        <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-white rounded-xl shadow-lg p-12 text-center"
                            >
                                <BookOpenIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    لا توجد دروس متاحة
                                </h3>
                                <p className="text-gray-500">
                                    سيتم إضافة الدروس قريباً
                                </p>
                            </motion.div>
                        )}
                    </div>

                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-xl shadow-lg p-6 sticky top-6"
                        >
                            <h3 className="text-lg font-bold text-gray-900 mb-4">قائمة الدروس</h3>
                            <div className="space-y-3 max-h-[600px] overflow-y-auto">
                                {lessons.map((lesson, index) => (
                                    <LessonItem
                                        key={lesson.id}
                                        lesson={lesson}
                                        isCompleted={completedLessonIds.includes(lesson.id)}
                                        onSelect={setSelectedLesson}
                                        isActive={selectedLesson?.id === lesson.id}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
