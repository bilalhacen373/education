import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    PlusIcon,
    UserIcon,
    MagnifyingGlassIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    AcademicCapIcon,
    CalendarIcon,
    PhoneIcon,
    EnvelopeIcon,
    ArrowUpTrayIcon,
    DocumentArrowUpIcon,
} from '@heroicons/react/24/outline';
import { getExpectedBirthDateFromEducationLevel } from '@/Utils/ageCalculator';
import { toast } from 'react-hot-toast';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import TextArea from '@/Components/TextArea';

const StudentCard = ({ student, onEdit, onDelete, onView }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300"
    >
        <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900">{student.user?.name}</h3>
                    <p className="text-sm text-gray-500">رقم الطالب: {student.student_id}</p>
                </div>
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <button
                    onClick={() => onView(student)}
                    className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                >
                    <EyeIcon className="w-5 h-5" />
                </button>
                <button
                    onClick={() => onEdit(student)}
                    className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                    <PencilIcon className="w-5 h-5" />
                </button>
                <button
                    onClick={() => onDelete(student)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        </div>

        <div className="space-y-3">
            <div className="flex items-center text-sm text-gray-600">
                <AcademicCapIcon className="w-4 h-4 ml-2" />
                <span>الفصل: {student.class?.name_ar || 'غير محدد'}</span>
            </div>

            <div className="flex items-center text-sm text-gray-600">
                <CalendarIcon className="w-4 h-4 ml-2" />
                <span>تاريخ الميلاد: { new Date(student.birth_date).toISOString().split('T')[0] }</span>
            </div>

            <div className="flex items-center text-sm text-gray-600">
                <PhoneIcon className="w-4 h-4 ml-2" />
                <span>هاتف ولي الأمر: {student.parent_phone}</span>
            </div>

            <div className="flex items-center text-sm text-gray-600">
                <EnvelopeIcon className="w-4 h-4 ml-2" />
                <span>البريد: {student.user?.email}</span>
            </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                student.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
            }`}>
                {student.is_active ? 'نشط' : 'غير نشط'}
            </span>
            <span className="text-sm text-gray-500">
                معدل الحضور: {student.attendance_rate || 0}%
            </span>
        </div>
    </motion.div>
);

export default function Students({ auth, students = [], classes = [], schools = [] }) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [importFile, setImportFile] = useState(null);
    const [importType, setImportType] = useState('excel');
    const [importing, setImporting] = useState(false);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        class_id: '',
        birth_date: '',
        gender: 'male',
        parent_name: '',
        parent_phone: '',
        parent_email: '',
        address: '',
        address_ar: '',
        medical_info: '',
        is_active: true,
    });

    const filteredStudents = students.filter(student =>
        student.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.parent_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreate = (e) => {
        e.preventDefault();
        post(route('teacher.students.store'), {
            onSuccess: () => {
                setShowCreateModal(false);
                reset();
            }
        });
    };

    const handleEdit = (student) => {
        setSelectedStudent(student);
        const formattedBirthDate = student.birth_date
            ? new Date(student.birth_date).toISOString().split('T')[0]
            : '';
        setData({
            name: student.user?.name || '',
            email: student.user?.email || '',
            phone: student.user?.phone || '',
            class_id: student.class_id || '',
            birth_date: formattedBirthDate,
            gender: student.gender || 'male',
            parent_name: student.parent_name || '',
            parent_phone: student.parent_phone || '',
            parent_email: student.parent_email || '',
            address: student.address || '',
            address_ar: student.address_ar || '',
            medical_info: student.medical_info || '',
            is_active: student.is_active || true,
        });
        setShowEditModal(true);
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        put(route('teacher.students.update', selectedStudent.id), {
            onSuccess: () => {
                setShowEditModal(false);
                reset();
                setSelectedStudent(null);
            }
        });
    };

    const handleView = (student) => {
        setSelectedStudent(student);
        setShowViewModal(true);
    };

    const handleDelete = (student) => {
        if (confirm('هل أنت متأكد من حذف هذا الطالب؟')) {
            router.delete(route('teacher.students.destroy', student.id), {
                onSuccess: () => {
                    console.log('تم حذف الطالب بنجاح');
                }
            });
        }
    };

    const handleImport = (e) => {
        e.preventDefault();

        if (!importFile) {
            toast.error('الرجاء اختيار ملف للاستيراد');
            return;
        }

        setImporting(true);
        const formData = new FormData();
        formData.append('file', importFile);
        formData.append('type', importType);

        router.post(route('teacher.students.import'), formData, {
            onSuccess: () => {
                toast.success('تم استيراد الطلاب بنجاح');
                setShowImportModal(false);
                setImportFile(null);
                setImporting(false);
            },
            onError: (errors) => {
                toast.error(errors.file || 'فشل استيراد الطلاب');
                setImporting(false);
            }
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const fileExtension = file.name.split('.').pop().toLowerCase();
            if (fileExtension === 'xlsx' || fileExtension === 'xls') {
                setImportType('excel');
            } else if (fileExtension === 'csv') {
                setImportType('csv');
            } else {
                toast.error('يرجى اختيار ملف Excel (.xlsx, .xls) أو CSV (.csv)');
                return;
            }
            setImportFile(file);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">إدارة الطلاب</h2>
                    <div className="flex gap-3">
                        <SecondaryButton onClick={() => setShowImportModal(true)}>
                            <ArrowUpTrayIcon className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                            استيراد من ملف
                        </SecondaryButton>
                        <PrimaryButton onClick={() => setShowCreateModal(true)}>
                            <PlusIcon className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                            إضافة طالب جديد
                        </PrimaryButton>
                    </div>
                </div>
            }
        >
            <Head title="إدارة الطلاب" />

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
                                <p className="text-blue-100">إجمالي الطلاب</p>
                                <p className="text-3xl font-bold">{students.length}</p>
                            </div>
                            <UserIcon className="w-12 h-12 text-blue-200" />
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
                                <p className="text-green-100">الطلاب النشطون</p>
                                <p className="text-3xl font-bold">{students.filter(s => s.is_active).length}</p>
                            </div>
                            <AcademicCapIcon className="w-12 h-12 text-green-200" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-xl p-6 text-white"
                    >
                        <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
                            <div>
                                <p className="text-cyan-100">الذكور</p>
                                <p className="text-3xl font-bold">{students.filter(s => s.gender === 'male').length}</p>
                            </div>
                            <UserIcon className="w-12 h-12 text-cyan-200" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl p-6 text-white"
                    >
                        <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
                            <div>
                                <p className="text-pink-100">الإناث</p>
                                <p className="text-3xl font-bold">{students.filter(s => s.gender === 'female').length}</p>
                            </div>
                            <UserIcon className="w-12 h-12 text-pink-200" />
                        </div>
                    </motion.div>
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <TextInput
                            type="text"
                            placeholder="البحث عن طالب..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pr-10"
                        />
                    </div>
                </div>

                {/* Students Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStudents.map((student, index) => (
                        <StudentCard
                            key={student.id}
                            student={student}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onView={handleView}
                        />
                    ))}
                </div>

                {filteredStudents.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                    >
                        <UserIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {searchTerm ? 'لا توجد نتائج' : 'لا يوجد طلاب'}
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {searchTerm ? 'جرب البحث بكلمات مختلفة' : 'ابدأ بإضافة طلاب جدد'}
                        </p>
                        {!searchTerm && (
                            <PrimaryButton onClick={() => setShowCreateModal(true)}>
                                إضافة طالب جديد
                            </PrimaryButton>
                        )}
                    </motion.div>
                )}
            </div>

            {/* Create Modal */}
            <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)} maxWidth="4xl">
                <form onSubmit={handleCreate} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">إضافة طالب جديد</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <InputLabel htmlFor="name" value="اسم الطالب"/>
                            <TextInput
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            />
                            <InputError message={errors.name} className="mt-2"/>
                        </div>
                        <div>
                            <InputLabel htmlFor="class_id" value="الفصل"/>
                            <select
                                id="class_id"
                                value={data.class_id}
                                onChange={(e) => setData('class_id', e.target.value)}
                                className="mt-1 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                            >
                                <option value="">اختر الفصل</option>
                                {classes.map(classItem => (
                                    <option key={classItem.id} value={classItem.id}>
                                        {classItem.name_ar}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.class_id} className="mt-2"/>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <InputLabel htmlFor="email" value="البريد الإلكتروني"/>
                            <TextInput
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            />
                            <InputError message={errors.email} className="mt-2"/>
                        </div>

                        <div>
                            <InputLabel htmlFor="phone" value="رقم الهاتف"/>
                            <TextInput
                                id="phone"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors.phone} className="mt-2"/>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <InputLabel htmlFor="birth_date" value="تاريخ الميلاد"/>
                            <TextInput
                                id="birth_date"
                                type="date"
                                value={data.birth_date}
                                onChange={(e) => setData('birth_date', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            />
                            <InputError message={errors.birth_date} className="mt-2"/>
                        </div>

                        <div>
                            <InputLabel htmlFor="gender" value="الجنس"/>
                            <select
                                id="gender"
                                value={data.gender}
                                onChange={(e) => setData('gender', e.target.value)}
                                className="mt-1 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                                required
                            >
                                <option value="male">ذكر</option>
                                <option value="female">أنثى</option>
                            </select>
                            <InputError message={errors.gender} className="mt-2"/>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <InputLabel htmlFor="parent_name" value="اسم ولي الأمر"/>
                            <TextInput
                                id="parent_name"
                                value={data.parent_name}
                                onChange={(e) => setData('parent_name', e.target.value)}
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors.parent_name} className="mt-2"/>
                        </div>

                        <div>
                            <InputLabel htmlFor="parent_phone" value="هاتف ولي الأمر"/>
                            <TextInput
                                id="parent_phone"
                                value={data.parent_phone}
                                onChange={(e) => setData('parent_phone', e.target.value)}
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors.parent_phone} className="mt-2"/>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <InputLabel htmlFor="parent_email" value="بريد ولي الأمر"/>
                            <TextInput
                                id="parent_email"
                                type="email"
                                value={data.parent_email}
                                onChange={(e) => setData('parent_email', e.target.value)}
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors.parent_email} className="mt-2"/>
                        </div>

                        <div>
                            <InputLabel htmlFor="address" value="العنوان (بالإنجليزية)"/>
                            <TextInput
                                id="address"
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors.address} className="mt-2"/>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 mb-4">
                        <div>
                            <InputLabel htmlFor="address_ar" value="العنوان (بالعربية)"/>
                            <TextInput
                                id="address_ar"
                                value={data.address_ar}
                                onChange={(e) => setData('address_ar', e.target.value)}
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors.address_ar} className="mt-2"/>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 mb-6">
                        <div>
                            <InputLabel htmlFor="medical_info" value="معلومات طبية"/>
                            <TextArea
                                id="medical_info"
                                value={data.medical_info}
                                onChange={(e) => setData('medical_info', e.target.value)}
                                className="mt-1 block w-full"
                                rows={3}
                            />
                            <InputError message={errors.medical_info} className="mt-2"/>
                        </div>
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

            {/* Edit Modal */}
            <Modal show={showEditModal} onClose={() => setShowEditModal(false)} maxWidth="4xl">
                <form onSubmit={handleUpdate} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">تعديل بيانات الطالب</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <InputLabel htmlFor="edit_name" value="اسم الطالب"/>
                            <TextInput
                                id="edit_name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            />
                            <InputError message={errors.name} className="mt-2"/>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <InputLabel htmlFor="edit_email" value="البريد الإلكتروني" />
                            <TextInput
                                id="edit_email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_phone" value="رقم الهاتف" />
                            <TextInput
                                id="edit_phone"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors.phone} className="mt-2" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <InputLabel htmlFor="edit_birth_date" value="تاريخ الميلاد" />
                            <TextInput
                                id="edit_birth_date"
                                type="date"
                                value={data.birth_date}
                                onChange={(e) => setData('birth_date', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            />
                            <InputError message={errors.birth_date} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_gender" value="الجنس" />
                            <select
                                id="edit_gender"
                                value={data.gender}
                                onChange={(e) => setData('gender', e.target.value)}
                                className="mt-1 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                                required
                            >
                                <option value="male">ذكر</option>
                                <option value="female">أنثى</option>
                            </select>
                            <InputError message={errors.gender} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_class_id" value="الفصل" />
                            <select
                                id="edit_class_id"
                                value={data.class_id}
                                onChange={(e) => setData('class_id', e.target.value)}
                                className="mt-1 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
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
                            <InputLabel htmlFor="edit_parent_name" value="اسم ولي الأمر" />
                            <TextInput
                                id="edit_parent_name"
                                value={data.parent_name}
                                onChange={(e) => setData('parent_name', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            />
                            <InputError message={errors.parent_name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_parent_phone" value="هاتف ولي الأمر" />
                            <TextInput
                                id="edit_parent_phone"
                                value={data.parent_phone}
                                onChange={(e) => setData('parent_phone', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            />
                            <InputError message={errors.parent_phone} className="mt-2" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <InputLabel htmlFor="edit_parent_email" value="بريد ولي الأمر" />
                            <TextInput
                                id="edit_parent_email"
                                type="email"
                                value={data.parent_email}
                                onChange={(e) => setData('parent_email', e.target.value)}
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors.parent_email} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_address" value="العنوان (بالإنجليزية)" />
                            <TextInput
                                id="edit_address"
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors.address} className="mt-2" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 mb-4">
                        <div>
                            <InputLabel htmlFor="edit_address_ar" value="العنوان (بالعربية)" />
                            <TextInput
                                id="edit_address_ar"
                                value={data.address_ar}
                                onChange={(e) => setData('address_ar', e.target.value)}
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors.address_ar} className="mt-2" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 mb-4">
                        <div>
                            <InputLabel htmlFor="edit_medical_info" value="معلومات طبية" />
                            <TextArea
                                id="edit_medical_info"
                                value={data.medical_info}
                                onChange={(e) => setData('medical_info', e.target.value)}
                                className="mt-1 block w-full"
                                rows={3}
                            />
                            <InputError message={errors.medical_info} className="mt-2" />
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                            <span className="mr-2 text-sm text-gray-600">نشط</span>
                        </label>
                    </div>

                    <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse">
                        <SecondaryButton onClick={() => setShowEditModal(false)}>
                            إلغاء
                        </SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            {processing ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* View Modal */}
            <Modal show={showViewModal} onClose={() => setShowViewModal(false)} maxWidth="2xl">
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">تفاصيل الطالب</h2>
                    {selectedStudent && (
                        <div className="space-y-6">
                            <div className="flex items-center space-x-4 rtl:space-x-reverse">
                                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                                    <UserIcon className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{selectedStudent.user?.name}</h3>
                                    <p className="text-gray-500">رقم الطالب: {selectedStudent.student_id}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">البريد الإلكتروني</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedStudent.user?.email}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">رقم الهاتف</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedStudent.user?.phone || 'غير محدد'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">تاريخ الميلاد</label>
                                    <p className="mt-1 text-sm text-gray-900">{new Date(selectedStudent.birth_date).toISOString().split('T')[0]}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">الجنس</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedStudent.gender === 'male' ? 'ذكر' : 'أنثى'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">اسم ولي الأمر</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedStudent.parent_name}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">هاتف ولي الأمر</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedStudent.parent_phone}</p>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <SecondaryButton onClick={() => setShowViewModal(false)}>
                                    إغلاق
                                </SecondaryButton>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Import Modal */}
            <Modal show={showImportModal} onClose={() => setShowImportModal(false)} maxWidth="2xl">
                <form onSubmit={handleImport} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">استيراد الطلاب من ملف</h2>

                    <div className="space-y-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h3 className="font-medium text-blue-900 mb-2">تنسيق الملف المطلوب:</h3>
                            <p className="text-sm text-blue-800 mb-3">
                                يجب أن يحتوي ملف Excel أو CSV على الأعمدة التالية:
                            </p>
                            <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                                <li><strong>name</strong> - اسم الطالب (مطلوب)</li>
                                <li><strong>email</strong> - البريد الإلكتروني (مطلوب)</li>
                                <li><strong>birth_date</strong> - تاريخ الميلاد (YYYY-MM-DD)</li>
                                <li><strong>gender</strong> - الجنس (male/female)</li>
                                <li><strong>parent_name</strong> - اسم ولي الأمر</li>
                                <li><strong>parent_phone</strong> - هاتف ولي الأمر</li>
                                <li><strong>address</strong> - العنوان</li>
                            </ul>
                            <p className="text-xs text-blue-700 mt-3">
                                ملاحظة: سيتم محاولة التعرف على البيانات تلقائياً حتى لو كانت الأعمدة بأسماء مختلفة
                            </p>
                        </div>

                        <div>
                            <InputLabel htmlFor="import_file" value="اختر ملف Excel أو CSV" />
                            <input
                                id="import_file"
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                onChange={handleFileChange}
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            {importFile && (
                                <p className="mt-2 text-sm text-green-600">
                                    الملف المحدد: {importFile.name} ({importType === 'excel' ? 'Excel' : 'CSV'})
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse mt-6">
                        <SecondaryButton onClick={() => {
                            setShowImportModal(false);
                            setImportFile(null);
                        }}>
                            إلغاء
                        </SecondaryButton>
                        <PrimaryButton disabled={importing || !importFile}>
                            {importing ? 'جاري الاستيراد...' : 'استيراد'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
