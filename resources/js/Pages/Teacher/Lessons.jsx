import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import { toast } from 'react-hot-toast';

export default function Lessons({ auth, lessons, stats, filter }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [showSharingModal, setShowSharingModal] = useState(false);
    const [showStudentsModal, setShowStudentsModal] = useState(false);
    const [lessonStudents, setLessonStudents] = useState([]);

    const handleDelete = (lesson) => {
        setSelectedLesson(lesson);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (selectedLesson) {
            router.delete(route('lessons.destroy', selectedLesson.id), {
                onSuccess: () => {
                    toast.success('تم حذف الدرس بنجاح');
                    setShowDeleteModal(false);
                    setSelectedLesson(null);
                },
                onError: () => {
                    toast.error('فشل حذف الدرس');
                }
            });
        }
    };

    const handleSharingSettings = (lesson) => {
        setSelectedLesson(lesson);
        setShowSharingModal(true);
    };

    const handleViewStudents = async (lesson) => {
        try {
            const response = await axios.get(route('lessons.students', lesson.id));
            setLessonStudents(response.data);
            setSelectedLesson(lesson);
            setShowStudentsModal(true);
        } catch (error) {
            toast.error('فشل تحميل بيانات الطلاب');
        }
    };

    const getSharingModeLabel = (mode) => {
        const modes = {
            'private': 'خاص',
            'class': 'فصول محددة',
            'course': 'دورة',
            'custom': 'مخصص'
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

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="إدارة الدروس" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">
                                    دروسي
                                </h2>
                                <Link href={route('teacher.lessons.create')}>
                                    <PrimaryButton>
                                        إنشاء درس جديد
                                    </PrimaryButton>
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600">إجمالي الدروس</p>
                                    <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600">دروس منشورة</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.published}</p>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600">دروس مستقلة</p>
                                    <p className="text-2xl font-bold text-purple-600">{stats.standalone}</p>
                                </div>
                                <div className="bg-orange-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600">مرتبطة بدورة</p>
                                    <p className="text-2xl font-bold text-orange-600">{stats.course_attached}</p>
                                </div>
                            </div>

                            <div className="flex gap-2 mb-6">
                                <Link href={route('teacher.lessons.index')}>
                                    <SecondaryButton className={!filter ? 'bg-gray-200' : ''}>
                                        الكل
                                    </SecondaryButton>
                                </Link>
                                <Link href={route('teacher.lessons.index', { filter: 'standalone' })}>
                                    <SecondaryButton className={filter === 'standalone' ? 'bg-gray-200' : ''}>
                                        مستقلة
                                    </SecondaryButton>
                                </Link>
                                <Link href={route('teacher.lessons.index', { filter: 'course' })}>
                                    <SecondaryButton className={filter === 'course' ? 'bg-gray-200' : ''}>
                                        مرتبطة بدورة
                                    </SecondaryButton>
                                </Link>
                                <Link href={route('teacher.lessons.index', { filter: 'published' })}>
                                    <SecondaryButton className={filter === 'published' ? 'bg-gray-200' : ''}>
                                        منشورة
                                    </SecondaryButton>
                                </Link>
                                <Link href={route('teacher.lessons.index', { filter: 'draft' })}>
                                    <SecondaryButton className={filter === 'draft' ? 'bg-gray-200' : ''}>
                                        مسودات
                                    </SecondaryButton>
                                </Link>
                            </div>
                        </div>

                        <div className="p-6">
                            {lessons.data && lessons.data.length > 0 ? (
                                <div className="space-y-4">
                                    {lessons.data.map((lesson) => (
                                        <div
                                            key={lesson.id}
                                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            {lesson.title}
                                                        </h3>
                                                        {lesson.is_published ? (
                                                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                                                منشور
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                                                                مسودة
                                                            </span>
                                                        )}
                                                        {lesson.is_standalone && (
                                                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                                                مستقل
                                                            </span>
                                                        )}
                                                    </div>

                                                    {lesson.description && (
                                                        <p className="text-sm text-gray-600 mb-3">
                                                            {lesson.description.substring(0, 150)}
                                                            {lesson.description.length > 150 && '...'}
                                                        </p>
                                                    )}

                                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                                        <span>
                                                            النوع: <strong>{getContentTypeLabel(lesson.content_type)}</strong>
                                                        </span>
                                                        <span>
                                                            المشاركة: <strong>{getSharingModeLabel(lesson.sharing_mode)}</strong>
                                                        </span>
                                                        {lesson.subject && (
                                                            <span>
                                                                المادة: <strong>{lesson.subject.name_ar || lesson.subject.name}</strong>
                                                            </span>
                                                        )}
                                                        {lesson.duration_minutes && (
                                                            <span>
                                                                المدة: <strong>{lesson.duration_minutes} دقيقة</strong>
                                                            </span>
                                                        )}
                                                        {lesson.course && (
                                                            <span>
                                                                الدورة: <strong>{lesson.course.title}</strong>
                                                            </span>
                                                        )}
                                                        {lesson.classes && lesson.classes.length > 0 && (
                                                            <span>
                                                                الفصول: <strong>{lesson.classes.length}</strong>
                                                            </span>
                                                        )}
                                                        {lesson.progress && lesson.progress.length > 0 && (
                                                            <span>
                                                                الطلاب: <strong>{lesson.progress.length}</strong>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <Link href={route('teacher.lessons.show', lesson.id)}>
                                                        <SecondaryButton className="text-sm">
                                                            عرض
                                                        </SecondaryButton>
                                                    </Link>
                                                    <Link href={route('teacher.lessons.edit', lesson.id)}>
                                                        <SecondaryButton className="text-sm">
                                                            تعديل
                                                        </SecondaryButton>
                                                    </Link>
                                                    <SecondaryButton
                                                        onClick={() => handleSharingSettings(lesson)}
                                                        className="text-sm"
                                                    >
                                                        المشاركة
                                                    </SecondaryButton>
                                                    <SecondaryButton
                                                        onClick={() => handleViewStudents(lesson)}
                                                        className="text-sm"
                                                    >
                                                        الطلاب
                                                    </SecondaryButton>
                                                    <DangerButton
                                                        onClick={() => handleDelete(lesson)}
                                                        className="text-sm"
                                                    >
                                                        حذف
                                                    </DangerButton>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 mb-4">لا توجد دروس بعد</p>
                                    <Link href={route('teacher.lessons.create')}>
                                        <PrimaryButton>
                                            إنشاء درس جديد
                                        </PrimaryButton>
                                    </Link>
                                </div>
                            )}

                            {lessons.links && lessons.links.length > 3 && (
                                <div className="mt-6 flex justify-center gap-2">
                                    {lessons.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url}
                                            className={`px-4 py-2 border rounded ${
                                                link.active
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                            } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        تأكيد حذف الدرس
                    </h2>
                    <p className="text-sm text-gray-600 mb-6">
                        هل أنت متأكد من حذف الدرس "{selectedLesson?.title}"؟ سيتم حذف جميع التقدم المرتبط به.
                    </p>
                    <div className="flex justify-end gap-3">
                        <SecondaryButton onClick={() => setShowDeleteModal(false)}>
                            إلغاء
                        </SecondaryButton>
                        <DangerButton onClick={confirmDelete}>
                            حذف
                        </DangerButton>
                    </div>
                </div>
            </Modal>

            <Modal show={showSharingModal} onClose={() => setShowSharingModal(false)} maxWidth="2xl">
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        إعدادات المشاركة
                    </h2>
                    {selectedLesson && (
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">الدرس: {selectedLesson.title}</p>
                                <p className="text-sm text-gray-600">نمط المشاركة الحالي: <strong>{getSharingModeLabel(selectedLesson.sharing_mode)}</strong></p>
                            </div>

                            <div className="border-t pt-4">
                                <h3 className="text-sm font-medium text-gray-700 mb-3">تغيير إعدادات المشاركة</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    يمكنك تعديل إعدادات المشاركة من خلال صفحة تعديل الدرس
                                </p>
                                <Link href={route('teacher.lessons.edit', selectedLesson.id)}>
                                    <PrimaryButton>
                                        تعديل الدرس
                                    </PrimaryButton>
                                </Link>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">أنماط المشاركة:</h4>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li><strong>خاص:</strong> لا يمكن لأحد الوصول إلى الدرس</li>
                                    <li><strong>فصول محددة:</strong> يمكن للطلاب في الفصول المحددة الوصول</li>
                                    <li><strong>دورة:</strong> يمكن للطلاب المسجلين في الدورة المرتبطة الوصول</li>
                                    <li><strong>مخصص:</strong> فصول محددة مع إمكانية استثناء طلاب معينين</li>
                                </ul>
                            </div>
                        </div>
                    )}
                    <div className="flex justify-end mt-6">
                        <SecondaryButton onClick={() => setShowSharingModal(false)}>
                            إغلاق
                        </SecondaryButton>
                    </div>
                </div>
            </Modal>

            <Modal show={showStudentsModal} onClose={() => setShowStudentsModal(false)} maxWidth="2xl">
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        الطلاب المسموح لهم بالوصول
                    </h2>
                    {lessonStudents.students && lessonStudents.students.length > 0 ? (
                        <>
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="bg-blue-50 p-3 rounded">
                                    <p className="text-sm text-gray-600">إجمالي الطلاب</p>
                                    <p className="text-xl font-bold text-blue-600">{lessonStudents.total}</p>
                                </div>
                                <div className="bg-green-50 p-3 rounded">
                                    <p className="text-sm text-gray-600">يمكنهم الوصول</p>
                                    <p className="text-xl font-bold text-green-600">{lessonStudents.accessible}</p>
                                </div>
                                <div className="bg-red-50 p-3 rounded">
                                    <p className="text-sm text-gray-600">مستثنون</p>
                                    <p className="text-xl font-bold text-red-600">{lessonStudents.excluded}</p>
                                </div>
                            </div>
                            <div className="max-h-96 overflow-y-auto space-y-2">
                                {lessonStudents.students.map((student) => (
                                    <div
                                        key={student.id}
                                        className={`flex justify-between items-center p-3 rounded ${
                                            student.is_excluded ? 'bg-red-50' : 'bg-gray-50'
                                        }`}
                                    >
                                        <div>
                                            <p className="font-medium">{student.name}</p>
                                            <p className="text-sm text-gray-600">{student.class}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {student.progress && (
                                                <span className="text-sm text-gray-600">
                                                    {student.progress.progress_percentage}%
                                                </span>
                                            )}
                                            {student.is_excluded ? (
                                                <span className="text-sm text-red-600 font-medium">مستثنى</span>
                                            ) : (
                                                <span className="text-sm text-green-600 font-medium">يمكنه الوصول</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <p className="text-center text-gray-500 py-8">لا يوجد طلاب</p>
                    )}
                    <div className="flex justify-end mt-6">
                        <SecondaryButton onClick={() => setShowStudentsModal(false)}>
                            إغلاق
                        </SecondaryButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
