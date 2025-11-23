import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {useState, useEffect} from "react";
import { getExpectedBirthDateFromEducationLevel } from '@/Utils/ageCalculator';

export default function CompleteProfile({ auth, schools = [], categories = [] }) {
    const [subcategories, setSubcategories] = useState([]);
    const { data, setData, post, processing, errors } = useForm({
        student_id: '',
        birth_date: '',
        gender: 'male',
        parent_name: '',
        parent_phone: '',
        parent_email: '',
        address: '',
        address_ar: '',
        medical_info: '',
        enrollment_type: 'independent_teacher',
        school_id: '',
        class_id: '',
        education_category_id: '',
        education_subcategory_id: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('student.complete-profile'));
    };

    const handleCategoryChange = (categoryId) => {
        const selectedCategory = categories.find(c => c.id === parseInt(categoryId));
        setSubcategories(selectedCategory?.subcategories || []);
        setData({
            ...data,
            education_category_id: categoryId,
            education_subcategory_id: '',
        });
    };

    const handleSubcategoryChange = (subcategoryId) => {
        setData('education_subcategory_id', subcategoryId);

        const selectedSubcategory = subcategories.find(s => s.id === parseInt(subcategoryId));
        if (selectedSubcategory) {
            const expectedBirthDate = getExpectedBirthDateFromEducationLevel(
                selectedSubcategory.name_ar || selectedSubcategory.name
            );
            if (expectedBirthDate) {
                setData('birth_date', expectedBirthDate);
            }
        }
    };

    return (
        <GuestLayout>
            <Head title="إكمال بيانات الطالب" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-2xl mx-auto"
            >
                <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                            إكمال بيانات الطالب
                        </h1>
                        <p className="text-gray-600">الرجاء إكمال البيانات الضرورية للمتابعة</p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    المستوى التعليمي *
                                </label>
                                <select
                                    value={data.education_category_id}
                                    onChange={(e) => handleCategoryChange(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                >
                                    <option value="">اختر المستوى التعليمي</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name_ar}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    السنة الدراسية *
                                </label>
                                <select
                                    value={data.education_subcategory_id}
                                    onChange={(e) => handleSubcategoryChange(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                    disabled={!data.education_category_id}
                                >
                                    <option value="">اختر السنة الدراسية</option>
                                    {subcategories.map((sub) => (
                                        <option key={sub.id} value={sub.id}>
                                            {sub.name_ar}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-1 text-xs text-gray-500">
                                    سيتم حساب تاريخ الميلاد تلقائياً بناءً على السنة الدراسية
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel htmlFor="gender" value="الجنس *"/>
                                <select
                                    id="gender"
                                    value={data.gender}
                                    className="mt-2 block w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    onChange={(e) => setData('gender', e.target.value)}
                                    required
                                >
                                    <option value="male">ذكر</option>
                                    <option value="female">أنثى</option>
                                </select>
                                <InputError message={errors.gender} className="mt-2"/>
                            </div>
                            <div>
                                <InputLabel htmlFor="birth_date" value="تاريخ الميلاد *"/>
                                <TextInput
                                    id="birth_date"
                                    type="date"
                                    value={data.birth_date}
                                    className="mt-2 block w-full"
                                    onChange={(e) => setData('birth_date', e.target.value)}
                                    required
                                />
                                <InputError message={errors.birth_date} className="mt-2"/>
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="enrollment_type" value="نوع التسجيل *"/>
                            <select
                                id="enrollment_type"
                                value={data.enrollment_type}
                                className="mt-2 block w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                onChange={(e) => setData('enrollment_type', e.target.value)}
                                required
                            >
                                <option value="independent_teacher">البحث عن معلمين مستقلين</option>
                                <option value="school">البحث عن مدارس</option>
                            </select>
                            <InputError message={errors.enrollment_type} className="mt-2"/>
                        </div>

                        {data.enrollment_type === 'school' && schools.length > 0 && (
                            <div>
                                <InputLabel htmlFor="school_id" value="اختر المدرسة"/>
                                <select
                                    id="school_id"
                                    value={data.school_id}
                                    className="mt-2 block w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    onChange={(e) => setData('school_id', e.target.value)}
                                >
                                    <option value="">اختر المدرسة</option>
                                    {schools.map((school) => (
                                        <option key={school.id} value={school.id}>
                                            {school.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.school_id} className="mt-2"/>
                            </div>
                        )}

                        <div>
                            <InputLabel htmlFor="address" value="العنوان *"/>
                            <textarea
                                id="address"
                                value={data.address}
                                className="mt-2 block w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                onChange={(e) => setData('address', e.target.value)}
                                placeholder="أدخل العنوان"
                                rows="2"
                                required
                            />
                            <InputError message={errors.address} className="mt-2"/>
                        </div>

                        <div>
                            <InputLabel htmlFor="medical_info" value="معلومات طبية (اختياري)"/>
                            <textarea
                                id="medical_info"
                                value={data.medical_info}
                                className="mt-2 block w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                onChange={(e) => setData('medical_info', e.target.value)}
                                placeholder="أي معلومات طبية مهمة (حساسية، أمراض مزمنة، إلخ)"
                                rows="2"
                            />
                            <InputError message={errors.medical_info} className="mt-2"/>
                        </div>

                        <div className="border-t pt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">بيانات ولي الأمر (اختياري)</h3>

                            <div className="space-y-4">
                                <div>
                                    <InputLabel htmlFor="parent_name" value="اسم ولي الأمر"/>
                                    <TextInput
                                        id="parent_name"
                                        type="text"
                                        value={data.parent_name}
                                        className="mt-2 block w-full"
                                        onChange={(e) => setData('parent_name', e.target.value)}
                                        placeholder="أدخل اسم ولي الأمر"
                                    />
                                    <InputError message={errors.parent_name} className="mt-2"/>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="parent_phone" value="رقم هاتف ولي الأمر"/>
                                        <TextInput
                                            id="parent_phone"
                                            type="tel"
                                            value={data.parent_phone}
                                            className="mt-2 block w-full"
                                            onChange={(e) => setData('parent_phone', e.target.value)}
                                            placeholder="مثال: 0671486396"
                                        />
                                        <InputError message={errors.parent_phone} className="mt-2"/>
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="parent_email" value="بريد ولي الأمر"/>
                                        <TextInput
                                            id="parent_email"
                                            type="email"
                                            value={data.parent_email}
                                            className="mt-2 block w-full"
                                            onChange={(e) => setData('parent_email', e.target.value)}
                                            placeholder="optional@example.com"
                                        />
                                        <InputError message={errors.parent_email} className="mt-2"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <PrimaryButton
                            className="w-full justify-center py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                            disabled={processing}
                        >
                            {processing ? 'جاري الحفظ...' : 'حفظ والمتابعة'}
                        </PrimaryButton>
                    </form>
                </div>
            </motion.div>
        </GuestLayout>
    );
}
