import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import TextArea from '@/Components/TextArea';
import InputError from '@/Components/InputError';
import { toast } from 'react-hot-toast';

export default function EditLesson({ auth, lesson, classes, subjects }) {
    const [formData, setFormData] = useState({
        title: lesson.title || '',
        title_ar: lesson.title_ar || '',
        description: lesson.description || '',
        description_ar: lesson.description_ar || '',
        content_text: lesson.content_text || '',
        notes: lesson.notes || '',
        content_type: lesson.content_type || 'text',
        video_url: lesson.video_url || '',
        video_file: null,
        duration_minutes: lesson.duration_minutes || 30,
        order: lesson.order || 1,
        documents: [],
        thumbnail: null,
        is_published: lesson.is_published ?? true,
        sharing_mode: lesson.sharing_mode || 'private',
        class_ids: lesson.classes?.map(c => c.id) || [],
        excluded_student_ids: lesson.excluded_students?.map(s => s.id) || [],
        subject_id: lesson.subject_id || null,
        remove_documents: [],
    });

    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [selectedClasses, setSelectedClasses] = useState(lesson.classes?.map(c => c.id) || []);
    const [existingDocuments, setExistingDocuments] = useState(lesson.documents || []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (name === 'sharing_mode' && value !== 'class') {
            setSelectedClasses([]);
            setFormData(prev => ({ ...prev, class_ids: [] }));
        }
        if (name === 'sharing_mode' && value !== 'custom') {
            setFormData(prev => ({ ...prev, excluded_student_ids: [] }));
        }
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (name === 'documents') {
            setFormData(prev => ({
                ...prev,
                documents: [...prev.documents, ...Array.from(files)]
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: files[0]
            }));
        }
    };

    const handleRemoveNewDocument = (index) => {
        setFormData(prev => ({
            ...prev,
            documents: prev.documents.filter((_, i) => i !== index)
        }));
    };

    const handleRemoveExistingDocument = (docPath) => {
        setExistingDocuments(prev => prev.filter(doc => doc.path !== docPath));
        setFormData(prev => ({
            ...prev,
            remove_documents: [...prev.remove_documents, docPath]
        }));
    };

    const handleClassToggle = (classId) => {
        setSelectedClasses(prev => {
            const newSelected = prev.includes(classId)
                ? prev.filter(id => id !== classId)
                : [...prev, classId];

            setFormData(prevForm => ({
                ...prevForm,
                class_ids: newSelected
            }));

            return newSelected;
        });
    };

    const handleStudentExclusionToggle = (studentId) => {
        setFormData(prev => ({
            ...prev,
            excluded_student_ids: prev.excluded_student_ids.includes(studentId)
                ? prev.excluded_student_ids.filter(id => id !== studentId)
                : [...prev.excluded_student_ids, studentId]
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);

        const submitData = new FormData();
        submitData.append('_method', 'POST');

        Object.keys(formData).forEach(key => {
            if (key === 'documents') {
                formData.documents.forEach((doc, index) => {
                    submitData.append(`documents[${index}]`, doc);
                });
            } else if (key === 'video_file' && formData.video_file) {
                submitData.append('video_file', formData.video_file);
            } else if (key === 'thumbnail' && formData.thumbnail) {
                submitData.append('thumbnail', formData.thumbnail);
            } else if (key === 'class_ids' || key === 'excluded_student_ids' || key === 'remove_documents') {
                formData[key].forEach((item, index) => {
                    submitData.append(`${key}[${index}]`, item);
                });
            } else if (formData[key] !== null && formData[key] !== '') {
                submitData.append(key, formData[key]);
            }
        });

        router.post(route('teacher.lessons.update', lesson.id), submitData, {
            onSuccess: () => {
                toast.success('تم تحديث الدرس بنجاح');
                setProcessing(false);
            },
            onError: (errors) => {
                setErrors(errors);
                toast.error('فشل تحديث الدرس');
                setProcessing(false);
            }
        });
    };

    const allStudents = classes.flatMap(c =>
        c.students?.map(s => ({ ...s, className: c.name })) || []
    );

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="تعديل الدرس" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-gray-800">
                                    تعديل الدرس: {lesson.title}
                                </h2>
                                <SecondaryButton
                                    onClick={() => window.history.back()}
                                >
                                    إلغاء
                                </SecondaryButton>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel htmlFor="title" value="عنوان الدرس" required />
                                    <TextInput
                                        id="title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="mt-1 block w-full"
                                        required
                                    />
                                    <InputError message={errors.title} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="title_ar" value="عنوان الدرس (بالعربية)" />
                                    <TextInput
                                        id="title_ar"
                                        name="title_ar"
                                        value={formData.title_ar}
                                        onChange={handleChange}
                                        className="mt-1 block w-full"
                                    />
                                    <InputError message={errors.title_ar} className="mt-2" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel htmlFor="description" value="الوصف" />
                                    <TextArea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="mt-1 block w-full"
                                        rows="4"
                                    />
                                    <InputError message={errors.description} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="description_ar" value="الوصف (بالعربية)" />
                                    <TextArea
                                        id="description_ar"
                                        name="description_ar"
                                        value={formData.description_ar}
                                        onChange={handleChange}
                                        className="mt-1 block w-full"
                                        rows="4"
                                    />
                                    <InputError message={errors.description_ar} className="mt-2" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <InputLabel htmlFor="content_type" value="نوع المحتوى" required />
                                    <select
                                        id="content_type"
                                        name="content_type"
                                        value={formData.content_type}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                                        required
                                    >
                                        <option value="text">نص</option>
                                        <option value="video">فيديو</option>
                                        <option value="document">مستند</option>
                                        <option value="mixed">مختلط</option>
                                    </select>
                                    <InputError message={errors.content_type} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="duration_minutes" value="المدة (بالدقائق)" required />
                                    <TextInput
                                        id="duration_minutes"
                                        name="duration_minutes"
                                        type="number"
                                        min="1"
                                        value={formData.duration_minutes}
                                        onChange={handleChange}
                                        className="mt-1 block w-full"
                                        required
                                    />
                                    <InputError message={errors.duration_minutes} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="order" value="الترتيب" required />
                                    <TextInput
                                        id="order"
                                        name="order"
                                        type="number"
                                        min="1"
                                        value={formData.order}
                                        onChange={handleChange}
                                        className="mt-1 block w-full"
                                        required
                                    />
                                    <InputError message={errors.order} className="mt-2" />
                                </div>
                            </div>

                            <div>
                                <InputLabel htmlFor="sharing_mode" value="نمط المشاركة" required />
                                <select
                                    id="sharing_mode"
                                    name="sharing_mode"
                                    value={formData.sharing_mode}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                                    required
                                >
                                    <option value="private">خاص - لا يمكن لأحد الوصول</option>
                                    <option value="class">فصول محددة - للطلاب في الفصول المحددة فقط</option>
                                    <option value="custom">مخصص - لجميع الطلاب ماعدا المستثنين</option>
                                    <option value="public">عام - لجميع الطلاب في المنصة</option>
                                </select>
                                <InputError message={errors.sharing_mode} className="mt-2" />

                                <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-700 font-medium mb-2">شرح أنماط المشاركة:</p>
                                    <ul className="space-y-1 text-sm text-gray-600">
                                        <li><strong>خاص:</strong> الدرس غير متاح لأي طالب</li>
                                        <li><strong>فصول محددة:</strong> يمكن فقط للطلاب المسجلين في الفصول المحددة الوصول</li>
                                        <li><strong>مخصص:</strong> يمكن لجميع الطلاب الوصول باستثناء الطلاب المستثنين</li>
                                        <li><strong>عام:</strong> متاح لجميع الطلاب المسجلين في المنصة</li>
                                    </ul>
                                </div>
                            </div>

                            {formData.sharing_mode === 'class' && (
                                <div>
                                    <InputLabel value="اختر الفصول" required />
                                    <div className="mt-2 space-y-2 max-h-60 overflow-y-auto border border-gray-300 rounded-md p-3">
                                        {classes.map((classItem) => (
                                            <label
                                                key={classItem.id}
                                                className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedClasses.includes(classItem.id)}
                                                    onChange={() => handleClassToggle(classItem.id)}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="mr-2 rtl:ml-2">{classItem.name}</span>
                                                <span className="text-sm text-gray-500">
                                                    ({classItem.students?.length || 0} طالب)
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                    <InputError message={errors.class_ids} className="mt-2" />
                                </div>
                            )}

                            {formData.sharing_mode === 'custom' && (
                                <div>
                                    <InputLabel value="استثناء طلاب محددين" />
                                    <p className="text-sm text-gray-600 mb-2">
                                        حدد الطلاب الذين لا يجب أن يتمكنوا من الوصول إلى هذا الدرس
                                    </p>
                                    <div className="mt-2 space-y-2 max-h-60 overflow-y-auto border border-gray-300 rounded-md p-3">
                                        {allStudents.map((student) => (
                                            <label
                                                key={student.id}
                                                className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.excluded_student_ids.includes(student.id)}
                                                    onChange={() => handleStudentExclusionToggle(student.id)}
                                                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                                />
                                                <span className="mr-2 rtl:ml-2">{student.user?.name}</span>
                                                <span className="text-sm text-gray-500">
                                                    ({student.className})
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                    <InputError message={errors.excluded_student_ids} className="mt-2" />
                                </div>
                            )}

                            {(formData.content_type === 'text' || formData.content_type === 'mixed') && (
                                <div>
                                    <InputLabel htmlFor="content_text" value="محتوى نصي" />
                                    <TextArea
                                        id="content_text"
                                        name="content_text"
                                        value={formData.content_text}
                                        onChange={handleChange}
                                        className="mt-1 block w-full"
                                        rows="8"
                                    />
                                    <InputError message={errors.content_text} className="mt-2" />
                                </div>
                            )}

                            {(formData.content_type === 'video' || formData.content_type === 'mixed') && (
                                <div className="space-y-4">
                                    <div>
                                        <InputLabel htmlFor="video_url" value="رابط الفيديو (URL)" />
                                        <TextInput
                                            id="video_url"
                                            name="video_url"
                                            type="url"
                                            value={formData.video_url}
                                            onChange={handleChange}
                                            className="mt-1 block w-full"
                                            placeholder="https://youtube.com/watch?v=..."
                                        />
                                        <InputError message={errors.video_url} className="mt-2" />
                                        {lesson.video_url && !formData.video_file && (
                                            <p className="text-sm text-gray-600 mt-1">الفيديو الحالي: {lesson.video_url}</p>
                                        )}
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="video_file" value="أو ارفع ملف فيديو جديد" />
                                        <input
                                            id="video_file"
                                            name="video_file"
                                            type="file"
                                            accept="video/*"
                                            onChange={handleFileChange}
                                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">الحد الأقصى: 100 ميجابايت</p>
                                        <InputError message={errors.video_file} className="mt-2" />
                                    </div>
                                </div>
                            )}

                            <div>
                                <InputLabel htmlFor="thumbnail" value="صورة مصغرة جديدة" />
                                <input
                                    id="thumbnail"
                                    name="thumbnail"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                {lesson.thumbnail && (
                                    <p className="text-sm text-gray-600 mt-1">الصورة المصغرة الحالية موجودة</p>
                                )}
                                <InputError message={errors.thumbnail} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel value="المستندات الحالية" />
                                {existingDocuments.length > 0 ? (
                                    <div className="mt-2 space-y-2">
                                        {existingDocuments.map((doc, index) => (
                                            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                                <span className="text-sm text-gray-700">{doc.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveExistingDocument(doc.path)}
                                                    className="text-red-600 hover:text-red-800 text-sm"
                                                >
                                                    حذف
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 mt-1">لا توجد مستندات محملة</p>
                                )}
                            </div>

                            <div>
                                <InputLabel htmlFor="documents" value="إضافة مستندات جديدة" />
                                <input
                                    id="documents"
                                    name="documents"
                                    type="file"
                                    multiple
                                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                                    onChange={handleFileChange}
                                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                <p className="text-xs text-gray-500 mt-1">يمكنك اختيار ملفات متعددة</p>
                                <InputError message={errors.documents} className="mt-2" />

                                {formData.documents.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        <p className="text-sm font-medium text-gray-700">المستندات الجديدة:</p>
                                        {formData.documents.map((doc, index) => (
                                            <div key={index} className="flex items-center justify-between bg-blue-50 p-2 rounded">
                                                <span className="text-sm text-gray-700">{doc.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveNewDocument(index)}
                                                    className="text-red-600 hover:text-red-800 text-sm"
                                                >
                                                    حذف
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <InputLabel htmlFor="notes" value="ملاحظات" />
                                <TextArea
                                    id="notes"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    className="mt-1 block w-full"
                                    rows="4"
                                />
                                <InputError message={errors.notes} className="mt-2" />
                            </div>

                            <div className="flex items-center space-x-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="is_published"
                                        checked={formData.is_published}
                                        onChange={handleChange}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="mr-2 text-sm text-gray-700">نشر الدرس</span>
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t">
                                <SecondaryButton
                                    type="button"
                                    onClick={() => window.history.back()}
                                >
                                    إلغاء
                                </SecondaryButton>
                                <PrimaryButton disabled={processing}>
                                    {processing ? 'جاري التحديث...' : 'تحديث الدرس'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
