import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import TextArea from '@/Components/TextArea';
import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function CompleteProfile({ auth, schools = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        gender: 'male',
        address: '',
        address_ar: '',
        birth_date: '',
        specialization: '',
        specialization_ar: '',
        qualifications: '',
        qualifications_ar: '',
        experience_years: 0,
        hourly_rate: '',
        monthly_salary: '',
        hire_date: '',
        employment_type: 'full_time',
        subjects: [],
        is_available_for_hire: false,
        school_id: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('teacher.complete-profile'));
    };

    return (
        <GuestLayout>
            <Head title="إكمال بيانات المعلم" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-3xl mx-auto"
            >
                <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                            إكمال بيانات المعلم
                        </h1>
                        <p className="text-gray-600">الرجاء إكمال البيانات الضرورية للمتابعة</p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel htmlFor="gender" value="الجنس"/>
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
                                <InputLabel htmlFor="birth_date" value="تاريخ الميلاد"/>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel htmlFor="specialization" value="التخصص (إنجليزي)"/>
                                <TextInput
                                    id="specialization"
                                    type="text"
                                    value={data.specialization}
                                    className="mt-2 block w-full"
                                    onChange={(e) => setData('specialization', e.target.value)}
                                    placeholder="Mathematics, Physics, etc."
                                />
                                <InputError message={errors.specialization} className="mt-2"/>
                            </div>

                            <div>
                                <InputLabel htmlFor="specialization_ar" value="التخصص (عربي)"/>
                                <TextInput
                                    id="specialization_ar"
                                    type="text"
                                    value={data.specialization_ar}
                                    className="mt-2 block w-full"
                                    onChange={(e) => setData('specialization_ar', e.target.value)}
                                    placeholder="الرياضيات، الفيزياء، إلخ"
                                />
                                <InputError message={errors.specialization_ar} className="mt-2"/>
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="qualifications" value="المؤهلات (إنجليزي)"/>
                            <TextArea
                                id="qualifications"
                                value={data.qualifications}
                                className="mt-2 block w-full"
                                onChange={(e) => setData('qualifications', e.target.value)}
                                placeholder="Bachelor's in Education, Master's in Mathematics, etc."
                                rows="3"
                            />
                            <InputError message={errors.qualifications} className="mt-2"/>
                        </div>

                        <div>
                            <InputLabel htmlFor="qualifications_ar" value="المؤهلات (عربي)"/>
                            <TextArea
                                id="qualifications_ar"
                                value={data.qualifications_ar}
                                className="mt-2 block w-full"
                                onChange={(e) => setData('qualifications_ar', e.target.value)}
                                placeholder="بكالوريوس في التربية، ماجستير في الرياضيات، إلخ"
                                rows="3"
                            />
                            <InputError message={errors.qualifications_ar} className="mt-2"/>
                        </div>
                        <div>
                            <InputLabel htmlFor="address_ar" value="العنوان"/>
                            <textarea
                                id="address_ar"
                                value={data.address_ar}
                                className="mt-2 block w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                onChange={(e) => setData('address_ar', e.target.value)}
                                placeholder="أدخل العنوان"
                                rows="2"
                            />
                            <InputError message={errors.address_ar} className="mt-2"/>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel htmlFor="experience_years" value="سنوات الخبرة *"/>
                                <TextInput
                                    id="experience_years"
                                    type="number"
                                    value={data.experience_years}
                                    className="mt-2 block w-full"
                                    onChange={(e) => setData('experience_years', e.target.value)}
                                    min="0"
                                    required
                                />
                                <InputError message={errors.experience_years} className="mt-2"/>
                            </div>

                            <div>
                                <InputLabel htmlFor="employment_type" value="نوع التوظيف *"/>
                                <select
                                    id="employment_type"
                                    value={data.employment_type}
                                    className="mt-2 block w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    onChange={(e) => setData('employment_type', e.target.value)}
                                    required
                                >
                                    <option value="full_time">دوام كامل</option>
                                    <option value="part_time">دوام جزئي</option>
                                    <option value="contract">عقد</option>
                                    <option value="freelance">مستقل</option>
                                </select>
                                <InputError message={errors.employment_type} className="mt-2"/>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel htmlFor="hourly_rate" value="الأجر بالساعة (اختياري)"/>
                                <TextInput
                                    id="hourly_rate"
                                    type="number"
                                    value={data.hourly_rate}
                                    className="mt-2 block w-full"
                                    onChange={(e) => setData('hourly_rate', e.target.value)}
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                />
                                <InputError message={errors.hourly_rate} className="mt-2"/>
                            </div>

                            <div>
                                <InputLabel htmlFor="monthly_salary" value="الراتب الشهري (اختياري)"/>
                                <TextInput
                                    id="monthly_salary"
                                    type="number"
                                    value={data.monthly_salary}
                                    className="mt-2 block w-full"
                                    onChange={(e) => setData('monthly_salary', e.target.value)}
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                />
                                <InputError message={errors.monthly_salary} className="mt-2"/>
                            </div>
                        </div>

                        {/*{schools.length > 0 && (*/}
                        {/*    <div>*/}
                        {/*        <InputLabel htmlFor="school_id" value="المدرسة (اختياري)" />*/}
                        {/*        <select*/}
                        {/*            id="school_id"*/}
                        {/*            value={data.school_id}*/}
                        {/*            className="mt-2 block w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"*/}
                        {/*            onChange={(e) => setData('school_id', e.target.value)}*/}
                        {/*        >*/}
                        {/*            <option value="">معلم مستقل</option>*/}
                        {/*            {schools.map((school) => (*/}
                        {/*                <option key={school.id} value={school.id}>*/}
                        {/*                    {school.name_ar || school.name}*/}
                        {/*                </option>*/}
                        {/*            ))}*/}
                        {/*        </select>*/}
                        {/*        <InputError message={errors.school_id} className="mt-2" />*/}
                        {/*    </div>*/}
                        {/*)}*/}

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="is_available_for_hire"
                                checked={data.is_available_for_hire}
                                onChange={(e) => setData('is_available_for_hire', e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                            />
                            <label htmlFor="is_available_for_hire" className="mr-2 text-sm text-gray-700">
                                متاح للتوظيف من قبل مدارس أخرى
                            </label>
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
