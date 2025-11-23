import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import TextArea from '@/Components/TextArea';
import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function CompleteProfile({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        name_ar: '',
        description: '',
        description_ar: '',
        address: '',
        address_ar: '',
        phone: '',
        email: '',
        website: '',
        logo: null,
    });

    const submit = (e) => {
        e.preventDefault();

        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== '') {
                formData.append(key, data[key]);
            }
        });

        post(route('school-admin.complete-profile'), {
            data: formData,
            forceFormData: true,
        });
    };

    return (
        <GuestLayout>
            <Head title="إكمال بيانات المدرسة" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-3xl mx-auto"
            >
                <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                            إكمال بيانات المدرسة
                        </h1>
                        <p className="text-gray-600">الرجاء إكمال البيانات الضرورية للمتابعة</p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel htmlFor="name" value="اسم المدرسة (إنجليزي) *" />
                                <TextInput
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    className="mt-2 block w-full"
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="School Name"
                                    required
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="name_ar" value="اسم المدرسة (عربي)" />
                                <TextInput
                                    id="name_ar"
                                    type="text"
                                    value={data.name_ar}
                                    className="mt-2 block w-full"
                                    onChange={(e) => setData('name_ar', e.target.value)}
                                    placeholder="اسم المدرسة"
                                />
                                <InputError message={errors.name_ar} className="mt-2" />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="description" value="وصف المدرسة (إنجليزي)" />
                            <TextArea
                                id="description"
                                value={data.description}
                                className="mt-2 block w-full"
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="About the school..."
                                rows="3"
                            />
                            <InputError message={errors.description} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="description_ar" value="وصف المدرسة (عربي)" />
                            <TextArea
                                id="description_ar"
                                value={data.description_ar}
                                className="mt-2 block w-full"
                                onChange={(e) => setData('description_ar', e.target.value)}
                                placeholder="نبذة عن المدرسة..."
                                rows="3"
                            />
                            <InputError message={errors.description_ar} className="mt-2" />
                        </div>

                        <div className="border-t pt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">معلومات الاتصال</h3>

                            <div className="space-y-4">
                                <div>
                                    <InputLabel htmlFor="address" value="العنوان (إنجليزي) *" />
                                    <TextArea
                                        id="address"
                                        value={data.address}
                                        className="mt-2 block w-full"
                                        onChange={(e) => setData('address', e.target.value)}
                                        placeholder="School address"
                                        rows="2"
                                        required
                                    />
                                    <InputError message={errors.address} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="address_ar" value="العنوان (عربي)" />
                                    <TextArea
                                        id="address_ar"
                                        value={data.address_ar}
                                        className="mt-2 block w-full"
                                        onChange={(e) => setData('address_ar', e.target.value)}
                                        placeholder="عنوان المدرسة"
                                        rows="2"
                                    />
                                    <InputError message={errors.address_ar} className="mt-2" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="phone" value="رقم الهاتف *" />
                                        <TextInput
                                            id="phone"
                                            type="tel"
                                            value={data.phone}
                                            className="mt-2 block w-full"
                                            onChange={(e) => setData('phone', e.target.value)}
                                            placeholder="0671486396"
                                            required
                                        />
                                        <InputError message={errors.phone} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="email" value="البريد الإلكتروني *" />
                                        <TextInput
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            className="mt-2 block w-full"
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="school@example.com"
                                            required
                                        />
                                        <InputError message={errors.email} className="mt-2" />
                                    </div>
                                </div>

                                <div>
                                    <InputLabel htmlFor="website" value="الموقع الإلكتروني (اختياري)" />
                                    <TextInput
                                        id="website"
                                        type="url"
                                        value={data.website}
                                        className="mt-2 block w-full"
                                        onChange={(e) => setData('website', e.target.value)}
                                        placeholder="https://www.school.com"
                                    />
                                    <InputError message={errors.website} className="mt-2" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <InputLabel value="شعار المدرسة (اختياري)" />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setData('logo', e.target.files[0])}
                                className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            <InputError message={errors.logo} className="mt-2" />
                            <p className="text-xs text-gray-500 mt-1">PNG, JPG أو JPEG (الحد الأقصى 2MB)</p>
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
