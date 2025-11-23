import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    AcademicCapIcon,
    ChartBarIcon,
    PlusIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    StarIcon,
    TrophyIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';

const GradeCard = ({ grade, onEdit, onDelete, onView }) => {
    const getGradeColor = (percentage) => {
        if (percentage >= 90) return 'text-green-600 bg-green-100';
        if (percentage >= 80) return 'text-blue-600 bg-blue-100';
        if (percentage >= 70) return 'text-yellow-600 bg-yellow-100';
        if (percentage >= 60) return 'text-orange-600 bg-orange-100';
        return 'text-red-600 bg-red-100';
    };

    const getLetterGrade = (percentage) => {
        if (percentage >= 95) return 'A+';
        if (percentage >= 90) return 'A';
        if (percentage >= 85) return 'B+';
        if (percentage >= 80) return 'B';
        if (percentage >= 75) return 'C+';
        if (percentage >= 70) return 'C';
        if (percentage >= 65) return 'D+';
        if (percentage >= 60) return 'D';
        return 'F';
    };

    const getGradeTypeText = (type) => {
        const types = {
            quiz: 'اختبار قصير',
            assignment: 'واجب',
            exam: 'امتحان',
            participation: 'مشاركة',
            final: 'امتحان نهائي'
        };
        return types[type] || type;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse mb-2">
                        <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <AcademicCapIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">{grade.title_ar}</h3>
                            <p className="text-sm text-gray-500">{grade.student?.user?.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(grade.percentage)}`}>
                            {getGradeTypeText(grade.grade_type)}
                        </span>
                        <span className="text-sm text-gray-500">{grade.subject_ar}</span>
                    </div>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <button
                        onClick={() => onView(grade)}
                        className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                        <EyeIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => onEdit(grade)}
                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                        <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => onDelete(grade)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
                    <span className="text-sm text-gray-600">الدرجة</span>
                    <span className="font-semibold text-gray-900">
                        {grade.score} / {grade.max_score}
                    </span>
                </div>

                <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
                    <span className="text-sm text-gray-600">النسبة المئوية</span>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${getGradeColor(grade.percentage)}`}>
                            {grade.percentage}%
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${getGradeColor(grade.percentage)}`}>
                            {getLetterGrade(grade.percentage)}
                        </span>
                    </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                            grade.percentage >= 90 ? 'bg-green-500' :
                                grade.percentage >= 80 ? 'bg-blue-500' :
                                    grade.percentage >= 70 ? 'bg-yellow-500' :
                                        grade.percentage >= 60 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${grade.percentage}%` }}
                    ></div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-500">تاريخ التقييم: {grade.graded_date}</span>
                    {grade.percentage >= 90 && (
                        <TrophyIcon className="w-5 h-5 text-yellow-500" />
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default function Grades({ auth, grades = [], students = [], classes = [] }) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedGrade, setSelectedGrade] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedGradeType, setSelectedGradeType] = useState('');

    const { data, setData, post, put, processing, errors, reset } = useForm({
        student_id: '',
        class_id: '',
        subject: '',
        subject_ar: '',
        grade_type: 'quiz',
        title: '',
        title_ar: '',
        score: '',
        max_score: 100,
        percentage: 0,
        comments: '',
        comments_ar: '',
        graded_date: new Date().toISOString().split('T')[0],
    });

    const filteredGrades = grades.filter(grade => {
        const matchesSearch = grade.student?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            grade.title_ar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            grade.subject_ar?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesClass = !selectedClass || grade.class_id == selectedClass;
        const matchesType = !selectedGradeType || grade.grade_type === selectedGradeType;
        return matchesSearch && matchesClass && matchesType;
    });

    const handleCreate = (e) => {
        e.preventDefault();
        const percentage = (parseFloat(data.score) / parseFloat(data.max_score)) * 100;
        setData('percentage', percentage);

        post(route('teacher.grades.store'), {
            onSuccess: () => {
                setShowCreateModal(false);
                reset();
            }
        });
    };

    const handleEdit = (grade) => {
        setSelectedGrade(grade);
        setData({
            student_id: grade.student_id || '',
            class_id: grade.class_id || '',
            subject: grade.subject || '',
            subject_ar: grade.subject_ar || '',
            grade_type: grade.grade_type || 'quiz',
            title: grade.title || '',
            title_ar: grade.title_ar || '',
            score: grade.score || '',
            max_score: grade.max_score || 100,
            percentage: grade.percentage || 0,
            comments: grade.comments || '',
            comments_ar: grade.comments_ar || '',
            graded_date: grade.graded_date || new Date().toISOString().split('T')[0],
        });
        setShowEditModal(true);
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        const percentage = (parseFloat(data.score) / parseFloat(data.max_score)) * 100;
        setData('percentage', percentage);

        put(route('teacher.grades.update', selectedGrade.id), {
            onSuccess: () => {
                setShowEditModal(false);
                reset();
                setSelectedGrade(null);
            }
        });
    };

    const handleView = (grade) => {
        setSelectedGrade(grade);
        setShowViewModal(true);
    };

    const handleDelete = (grade) => {
        if (confirm('هل أنت متأكد من حذف هذه الدرجة؟')) {
            // Delete logic here
        }
    };

    const calculateScore = () => {
        if (data.score && data.max_score) {
            const percentage = (parseFloat(data.score) / parseFloat(data.max_score)) * 100;
            setData('percentage', Math.round(percentage * 100) / 100);
        }
    };

    const getGradeStats = () => {
        const totalGrades = filteredGrades.length;
        const averageGrade = totalGrades > 0
            ? filteredGrades.reduce((sum, grade) => sum + grade.percentage, 0) / totalGrades
            : 0;
        const excellentCount = filteredGrades.filter(g => g.percentage >= 90).length;
        const passCount = filteredGrades.filter(g => g.percentage >= 60).length;

        return { totalGrades, averageGrade, excellentCount, passCount };
    };

    const stats = getGradeStats();

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">إدارة الدرجات</h2>
                    <PrimaryButton onClick={() => setShowCreateModal(true)}>
                        <PlusIcon className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                        إضافة درجة جديدة
                    </PrimaryButton>
                </div>
            }
        >
            <Head title="إدارة الدرجات" />

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
                                <p className="text-blue-100">إجمالي الدرجات</p>
                                <p className="text-3xl font-bold">{stats.totalGrades}</p>
                            </div>
                            <ChartBarIcon className="w-12 h-12 text-blue-200" />
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
                                <p className="text-green-100">المتوسط العام</p>
                                <p className="text-3xl font-bold">{Math.round(stats.averageGrade)}%</p>
                            </div>
                            <StarIcon className="w-12 h-12 text-green-200" />
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
                                <p className="text-yellow-100">ممتاز (90%+)</p>
                                <p className="text-3xl font-bold">{stats.excellentCount}</p>
                            </div>
                            <TrophyIcon className="w-12 h-12 text-yellow-200" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white"
                    >
                        <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
                            <div>
                                <p className="text-purple-100">ناجح (60%+)</p>
                                <p className="text-3xl font-bold">{stats.passCount}</p>
                            </div>
                            <AcademicCapIcon className="w-12 h-12 text-purple-200" />
                        </div>
                    </motion.div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <InputLabel htmlFor="search" value="البحث" />
                            <div className="relative mt-1">
                                <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <TextInput
                                    id="search"
                                    type="text"
                                    placeholder="البحث عن طالب أو درجة..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pr-10"
                                />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="class_filter" value="الفصل" />
                            <select
                                id="class_filter"
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                            >
                                <option value="">جميع الفصول</option>
                                {classes.map(classItem => (
                                    <option key={classItem.id} value={classItem.id}>
                                        {classItem.name_ar}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <InputLabel htmlFor="type_filter" value="نوع التقييم" />
                            <select
                                id="type_filter"
                                value={selectedGradeType}
                                onChange={(e) => setSelectedGradeType(e.target.value)}
                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                            >
                                <option value="">جميع الأنواع</option>
                                <option value="quiz">اختبار قصير</option>
                                <option value="assignment">واجب</option>
                                <option value="exam">امتحان</option>
                                <option value="participation">مشاركة</option>
                                <option value="final">امتحان نهائي</option>
                            </select>
                        </div>

                        <div className="flex items-end">
                            <SecondaryButton
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedClass('');
                                    setSelectedGradeType('');
                                }}
                                className="w-full"
                            >
                                إعادة تعيين
                            </SecondaryButton>
                        </div>
                    </div>
                </div>

                {/* Grades Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredGrades.map((grade, index) => (
                        <GradeCard
                            key={grade.id}
                            grade={grade}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onView={handleView}
                        />
                    ))}
                </div>

                {filteredGrades.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                    >
                        <ChartBarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {searchTerm || selectedClass || selectedGradeType ? 'لا توجد نتائج' : 'لا توجد درجات'}
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {searchTerm || selectedClass || selectedGradeType
                                ? 'جرب تغيير معايير البحث'
                                : 'ابدأ بإضافة درجات للطلاب'
                            }
                        </p>
                        {!searchTerm && !selectedClass && !selectedGradeType && (
                            <PrimaryButton onClick={() => setShowCreateModal(true)}>
                                إضافة درجة جديدة
                            </PrimaryButton>
                        )}
                    </motion.div>
                )}
            </div>

            {/* Create Modal */}
            <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)} maxWidth="3xl">
                <form onSubmit={handleCreate} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">إضافة درجة جديدة</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <InputLabel htmlFor="student_id" value="الطالب" />
                            <select
                                id="student_id"
                                value={data.student_id}
                                onChange={(e) => setData('student_id', e.target.value)}
                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                required
                            >
                                <option value="">اختر الطالب</option>
                                {students.map(student => (
                                    <option key={student.id} value={student.id}>
                                        {student.user?.name} - {student.student_id}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.student_id} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="class_id" value="الفصل" />
                            <select
                                id="class_id"
                                value={data.class_id}
                                onChange={(e) => setData('class_id', e.target.value)}
                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                required
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <InputLabel htmlFor="title_ar" value="عنوان التقييم" />
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
                            <InputLabel htmlFor="grade_type" value="نوع التقييم" />
                            <select
                                id="grade_type"
                                value={data.grade_type}
                                onChange={(e) => setData('grade_type', e.target.value)}
                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                required
                            >
                                <option value="quiz">اختبار قصير</option>
                                <option value="assignment">واجب</option>
                                <option value="exam">امتحان</option>
                                <option value="participation">مشاركة</option>
                                <option value="final">امتحان نهائي</option>
                            </select>
                            <InputError message={errors.grade_type} className="mt-2" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <InputLabel htmlFor="score" value="الدرجة المحصلة" />
                            <TextInput
                                id="score"
                                type="number"
                                value={data.score}
                                onChange={(e) => {
                                    setData('score', e.target.value);
                                    calculateScore();
                                }}
                                className="mt-1 block w-full"
                                min="0"
                                step="0.01"
                                required
                            />
                            <InputError message={errors.score} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="max_score" value="الدرجة الكاملة" />
                            <TextInput
                                id="max_score"
                                type="number"
                                value={data.max_score}
                                onChange={(e) => {
                                    setData('max_score', e.target.value);
                                    calculateScore();
                                }}
                                className="mt-1 block w-full"
                                min="1"
                                step="0.01"
                                required
                            />
                            <InputError message={errors.max_score} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="percentage" value="النسبة المئوية" />
                            <TextInput
                                id="percentage"
                                type="number"
                                value={data.percentage}
                                className="mt-1 block w-full bg-gray-100"
                                readOnly
                            />
                        </div>
                    </div>

                    <div className="mb-6">
                        <InputLabel htmlFor="comments_ar" value="ملاحظات" />
                        <textarea
                            id="comments_ar"
                            value={data.comments_ar}
                            onChange={(e) => setData('comments_ar', e.target.value)}
                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                            rows="3"
                        />
                        <InputError message={errors.comments_ar} className="mt-2" />
                    </div>

                    <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse">
                        <SecondaryButton onClick={() => setShowCreateModal(false)}>
                            إلغاء
                        </SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            {processing ? 'جاري الحفظ...' : 'حفظ'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* View Modal */}
            <Modal show={showViewModal} onClose={() => setShowViewModal(false)} maxWidth="2xl">
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">تفاصيل الدرجة</h2>

                    {selectedGrade && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-white text-2xl font-bold">
                                        {Math.round(selectedGrade.percentage)}%
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">{selectedGrade.title_ar}</h3>
                                <p className="text-gray-600">{selectedGrade.student?.user?.name}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">نوع التقييم</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {selectedGrade.grade_type === 'quiz' ? 'اختبار قصير' :
                                            selectedGrade.grade_type === 'assignment' ? 'واجب' :
                                                selectedGrade.grade_type === 'exam' ? 'امتحان' :
                                                    selectedGrade.grade_type === 'participation' ? 'مشاركة' :
                                                        selectedGrade.grade_type === 'final' ? 'امتحان نهائي' : selectedGrade.grade_type}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">المادة</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedGrade.subject_ar}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">الدرجة</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedGrade.score} / {selectedGrade.max_score}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">تاريخ التقييم</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedGrade.graded_date}</p>
                                </div>
                            </div>

                            {selectedGrade.comments_ar && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات</label>
                                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedGrade.comments_ar}</p>
                                </div>
                            )}

                            <div className="flex justify-end">
                                <SecondaryButton onClick={() => setShowViewModal(false)}>
                                    إغلاق
                                </SecondaryButton>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
