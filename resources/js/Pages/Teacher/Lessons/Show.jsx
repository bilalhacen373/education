import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import VideoPlayer from '@/Components/VideoPlayer';
import DocumentViewer from '@/Components/DocumentViewer';

export default function ShowLesson({ auth, lesson, students }) {
    const getSharingModeLabel = (mode) => {
        const modes = {
            'private': 'خاص',
            'class': 'فصول محددة',
            'custom': 'طلاب محددون',
            'public': 'عام'
        };
        return modes[mode] || mode;
    };

    const getContentTypeLabel = (type) => {
        const types = {
            'text': 'نص',
            'video': 'فيديو',
            'document': 'مستند',
            'mixed': 'مختلط'
        };
        return types[type] || type;
    };

    const accessibleStudents = students?.filter(s => !s.is_excluded) || [];
    const excludedStudents = students?.filter(s => s.is_excluded) || [];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={lesson.title} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                        {lesson.title}
                                    </h2>
                                    <div className="flex gap-2 flex-wrap">
                                        {lesson.is_published ? (
                                            <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full">
                                                منشور
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-full">
                                                مسودة
                                            </span>
                                        )}
                                        {lesson.is_standalone && (
                                            <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                                                درس مستقل
                                            </span>
                                        )}
                                        <span className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-full">
                                            {getContentTypeLabel(lesson.content_type)}
                                        </span>
                                        <span className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-full">
                                            {getSharingModeLabel(lesson.sharing_mode)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Link href={route('teacher.lessons.edit', lesson.id)}>
                                        <PrimaryButton>تعديل</PrimaryButton>
                                    </Link>
                                    <Link href={route('teacher.lessons.index')}>
                                        <SecondaryButton>عودة</SecondaryButton>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {lesson.thumbnail && (
                                <div>
                                    <img
                                        src={`/storage/${lesson.thumbnail}`}
                                        alt={lesson.title}
                                        className="w-full max-w-2xl h-64 object-cover rounded-lg"
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600">المدة</p>
                                    <p className="text-2xl font-bold text-blue-600">{lesson.duration_minutes} دقيقة</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600">الطلاب المسموح لهم</p>
                                    <p className="text-2xl font-bold text-green-600">{accessibleStudents.length}</p>
                                </div>
                                <div className="bg-red-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600">الطلاب المستثنون</p>
                                    <p className="text-2xl font-bold text-red-600">{excludedStudents.length}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600">الترتيب</p>
                                    <p className="text-2xl font-bold text-gray-600">{lesson.order}</p>
                                </div>
                            </div>

                            {lesson.description && (
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">الوصف</h3>
                                    <p className="text-gray-700 whitespace-pre-wrap">{lesson.description}</p>
                                </div>
                            )}

                            {lesson.content_text && (
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">المحتوى النصي</h3>
                                    <div className="prose max-w-none">
                                        <p className="text-gray-700 whitespace-pre-wrap">{lesson.content_text}</p>
                                    </div>
                                </div>
                            )}

                            {lesson.video_url && (lesson.content_type === 'video' || lesson.content_type === 'mixed') && (
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">الفيديو</h3>
                                    <VideoPlayer url={lesson.video_url} />
                                </div>
                            )}

                            {lesson.documents && lesson.documents.length > 0 && (
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">المستندات المرفقة</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {lesson.documents.map((doc, index) => (
                                            <a
                                                key={index}
                                                href={doc.url || `/storage/${doc.path}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                                            >
                                                <svg
                                                    className="w-8 h-8 text-blue-600"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                                    />
                                                </svg>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {doc.mime_type} • {(doc.size / 1024).toFixed(2)} KB
                                                    </p>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {lesson.notes && (
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">ملاحظات</h3>
                                    <p className="text-gray-700 whitespace-pre-wrap">{lesson.notes}</p>
                                </div>
                            )}

                            {lesson.subject && (
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">المادة</h3>
                                    <p className="text-gray-700">{lesson.subject.name_ar || lesson.subject.name}</p>
                                </div>
                            )}

                            {lesson.course && (
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">الدورة</h3>
                                    <p className="text-gray-700">{lesson.course.title}</p>
                                </div>
                            )}

                            {lesson.classes && lesson.classes.length > 0 && (
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">الفصول المشاركة</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {lesson.classes.map((classItem) => (
                                            <span
                                                key={classItem.id}
                                                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                            >
                                                {classItem.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {students && students.length > 0 && (
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">الطلاب</h3>

                                    <div className="space-y-4">
                                        {accessibleStudents.length > 0 && (
                                            <div>
                                                <h4 className="text-md font-medium text-green-700 mb-2">
                                                    الطلاب المسموح لهم بالوصول ({accessibleStudents.length})
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {accessibleStudents.map((student) => (
                                                        <div
                                                            key={student.id}
                                                            className="p-3 bg-green-50 border border-green-200 rounded-lg"
                                                        >
                                                            <p className="font-medium text-gray-900">{student.name}</p>
                                                            <p className="text-sm text-gray-600">{student.class}</p>
                                                            {student.progress && (
                                                                <div className="mt-2">
                                                                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                                        <span>التقدم</span>
                                                                        <span>{student.progress.progress_percentage}%</span>
                                                                    </div>
                                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                                        <div
                                                                            className="bg-green-600 h-2 rounded-full"
                                                                            style={{ width: `${student.progress.progress_percentage}%` }}
                                                                        ></div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {excludedStudents.length > 0 && (
                                            <div>
                                                <h4 className="text-md font-medium text-red-700 mb-2">
                                                    الطلاب المستثنون ({excludedStudents.length})
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {excludedStudents.map((student) => (
                                                        <div
                                                            key={student.id}
                                                            className="p-3 bg-red-50 border border-red-200 rounded-lg"
                                                        >
                                                            <p className="font-medium text-gray-900">{student.name}</p>
                                                            <p className="text-sm text-gray-600">{student.class}</p>
                                                            <p className="text-xs text-red-600 mt-1">مستثنى من الوصول</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="border-t pt-6">
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p>تاريخ الإنشاء: {new Date(lesson.created_at).toLocaleDateString('ar-EG')}</p>
                                    <p>آخر تحديث: {new Date(lesson.updated_at).toLocaleDateString('ar-EG')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
