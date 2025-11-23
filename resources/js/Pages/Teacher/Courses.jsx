import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    PlusIcon,
    BookOpenIcon,
    PlayIcon,
    DocumentIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    StarIcon,
    UserGroupIcon,
    ClockIcon,
    SparklesIcon,
} from '@heroicons/react/24/outline';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import TextArea from '@/Components/TextArea';
import ImageUpload from '@/Components/ImageUpload';
import toast from "react-hot-toast";
import axios from 'axios';
const CourseCard = ({ course, onEdit, onDelete, onView, onTogglePublish, onToggleFree }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300"
    >
        <div className="relative h-48 bg-gradient-to-r from-blue-500 to-cyan-600">
            {course.image_url ? (
                <img
                    src={course.image_url}
                    alt={course.title_ar}
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="flex items-center justify-center h-full">
                    <BookOpenIcon className="w-16 h-16 text-white opacity-50" />
                </div>
            )}
            <div className="absolute top-4 right-4">
                <button
                    onClick={() => onTogglePublish(course)}
                    className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all hover:scale-105 ${
                        course.is_published
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    }`}
                    title="انقر لتغيير حالة النشر"
                >
                    {course.is_published ? 'منشور' : 'مسودة'}
                </button>
            </div>
            <div className="absolute top-4 left-4">
                <button
                    onClick={() => onToggleFree(course)}
                    className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all hover:scale-105 ${
                        course.is_free
                            ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                    }`}
                    title="انقر لتغيير حالة المجانية"
                >
                    {course.is_free ? 'مجاني' : `${course.price}دج`}
                </button>
            </div>
        </div>

        <div className="p-6">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{course.title_ar}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{course.description_ar}</p>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse mr-4">
                    <button
                        onClick={() => onView(course)}
                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                        <EyeIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => onEdit(course)}
                        className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                    >
                        <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => onDelete(course)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {course.subjects && course.subjects.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {course.subjects.map(subject => (
                        <span key={subject.id} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {subject.name_ar}
                        </span>
                    ))}
                </div>
            )}

            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                    <ClockIcon className="w-4 h-4 ml-1" />
                    <span>{course.duration_hours} ساعة</span>
                </div>
                <div className="flex items-center">
                    <DocumentIcon className="w-4 h-4 ml-1" />
                    <span>{course.lesson_count || 0} درس</span>
                </div>
                <div className="flex items-center">
                    <UserGroupIcon className="w-4 h-4 ml-1" />
                    <span>{course.enrollment_count || 0} طالب</span>
                </div>
            </div>

            <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
                <div className="flex items-center">
                    <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <StarIcon
                                key={star}
                                className={`w-4 h-4 ${
                                    star <= (course.average_rating || 0)
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                }`}
                            />
                        ))}
                    </div>
                    <span className="text-sm text-gray-500 mr-2 rtl:ml-2">
                        ({course.total_reviews || 0})
                    </span>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                    course.difficulty_level === 'beginner'
                        ? 'bg-green-100 text-green-800'
                        : course.difficulty_level === 'intermediate'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                }`}>
                    {course.difficulty_level === 'beginner' ? 'مبتدئ' :
                        course.difficulty_level === 'intermediate' ? 'متوسط' : 'متقدم'}
                </span>
            </div>
        </div>
    </motion.div>
);

export default function Courses({ auth, courses = [], classes = [], subjects = [] }) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showLessonsModal, setShowLessonsModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [availableLessons, setAvailableLessons] = useState([]);
    const [selectedLessons, setSelectedLessons] = useState([]);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        title: '',
        title_ar: '',
        description: '',
        description_ar: '',
        class_ids: [],
        subject_ids: [],
        difficulty_level: 'beginner',
        duration_hours: 1,
        price: 0,
        learning_objectives: [''],
        prerequisites: [''],
        enrollment_conditions: '',
        enrollment_conditions_ar: '',
        requires_approval: true,
        enrollment_fee: 0,
        is_published: false,
        is_free: true,
        image: null,
    });

    const handleCreate = (e) => {
        e.preventDefault();

        if (!data.subject_ids || data.subject_ids.length === 0) {
            toast.error('يرجى تحديد موضوع واحد على الأقل');
            return;
        }

        post(route('teacher.courses.store'), {
            onSuccess: () => {
                setShowCreateModal(false);
                reset();
                toast.success('تم إنشاء الكورس بنجاح');
            },
            onError: (errors) => {
                console.error('Create errors:', errors);
                toast.error('فشل في إنشاء الكورس');
            }
        });
    };

    const handleEdit = (course) => {
        setSelectedCourse(course);
        setData({
            title: course.title || '',
            title_ar: course.title_ar || '',
            description: course.description || '',
            description_ar: course.description_ar || '',
            class_ids: course.classes?.map(c => c.id) || [],
            subject_ids: course.subjects?.map(s => s.id) || [],
            difficulty_level: course.difficulty_level || 'beginner',
            duration_hours: course.duration_hours || 1,
            price: course.price || 0,
            learning_objectives: course.learning_objectives || [''],
            prerequisites: course.prerequisites || [''],
            enrollment_conditions: course.enrollment_conditions || '',
            enrollment_conditions_ar: course.enrollment_conditions_ar || '',
            requires_approval: course.requires_approval ?? true,
            enrollment_fee: course.enrollment_fee || 0,
            is_published: course.is_published || false,
            is_free: course.is_free || true,
            image: null,
        });
        setShowEditModal(true);
    };

    const handleUpdate = (e) => {
        e.preventDefault();

        post(route('teacher.courses.update', selectedCourse.id), {
            _method: 'put',
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setShowEditModal(false);
                reset();
                setSelectedCourse(null);
                toast.success('تم تحديث الكورس بنجاح');
            },
            onError: (errors) => {
                console.error('Update errors:', errors);
                toast.error('فشل تحديث الكورس');
            }
        });
    };

    const handleView = (course) => {
        setSelectedCourse(course);
        setShowViewModal(true);
    };

    const handleDelete = (course) => {
        if (confirm('هل أنت متأكد من حذف هذا الكورس؟')) {
            router.delete(route('teacher.courses.destroy', course.id));
        }
    };

    const addObjective = () => {
        setData('learning_objectives', [...data.learning_objectives, '']);
    };

    const removeObjective = (index) => {
        const newObjectives = data.learning_objectives.filter((_, i) => i !== index);
        setData('learning_objectives', newObjectives);
    };

    const updateObjective = (index, value) => {
        const newObjectives = [...data.learning_objectives];
        newObjectives[index] = value;
        setData('learning_objectives', newObjectives);
    };

    const toggleClass = (classId) => {
        const newClassIds = data.class_ids.includes(classId)
            ? data.class_ids.filter(id => id !== classId)
            : [...data.class_ids, classId];
        setData('class_ids', newClassIds);
    };

    const toggleSubject = (subjectId) => {
        const newSubjectIds = data.subject_ids.includes(subjectId)
            ? data.subject_ids.filter(id => id !== subjectId)
            : [...data.subject_ids, subjectId];
        setData('subject_ids', newSubjectIds);
    };

    const handleTogglePublish = async (course) => {
        try {
            const response = await axios.post(route('teacher.courses.toggle-publish', course.id));
            toast.success(response.data.message);
            router.reload({ only: ['courses'] });
        } catch (error) {
            toast.error('فشل تغيير حالة النشر');
        }
    };

    const handleToggleFree = async (course) => {
        try {
            const response = await axios.post(route('teacher.courses.toggle-free', course.id));
            toast.success(response.data.message);
            router.reload({ only: ['courses'] });
        } catch (error) {
            toast.error('فشل تغيير حالة المجانية');
        }
    };

    const handleManageLessons = async (course) => {
        setSelectedCourse(course);
        try {
            const response = await axios.get(route('teacher.courses.available-lessons', course.id));
            setAvailableLessons(response.data.lessons);
            setShowLessonsModal(true);
        } catch (error) {
            toast.error('فشل تحميل الدروس المتاحة');
        }
    };

    const handleAttachLessons = () => {
        if (selectedLessons.length === 0) {
            toast.error('يرجى اختيار درس واحد على الأقل');
            return;
        }

        router.post(route('teacher.courses.attach-lessons', selectedCourse.id), {
            lesson_ids: selectedLessons
        }, {
            onSuccess: () => {
                setShowLessonsModal(false);
                setSelectedLessons([]);
                toast.success('تم إضافة الدروس بنجاح');
            },
            onError: () => {
                toast.error('فشل إضافة الدروس');
            }
        });
    };

    const handleDetachLesson = (lessonId) => {
        if (confirm('هل أنت متأكد من فصل هذا الدرس من الكورس؟')) {
            router.delete(route('teacher.courses.detach-lesson', [selectedCourse.id, lessonId]), {
                onSuccess: () => {
                    toast.success('تم فصل الدرس بنجاح');
                },
                onError: () => {
                    toast.error('فشل فصل الدرس');
                }
            });
        }
    };

    const toggleLessonSelection = (lessonId) => {
        setSelectedLessons(prev =>
            prev.includes(lessonId)
                ? prev.filter(id => id !== lessonId)
                : [...prev, lessonId]
        );
    };

    const handleGenerateCourseInfo = async () => {
        if (!data.title_ar || data.title_ar.trim() === '') {
            toast.error('يرجى إدخال عنوان الكورس أولاً');
            return;
        }

        setIsGeneratingAI(true);

        try {
            const response = await axios.post(route('chat.generate-course-info'), {
                title: data.title_ar || data.title,
            });

            if (response.data.success) {
                const aiData = response.data.data;

                setData({
                    ...data,
                    title: aiData.title || data.title,
                    title_ar: aiData.title_ar || data.title_ar,
                    description: aiData.description || data.description,
                    description_ar: aiData.description_ar || data.description_ar,
                    difficulty_level: aiData.difficulty_level || data.difficulty_level,
                    duration_hours: aiData.duration_hours || data.duration_hours,
                    learning_objectives: aiData.learning_objectives && aiData.learning_objectives.length > 0
                        ? aiData.learning_objectives
                        : data.learning_objectives,
                    prerequisites: aiData.prerequisites && aiData.prerequisites.length > 0
                        ? aiData.prerequisites
                        : data.prerequisites,
                    enrollment_conditions: aiData.enrollment_conditions || data.enrollment_conditions,
                    enrollment_conditions_ar: aiData.enrollment_conditions_ar || data.enrollment_conditions_ar,
                });

                toast.success('تم إنشاء معلومات الكورس بنجاح باستخدام الذكاء الاصطناعي');
            } else {
                let errorMessage = response.data.error || 'فشل في إنشاء معلومات الكورس';

                if (response.status === 503) {
                    errorMessage = 'خدمة الذكاء الاصطناعي غير متاحة حالياً. يرجى التأكد من أن الخدمة الخارجية تعمل.';
                } else if (response.status === 422) {
                    errorMessage = 'فشل في تحليل الرد. تأكد من إدخال عنوان واضح ومحدد للكورس.';
                }

                toast.error(errorMessage);
                console.error('AI generation error:', response.data);
            }
        } catch (error) {
            console.error('AI generation error:', error);

            let errorMessage = 'حدث خطأ أثناء إنشاء معلومات الكورس';

            if (error.response) {
                if (error.response.status === 503) {
                    errorMessage = 'خدمة الذكاء الاصطناعي غير متاحة. تأكد من:\n• أن خادم API يعمل على http://localhost:5000\n• أن البوت مصرح به\n• أن الاتصال بالإنترنت مستقر';
                } else if (error.response.status === 403) {
                    errorMessage = 'لم يتم العثور على ملف المعلم. يرجى تكملة بيانات الملف أولاً.';
                } else if (error.response.status === 404) {
                    errorMessage = 'المحادثة غير موجودة. يرجى إعادة المحاولة.';
                } else if (error.response.data && error.response.data.error) {
                    errorMessage = error.response.data.error;
                }
            } else if (error.message === 'Network Error') {
                errorMessage = 'خطأ في الشبكة. تأكد من الاتصال بالإنترنت والخادم.';
            }

            toast.error(errorMessage);
        } finally {
            setIsGeneratingAI(false);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">إدارة الكورسات</h2>
                    <PrimaryButton onClick={() => setShowCreateModal(true)}>
                        <PlusIcon className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                        إنشاء كورس جديد
                    </PrimaryButton>
                </div>
            }
        >
            <Head title="إدارة الكورسات" />

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white"
                    >
                        <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
                            <div>
                                <p className="text-blue-100">إجمالي الكورسات</p>
                                <p className="text-3xl font-bold">{courses.length}</p>
                            </div>
                            <BookOpenIcon className="w-12 h-12 text-blue-200" />
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
                                <p className="text-green-100">الكورسات المنشورة</p>
                                <p className="text-3xl font-bold">{courses.filter(c => c.is_published).length}</p>
                            </div>
                            <PlayIcon className="w-12 h-12 text-green-200" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white"
                    >
                        <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
                            <div>
                                <p className="text-orange-100">إجمالي الطلاب</p>
                                <p className="text-3xl font-bold">{courses.reduce((sum, c) => sum + (c.enrollment_count || 0), 0)}</p>
                            </div>
                            <UserGroupIcon className="w-12 h-12 text-orange-200" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-xl p-6 text-white"
                    >
                        <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
                            <div>
                                <p className="text-cyan-100">متوسط التقييم</p>
                                <p className="text-3xl font-bold">4.5</p>
                            </div>
                            <StarIcon className="w-12 h-12 text-cyan-200" />
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course, index) => (
                        <CourseCard
                            key={course.id}
                            course={course}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onView={handleView}
                            onTogglePublish={handleTogglePublish}
                            onToggleFree={handleToggleFree}
                        />
                    ))}
                </div>

                {courses.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                    >
                        <BookOpenIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد كورسات</h3>
                        <p className="text-gray-500 mb-6">ابدأ بإنشاء كورس جديد لطلابك</p>
                        <PrimaryButton onClick={() => setShowCreateModal(true)}>
                            إنشاء كورس جديد
                        </PrimaryButton>
                    </motion.div>
                )}
            </div>

            <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)} maxWidth="4xl">
                <div className="flex flex-col max-h-[90vh]">
                    {/* Fixed Header */}
                    <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
                        <h2 className="text-lg font-medium text-gray-900">إنشاء كورس جديد</h2>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto">
                        <form id="create-course-form" onSubmit={handleCreate} className="p-6" encType="multipart/form-data">
                            <div className="space-y-6">
                                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4 mb-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
                                                <SparklesIcon className="w-5 h-5 ml-2 text-blue-600" />
                                                مساعد الذكاء الاصطناعي
                                            </h3>
                                            <p className="text-xs text-blue-700 mb-3">
                                                أدخل عنوان الكورس واضغط على الزر لإنشاء معلومات الكورس تلقائياً باستخدام الذكاء الاصطناعي
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleGenerateCourseInfo}
                                            disabled={isGeneratingAI || !data.title_ar}
                                            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                        >
                                            {isGeneratingAI ? (
                                                <>
                                                    <svg className="animate-spin h-4 w-4 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    جاري الإنشاء...
                                                </>
                                            ) : (
                                                <>
                                                    <SparklesIcon className="w-4 h-4 ml-2" />
                                                    إنشاء بالذكاء الاصطناعي
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="title_ar" value="عنوان الكورس (عربي)" />
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
                                        <InputLabel htmlFor="title" value="عنوان الكورس (إنجليزي)" />
                                        <TextInput
                                            id="title"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            className="mt-1 block w-full"
                                            required
                                        />
                                        <InputError message={errors.title} className="mt-2" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="description_ar" value="وصف الكورس (عربي)" />
                                        <TextArea
                                            id="description_ar"
                                            value={data.description_ar}
                                            onChange={(e) => setData('description_ar', e.target.value)}
                                            className="mt-1 block w-full"
                                            rows="3"
                                            required
                                        />
                                        <InputError message={errors.description_ar} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="description" value="وصف الكورس (إنجليزي)" />
                                        <TextArea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            className="mt-1 block w-full"
                                            rows="3"
                                            required
                                        />
                                        <InputError message={errors.description} className="mt-2" />
                                    </div>
                                </div>

                                <div>
                                    <InputLabel value="صورة الكورس" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setData('image', e.target.files[0])}
                                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                    <InputError message={errors.image} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel value="الفصول الدراسية" />
                                    <div className="mt-2 grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-md">
                                        {classes && classes.map(classItem => (
                                            <label key={classItem.id} className="flex items-center space-x-2 rtl:space-x-reverse p-2 border rounded hover:bg-gray-50">
                                                <input
                                                    type="checkbox"
                                                    checked={data.class_ids.includes(classItem.id)}
                                                    onChange={() => toggleClass(classItem.id)}
                                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                                                />
                                                <span className="text-sm">{classItem.name_ar}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <InputError message={errors.class_ids} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel value="المواد الدراسية" />
                                    <div className="mt-2 grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-md">
                                        {subjects && subjects.map(subject => (
                                            <label key={subject.id} className="flex items-center space-x-2 rtl:space-x-reverse p-2 border rounded hover:bg-gray-50">
                                                <input
                                                    type="checkbox"
                                                    checked={data.subject_ids.includes(subject.id)}
                                                    onChange={() => toggleSubject(subject.id)}
                                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                                                />
                                                <span className="text-sm">{subject.name_ar}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <InputError message={errors.subject_ids} className="mt-2" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <InputLabel htmlFor="difficulty_level" value="مستوى الصعوبة" />
                                        <select
                                            id="difficulty_level"
                                            value={data.difficulty_level}
                                            onChange={(e) => setData('difficulty_level', e.target.value)}
                                            className="mt-1 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                                            required
                                        >
                                            <option value="beginner">مبتدئ</option>
                                            <option value="intermediate">متوسط</option>
                                            <option value="advanced">متقدم</option>
                                        </select>
                                        <InputError message={errors.difficulty_level} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="duration_hours" value="مدة الكورس (ساعة)" />
                                        <TextInput
                                            id="duration_hours"
                                            type="number"
                                            value={data.duration_hours}
                                            onChange={(e) => setData('duration_hours', e.target.value)}
                                            className="mt-1 block w-full"
                                            min="1"
                                            required
                                        />
                                        <InputError message={errors.duration_hours} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="price" value="السعر (ر.س)" />
                                        <TextInput
                                            id="price"
                                            type="number"
                                            value={data.price}
                                            onChange={(e) => setData('price', e.target.value)}
                                            className="mt-1 block w-full"
                                            min="0"
                                            step="0.01"
                                            disabled={data.is_free}
                                        />
                                        <InputError message={errors.price} className="mt-2" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="is_free"
                                            checked={data.is_free}
                                            onChange={(e) => setData('is_free', e.target.checked)}
                                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                                        />
                                        <label htmlFor="is_free" className="mr-2 text-sm text-gray-700">
                                            كورس مجاني
                                        </label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="is_published"
                                            checked={data.is_published}
                                            onChange={(e) => setData('is_published', e.target.checked)}
                                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                                        />
                                        <label htmlFor="is_published" className="mr-2 text-sm text-gray-700">
                                            نشر الكورس
                                        </label>
                                    </div>
                                </div>

                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">شروط التسجيل</h3>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <InputLabel htmlFor="enrollment_conditions_ar" value="شروط التسجيل (عربي)" />
                                                <TextArea
                                                    id="enrollment_conditions_ar"
                                                    value={data.enrollment_conditions_ar}
                                                    onChange={(e) => setData('enrollment_conditions_ar', e.target.value)}
                                                    className="mt-1 block w-full"
                                                    rows="4"
                                                    placeholder="أدخل شروط وأحكام التسجيل في الكورس..."
                                                />
                                                <InputError message={errors.enrollment_conditions_ar} className="mt-2" />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="enrollment_conditions" value="شروط التسجيل (إنجليزي)" />
                                                <TextArea
                                                    id="enrollment_conditions"
                                                    value={data.enrollment_conditions}
                                                    onChange={(e) => setData('enrollment_conditions', e.target.value)}
                                                    className="mt-1 block w-full"
                                                    rows="4"
                                                    placeholder="Enter course enrollment terms and conditions..."
                                                />
                                                <InputError message={errors.enrollment_conditions} className="mt-2" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <InputLabel htmlFor="enrollment_fee" value="رسوم التسجيل (دج)" />
                                                <TextInput
                                                    id="enrollment_fee"
                                                    type="number"
                                                    value={data.enrollment_fee}
                                                    onChange={(e) => setData('enrollment_fee', e.target.value)}
                                                    className="mt-1 block w-full"
                                                    min="0"
                                                    step="0.01"
                                                />
                                                <InputError message={errors.enrollment_fee} className="mt-2" />
                                                <p className="text-xs text-gray-500 mt-1">رسوم التسجيل مستقلة عن كون الكورس مجاني أو مدفوع</p>
                                            </div>

                                            <div className="flex items-start">
                                                <div className="flex items-center h-10">
                                                    <input
                                                        type="checkbox"
                                                        id="requires_approval"
                                                        checked={data.requires_approval}
                                                        onChange={(e) => setData('requires_approval', e.target.checked)}
                                                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                                                    />
                                                    <label htmlFor="requires_approval" className="mr-2 text-sm text-gray-700">
                                                        يتطلب موافقة المعلم
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <InputLabel value="أهداف التعلم" />
                                    <div className="space-y-2 mt-2">
                                        {data.learning_objectives.map((objective, index) => (
                                            <div key={index} className="flex items-center space-x-2 rtl:space-x-reverse">
                                                <TextInput
                                                    value={objective}
                                                    onChange={(e) => updateObjective(index, e.target.value)}
                                                    className="flex-1"
                                                    placeholder="أدخل هدف التعلم"
                                                />
                                                {data.learning_objectives.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeObjective(index)}
                                                        className="text-red-600 hover:text-red-800 p-1"
                                                    >
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addObjective}
                                        className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                                    >
                                        + إضافة هدف
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                    {/* Fixed Footer */}
                    <div className="flex-shrink-0 bg-gray-50 px-6 py-4 border-t border-gray-200">
                        <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse">
                            <SecondaryButton onClick={() => setShowCreateModal(false)}>
                                إلغاء
                            </SecondaryButton>
                            <PrimaryButton type="submit"
                                           form="create-course-form"
                                           disabled={processing}
                            >
                                {processing ? 'جاري الحفظ...' : 'حفظ'}
                            </PrimaryButton>
                        </div>
                    </div>
                </div>
            </Modal>

            <Modal show={showEditModal} onClose={() => setShowEditModal(false)} maxWidth="4xl">
                <div className="flex flex-col max-h-[90vh]">
                    {/* Fixed Header */}
                    <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
                        <h2 className="text-lg font-medium text-gray-900">تعديل الكورس</h2>
                    </div>
                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto">
                        <form id="edit-course-form" onSubmit={handleUpdate} className="p-6"
                              encType="multipart/form-data">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <InputLabel htmlFor="edit_title_ar" value="عنوان الكورس (عربي)"/>
                                    <TextInput
                                        id="edit_title_ar"
                                        value={data.title_ar}
                                        onChange={(e) => setData('title_ar', e.target.value)}
                                        className="mt-1 block w-full"
                                        required
                                    />
                                    <InputError message={errors.title_ar} className="mt-2"/>
                                </div>

                                <div>
                                    <InputLabel htmlFor="edit_title" value="عنوان الكورس (إنجليزي)"/>
                                    <TextInput
                                        id="edit_title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="mt-1 block w-full"
                                        required
                                    />
                                    <InputError message={errors.title} className="mt-2"/>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <InputLabel htmlFor="edit_description_ar" value="وصف الكورس (عربي)"/>
                                    <TextArea
                                        id="edit_description_ar"
                                        value={data.description_ar}
                                        onChange={(e) => setData('description_ar', e.target.value)}
                                        className="mt-1 block w-full"
                                        rows="3"
                                        required
                                    />
                                    <InputError message={errors.description_ar} className="mt-2"/>
                                </div>

                                <div>
                                    <InputLabel htmlFor="edit_description" value="وصف الكورس (إنجليزي)"/>
                                    <TextArea
                                        id="edit_description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="mt-1 block w-full"
                                        rows="3"
                                        required
                                    />
                                    <InputError message={errors.description} className="mt-2"/>
                                </div>
                            </div>

                            <div className="mb-4">
                                <InputLabel value="صورة الكورس"/>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('image', e.target.files[0])}
                                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                <InputError message={errors.image} className="mt-2"/>
                            </div>

                            <div className="mb-4">
                                <InputLabel value="الفصول الدراسية"/>
                                <div
                                    className="mt-2 grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-md">
                                    {classes && classes.map(classItem => (
                                        <label key={classItem.id}
                                               className="flex items-center space-x-2 rtl:space-x-reverse p-2 border rounded hover:bg-gray-50">
                                            <input
                                                type="checkbox"
                                                checked={data.class_ids.includes(classItem.id)}
                                                onChange={() => toggleClass(classItem.id)}
                                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                                            />
                                            <span className="text-sm">{classItem.name_ar}</span>
                                        </label>
                                    ))}
                                </div>
                                <InputError message={errors.class_ids} className="mt-2"/>
                            </div>

                            <div className="mb-4">
                                <InputLabel value="المواد الدراسية"/>
                                <div
                                    className="mt-2 grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-md">
                                    {subjects && subjects.map(subject => (
                                        <label key={subject.id}
                                               className="flex items-center space-x-2 rtl:space-x-reverse p-2 border rounded hover:bg-gray-50">
                                            <input
                                                type="checkbox"
                                                checked={data.subject_ids.includes(subject.id)}
                                                onChange={() => toggleSubject(subject.id)}
                                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                                            />
                                            <span className="text-sm">{subject.name_ar}</span>
                                        </label>
                                    ))}
                                </div>
                                <InputError message={errors.subject_ids} className="mt-2"/>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <InputLabel htmlFor="edit_difficulty_level" value="مستوى الصعوبة"/>
                                    <select
                                        id="edit_difficulty_level"
                                        value={data.difficulty_level}
                                        onChange={(e) => setData('difficulty_level', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                                        required
                                    >
                                        <option value="beginner">مبتدئ</option>
                                        <option value="intermediate">متوسط</option>
                                        <option value="advanced">متقدم</option>
                                    </select>
                                    <InputError message={errors.difficulty_level} className="mt-2"/>
                                </div>

                                <div>
                                    <InputLabel htmlFor="edit_duration_hours" value="مدة الكورس (ساعة)"/>
                                    <TextInput
                                        id="edit_duration_hours"
                                        type="number"
                                        value={data.duration_hours}
                                        onChange={(e) => setData('duration_hours', e.target.value)}
                                        className="mt-1 block w-full"
                                        min="1"
                                        required
                                    />
                                    <InputError message={errors.duration_hours} className="mt-2"/>
                                </div>

                                <div>
                                    <InputLabel htmlFor="edit_price" value="السعر (ر.س)"/>
                                    <TextInput
                                        id="edit_price"
                                        type="number"
                                        value={data.price}
                                        onChange={(e) => setData('price', e.target.value)}
                                        className="mt-1 block w-full"
                                        min="0"
                                        step="0.01"
                                        disabled={data.is_free}
                                    />
                                    <InputError message={errors.price} className="mt-2"/>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="edit_is_free"
                                        checked={data.is_free}
                                        onChange={(e) => setData('is_free', e.target.checked)}
                                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                                    />
                                    <label htmlFor="edit_is_free" className="mr-2 text-sm text-gray-700">
                                        كورس مجاني
                                    </label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="edit_is_published"
                                        checked={data.is_published}
                                        onChange={(e) => setData('is_published', e.target.checked)}
                                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                                    />
                                    <label htmlFor="edit_is_published" className="mr-2 text-sm text-gray-700">
                                        نشر الكورس
                                    </label>
                                </div>
                            </div>

                            <div className="border-t pt-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">شروط التسجيل</h3>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <InputLabel htmlFor="enrollment_conditions_ar" value="شروط التسجيل (عربي)"/>
                                            <TextArea
                                                id="enrollment_conditions_ar"
                                                value={data.enrollment_conditions_ar}
                                                onChange={(e) => setData('enrollment_conditions_ar', e.target.value)}
                                                className="mt-1 block w-full"
                                                rows="4"
                                                placeholder="أدخل شروط وأحكام التسجيل في الكورس..."
                                            />
                                            <InputError message={errors.enrollment_conditions_ar} className="mt-2"/>
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="enrollment_conditions" value="شروط التسجيل (إنجليزي)"/>
                                            <TextArea
                                                id="enrollment_conditions"
                                                value={data.enrollment_conditions}
                                                onChange={(e) => setData('enrollment_conditions', e.target.value)}
                                                className="mt-1 block w-full"
                                                rows="4"
                                                placeholder="Enter course enrollment terms and conditions..."
                                            />
                                            <InputError message={errors.enrollment_conditions} className="mt-2"/>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <InputLabel htmlFor="enrollment_fee" value="رسوم التسجيل (دج)"/>
                                            <TextInput
                                                id="enrollment_fee"
                                                type="number"
                                                value={data.enrollment_fee}
                                                onChange={(e) => setData('enrollment_fee', e.target.value)}
                                                className="mt-1 block w-full"
                                                min="0"
                                                step="0.01"
                                            />
                                            <InputError message={errors.enrollment_fee} className="mt-2"/>
                                            <p className="text-xs text-gray-500 mt-1">رسوم التسجيل مستقلة عن كون الكورس مجاني أو مدفوع</p>
                                        </div>

                                        <div className="flex items-start">
                                            <div className="flex items-center h-10">
                                                <input
                                                    type="checkbox"
                                                    id="requires_approval"
                                                    checked={data.requires_approval}
                                                    onChange={(e) => setData('requires_approval', e.target.checked)}
                                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                                                />
                                                <label htmlFor="requires_approval"
                                                       className="mr-2 text-sm text-gray-700">
                                                    يتطلب موافقة المعلم
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <InputLabel value="أهداف التعلم"/>
                                {data.learning_objectives.map((objective, index) => (
                                    <div key={index} className="flex items-center space-x-2 rtl:space-x-reverse mt-2">
                                        <TextInput
                                            value={objective}
                                            onChange={(e) => updateObjective(index, e.target.value)}
                                            className="flex-1"
                                            placeholder="أدخل هدف التعلم"
                                        />
                                        {data.learning_objectives.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeObjective(index)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <TrashIcon className="w-5 h-5"/>
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addObjective}
                                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                                >
                                    + إضافة هدف
                                </button>
                            </div>

                        </form>
                    </div>
                    <div className="flex-shrink-0 bg-gray-50 px-6 py-4 border-t border-gray-200">
                        <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse">
                            <SecondaryButton onClick={() => setShowEditModal(false)}>
                                إلغاء
                            </SecondaryButton>
                            <PrimaryButton type="submit"
                                           form="edit-course-form"
                                           disabled={processing}
                            >
                                {processing ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                            </PrimaryButton>
                        </div>
                    </div>
                </div>
            </Modal>

            <Modal show={showViewModal} onClose={() => setShowViewModal(false)} maxWidth="2xl">
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">تفاصيل الكورس</h2>

                    {selectedCourse && (
                        <div className="space-y-6">
                            <div className="flex items-start space-x-4 rtl:space-x-reverse">
                                <div
                                    className="w-24 h-24 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                                    <BookOpenIcon className="w-12 h-12 text-white"/>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedCourse.title_ar}</h3>
                                    <p className="text-gray-600 mb-4">{selectedCourse.description_ar}</p>
                                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            selectedCourse.is_published
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {selectedCourse.is_published ? 'منشور' : 'مسودة'}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            selectedCourse.is_free
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-orange-100 text-orange-800'
                                        }`}>
                                            {selectedCourse.is_free ? 'مجاني' : `${selectedCourse.price}دج`}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">المواد</label>
                                    <div className="mt-1 flex flex-wrap gap-2">
                                        {selectedCourse.subjects?.map(subject => (
                                            <span key={subject.id}
                                                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                                                {subject.name_ar}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">مستوى الصعوبة</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {selectedCourse.difficulty_level === 'beginner' ? 'مبتدئ' :
                                            selectedCourse.difficulty_level === 'intermediate' ? 'متوسط' : 'متقدم'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">مدة الكورس</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedCourse.duration_hours} ساعة</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">عدد الدروس</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedCourse.lesson_count || 0} درس</p>
                                </div>
                            </div>

                            {selectedCourse.learning_objectives && selectedCourse.learning_objectives.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">أهداف التعلم</label>
                                    <ul className="list-disc list-inside space-y-1">
                                        {selectedCourse.learning_objectives.map((objective, index) => (
                                            <li key={index} className="text-sm text-gray-900">{objective}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {selectedCourse.lessons && selectedCourse.lessons.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="block text-sm font-medium text-gray-700">الدروس المرتبطة</label>
                                        <span className="text-sm text-gray-500">({selectedCourse.lessons.length} درس)</span>
                                    </div>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {selectedCourse.lessons.map((lesson) => (
                                            <div key={lesson.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-sm">{lesson.title_ar || lesson.title}</p>
                                                    {lesson.subject && (
                                                        <p className="text-xs text-gray-500">{lesson.subject.name_ar}</p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleDetachLesson(lesson.id)}
                                                    className="text-red-600 hover:text-red-800 text-sm"
                                                >
                                                    فصل
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between">
                                <PrimaryButton onClick={() => handleManageLessons(selectedCourse)}>
                                    إضافة دروس
                                </PrimaryButton>
                                <SecondaryButton onClick={() => setShowViewModal(false)}>
                                    إغلاق
                                </SecondaryButton>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>

            <Modal show={showLessonsModal} onClose={() => setShowLessonsModal(false)} maxWidth="2xl">
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">إضافة دروس إلى الكورس</h2>

                    {availableLessons.length > 0 ? (
                        <>
                            <p className="text-sm text-gray-600 mb-4">
                                اختر الدروس التي تريد إضافتها (الدروس المتاحة هي الدروس المستقلة التي لها نفس مواد الكورس)
                            </p>
                            <div className="space-y-2 max-h-96 overflow-y-auto mb-6">
                                {availableLessons.map((lesson) => (
                                    <label
                                        key={lesson.id}
                                        className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedLessons.includes(lesson.id)}
                                            onChange={() => toggleLessonSelection(lesson.id)}
                                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                                        />
                                        <div className="mr-3 flex-1">
                                            <p className="font-medium text-sm">{lesson.title_ar || lesson.title}</p>
                                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                                {lesson.subject && <span>المادة: {lesson.subject.name_ar}</span>}
                                                {lesson.duration_minutes && <span>المدة: {lesson.duration_minutes} دقيقة</span>}
                                                <span>النوع: {lesson.content_type}</span>
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            <div className="flex justify-end gap-3">
                                <SecondaryButton onClick={() => setShowLessonsModal(false)}>
                                    إلغاء
                                </SecondaryButton>
                                <PrimaryButton
                                    onClick={handleAttachLessons}
                                    disabled={selectedLessons.length === 0}
                                >
                                    إضافة ({selectedLessons.length})
                                </PrimaryButton>
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="text-center text-gray-500 py-8">
                                لا توجد دروس متاحة للإضافة. تأكد من وجود دروس مستقلة منشورة بنفس مواد الكورس.
                            </p>
                            <div className="flex justify-end">
                                <SecondaryButton onClick={() => setShowLessonsModal(false)}>
                                    إغلاق
                                </SecondaryButton>
                            </div>
                        </>
                    )}
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
