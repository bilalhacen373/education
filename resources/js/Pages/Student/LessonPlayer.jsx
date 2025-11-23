import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import VideoPlayer from '@/Components/VideoPlayer';
import DocumentViewer from '@/Components/DocumentViewer';
import { toast } from 'react-hot-toast';
import axios from 'axios';

export default function LessonPlayer({ auth, lesson, progress, nextLesson, previousLesson }) {
    const [currentProgress, setCurrentProgress] = useState(progress?.progress_percentage || 0);
    const [timeSpent, setTimeSpent] = useState(progress?.time_spent_minutes || 0);

    const updateProgress = async (progressData) => {
        try {
            await axios.post(route('student.lessons.progress', lesson.id), {
                progress_percentage: progressData.progress,
                time_spent_minutes: progressData.timeSpent,
            });

            setCurrentProgress(progressData.progress);
            setTimeSpent(progressData.timeSpent);
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    };

    const handleComplete = () => {
        toast.success('تم إكمال الدرس بنجاح!');
        if (nextLesson) {
            setTimeout(() => {
                router.visit(route('student.lessons.show', nextLesson.id));
            }, 2000);
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={lesson.title} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6 flex items-center justify-between space-x-4 rtl:space-x-reverse">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{lesson.title}</h1>
                            <p className="mt-2 text-sm text-gray-600">
                                الكورس: {lesson.course.title}
                            </p>
                        </div>
                        <div className="flex items-center space-x-4 rtl:space-x-reverse">
                            {previousLesson && (
                                <button
                                    onClick={() => router.visit(route('student.lessons.show', previousLesson.id))}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    الدرس السابق
                                </button>
                            )}
                            {nextLesson && (
                                <button
                                    onClick={() => router.visit(route('student.lessons.show', nextLesson.id))}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    الدرس التالي
                                    <svg className="w-5 h-5 mr-2 rtl:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                            <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
                                <div>
                                    <p className="text-sm font-medium text-blue-900">نسبة الإنجاز</p>
                                    <p className="text-3xl font-bold text-blue-700">{currentProgress}%</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-blue-900">الوقت المستغرق</p>
                                    <p className="text-3xl font-bold text-blue-700">{timeSpent} دقيقة</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-blue-900">المدة</p>
                                    <p className="text-3xl font-bold text-blue-700">{lesson.duration_minutes} دقيقة</p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <div className="w-full bg-blue-200 rounded-full h-3">
                                    <div
                                        className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                                        style={{ width: `${currentProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            {lesson.content_type === 'video' && lesson.video_url && (
                                <div className="mb-8">
                                    <h2 className="text-xl font-semibold mb-4 text-gray-900">الفيديو</h2>
                                    <VideoPlayer
                                        url={lesson.video_url}
                                        initialProgress={currentProgress}
                                        onProgress={updateProgress}
                                        onComplete={handleComplete}
                                        className="w-full aspect-video"
                                    />
                                </div>
                            )}

                            {lesson.description && (
                                <div className="mb-8">
                                    <h2 className="text-xl font-semibold mb-4 text-gray-900">وصف الدرس</h2>
                                    <div className="prose prose-blue max-w-none">
                                        <p className="text-gray-700 whitespace-pre-wrap">{lesson.description}</p>
                                    </div>
                                </div>
                            )}

                            {lesson.content && (
                                <div className="mb-8">
                                    <h2 className="text-xl font-semibold mb-4 text-gray-900">محتوى الدرس</h2>
                                    <div className="prose prose-blue max-w-none">
                                        <div
                                            className="text-gray-700"
                                            dangerouslySetInnerHTML={{ __html: lesson.content }}
                                        />
                                    </div>
                                </div>
                            )}

                            {lesson.documents && lesson.documents.length > 0 && (
                                <div className="mb-8">
                                    <DocumentViewer documents={lesson.documents} />
                                </div>
                            )}

                            {currentProgress < 100 && (
                                <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <div className="flex">
                                        <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        <div className="mr-3">
                                            <h3 className="text-sm font-medium text-yellow-800">
                                                استمر في المشاهدة لإكمال الدرس
                                            </h3>
                                            <p className="mt-1 text-sm text-yellow-700">
                                                يجب إكمال {100 - currentProgress}% من الدرس للانتقال إلى الدرس التالي
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
