import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextArea from '@/Components/TextArea';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import {
    BookOpenIcon,
    ClockIcon,
    StarIcon,
    UserGroupIcon,
    PlayCircleIcon,
    CheckCircleIcon,
    MagnifyingGlassIcon,
    PaperAirplaneIcon,
    BanknotesIcon,
} from '@heroicons/react/24/outline';

const CourseCard = ({ course, enrolledCourseIds, enrollmentRequests, onEnrollClick }) => {
    const isEnrolled = enrolledCourseIds.includes(course.id);
    const progress = course.progress_percentage || 0;
    const hasRequest = enrollmentRequests?.some(req => req.course_id === course.id);
    const pendingRequest = enrollmentRequests?.find(
        req => req.course_id === course.id && req.status === 'pending'
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
        >
            <div className="relative h-48 bg-gradient-to-r from-blue-500 to-cyan-600">
                {course.thumbnail ? (
                    <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <BookOpenIcon className="w-16 h-16 text-white opacity-50" />
                    </div>
                )}
                {isEnrolled && (
                    <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-medium">
                            مسجل
                        </span>
                    </div>
                )}
                {course.is_free ? (
                    <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-xs font-medium">
                            مجاني
                        </span>
                    </div>
                ) : (
                    <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-yellow-500 text-white rounded-full text-xs font-medium">
                            {course.price}دج
                        </span>
                    </div>
                )}
            </div>

            <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>

                {isEnrolled && progress > 0 && (
                    <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-600">التقدم</span>
                            <span className="font-medium text-blue-600">{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-cyan-600 h-2 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                        <ClockIcon className="w-4 h-4 ml-1" />
                        <span>{course.duration_hours} ساعة</span>
                    </div>
                    <div className="flex items-center">
                        <PlayCircleIcon className="w-4 h-4 ml-1" />
                        <span>{course.lessons_count || 0} درس</span>
                    </div>
                    <div className="flex items-center">
                        <UserGroupIcon className="w-4 h-4 ml-1" />
                        <span>{course.students_count || 0}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <StarIcon
                                key={star}
                                className={`w-4 h-4 ${
                                    star <= (course.rating || 0)
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                }`}
                            />
                        ))}
                        <span className="text-sm text-gray-500 mr-2 rtl:ml-2">
                            ({course.reviews_count || 0})
                        </span>
                    </div>
                    <span className="text-xs text-gray-600">
                        {course.teacher ? course.teacher.user.name : 'معلم'}
                    </span>
                </div>

                {isEnrolled ? (
                    <Link
                        href={`/student/courses/${course.id}/lessons`}
                        className="block w-full text-center px-4 py-2 rounded-lg font-medium transition-all bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700"
                    >
                        متابعة الدراسة
                    </Link>
                ) : pendingRequest ? (
                    <button
                        disabled
                        className="w-full px-4 py-2 rounded-lg font-medium bg-yellow-100 text-yellow-800 cursor-not-allowed flex items-center justify-center space-x-2 rtl:space-x-reverse"
                    >
                        <PaperAirplaneIcon className="w-4 h-4" />
                        <span>قيد الانتظار</span>
                    </button>
                ) : (
                    <button
                        onClick={() => onEnrollClick(course)}
                        className="w-full px-4 py-2 rounded-lg font-medium transition-all bg-gray-100 text-gray-900 hover:bg-gray-200 flex items-center justify-center space-x-2 rtl:space-x-reverse"
                    >
                        <PaperAirplaneIcon className="w-4 h-4" />
                        <span>طلب التسجيل</span>
                    </button>
                )}
            </div>
        </motion.div>
    );
};

export default function StudentCourses({ auth, availableCourses = [], enrolledCourses = [], enrollmentRequests = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        message: '',
        accepted_conditions: false,
    });

    const enrolledCourseIds = enrolledCourses.map(c => c.id);

    const handleEnrollClick = (course) => {
        setSelectedCourse(course);
        setShowEnrollModal(true);
        reset();
    };

    const handleEnrollSubmit = (e) => {
        e.preventDefault();
        post(`/student/courses/${selectedCourse.id}/enroll-request`, {
            onSuccess: () => {
                toast.success('تم إرسال طلب التسجيل بنجاح');
                setShowEnrollModal(false);
                reset();
            },
            onError: (errors) => {
                if (errors.accepted_conditions) {
                    toast.error('يجب قبول شروط التسجيل');
                } else {
                    toast.error('حدث خطأ أثناء إرسال الطلب');
                }
            },
        });
    };

    const filteredCourses = availableCourses.filter((course) => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.description.toLowerCase().includes(searchTerm.toLowerCase());

        if (filter === 'enrolled') return enrolledCourseIds.includes(course.id) && matchesSearch;
        if (filter === 'available') return !enrolledCourseIds.includes(course.id) && matchesSearch;
        return matchesSearch;
    });

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800">الكورسات</h2>}
        >
            <Head title="الكورسات" />

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl p-6 text-white"
                    >
                        <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
                            <div>
                                <p className="text-blue-100">الكورسات المسجلة</p>
                                <p className="text-3xl font-bold">{enrolledCourses.length}</p>
                            </div>
                            <BookOpenIcon className="w-12 h-12 text-blue-200" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white"
                    >
                        <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
                            <div>
                                <p className="text-green-100">الدروس المكتملة</p>
                                <p className="text-3xl font-bold">
                                    {enrolledCourses.reduce((sum, c) => sum + (c.completed_lessons || 0), 0)}
                                </p>
                            </div>
                            <CheckCircleIcon className="w-12 h-12 text-green-200" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl p-6 text-white"
                    >
                        <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
                            <div>
                                <p className="text-yellow-100">متوسط التقدم</p>
                                <p className="text-3xl font-bold">
                                    {enrolledCourses.length > 0
                                        ? Math.round(
                                            enrolledCourses.reduce((sum, c) => sum + (c.progress_percentage || 0), 0) /
                                            enrolledCourses.length
                                        )
                                        : 0}%
                                </p>
                            </div>
                            <StarIcon className="w-12 h-12 text-yellow-200" />
                        </div>
                    </motion.div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="relative flex-1 w-full sm:max-w-md">
                        <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="البحث عن كورس..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                filter === 'all'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            الكل
                        </button>
                        <button
                            onClick={() => setFilter('enrolled')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                filter === 'enrolled'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            مسجل
                        </button>
                        <button
                            onClick={() => setFilter('available')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                filter === 'available'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            متاح
                        </button>
                    </div>
                </div>

                {filteredCourses.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-xl shadow-lg p-12 text-center"
                    >
                        <BookOpenIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {searchTerm ? 'لا توجد نتائج' : 'لا توجد كورسات'}
                        </h3>
                        <p className="text-gray-500">
                            {searchTerm ? 'جرب البحث بكلمات مختلفة' : 'لا توجد كورسات متاحة حالياً'}
                        </p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCourses.map((course, index) => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                enrolledCourseIds={enrolledCourseIds}
                                enrollmentRequests={enrollmentRequests}
                                onEnrollClick={handleEnrollClick}
                            />
                        ))}
                    </div>
                )}
            </div>

            <Modal show={showEnrollModal} onClose={() => setShowEnrollModal(false)} maxWidth="2xl">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                        طلب التسجيل في الكورس
                    </h2>

                    {selectedCourse && (
                        <div className="space-y-6">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-bold text-lg text-gray-900 mb-2">
                                    {selectedCourse.title}
                                </h3>
                                <p className="text-sm text-gray-600 mb-3">
                                    {selectedCourse.description}
                                </p>
                                <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm text-gray-600">
                                    <div className="flex items-center">
                                        <ClockIcon className="w-4 h-4 ml-1" />
                                        <span>{selectedCourse.duration_hours} ساعة</span>
                                    </div>
                                    {selectedCourse.enrollment_fee > 0 && (
                                        <div className="flex items-center">
                                            <BanknotesIcon className="w-4 h-4 ml-1" />
                                            <span>رسوم التسجيل: {selectedCourse.enrollment_fee}دج</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {selectedCourse.enrollment_conditions_ar && (
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h4 className="font-medium text-gray-900 mb-2">
                                        شروط وأحكام التسجيل
                                    </h4>
                                    <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-60 overflow-y-auto">
                                        {selectedCourse.enrollment_conditions_ar}
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleEnrollSubmit} className="space-y-4">
                                <div>
                                    <InputLabel htmlFor="message" value="رسالة للمعلم (اختياري)" />
                                    <TextArea
                                        id="message"
                                        value={data.message}
                                        onChange={(e) => setData('message', e.target.value)}
                                        className="mt-1 block w-full"
                                        rows="3"
                                        placeholder="اكتب رسالة للمعلم إن أردت..."
                                    />
                                    <InputError message={errors.message} className="mt-2" />
                                </div>

                                <div className="flex items-start">
                                    <input
                                        type="checkbox"
                                        id="accepted_conditions"
                                        checked={data.accepted_conditions}
                                        onChange={(e) => setData('accepted_conditions', e.target.checked)}
                                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500 mt-1"
                                    />
                                    <label htmlFor="accepted_conditions" className="mr-2 text-sm text-gray-700">
                                        أوافق على شروط وأحكام التسجيل في هذا الكورس
                                        {selectedCourse.enrollment_fee > 0 && (
                                            <span className="font-medium"> وأوافق على دفع رسوم التسجيل ({selectedCourse.enrollment_fee}دج)</span>
                                        )}
                                    </label>
                                </div>
                                <InputError message={errors.accepted_conditions} className="mt-2" />

                                <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse pt-4">
                                    <SecondaryButton onClick={() => setShowEnrollModal(false)}>
                                        إلغاء
                                    </SecondaryButton>
                                    <PrimaryButton type="submit" disabled={processing}>
                                        {processing ? 'جاري الإرسال...' : 'إرسال الطلب'}
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
