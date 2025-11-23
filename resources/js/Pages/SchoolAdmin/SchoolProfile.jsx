import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ImageUpload from '@/Components/ImageUpload';
import TextInput from '@/Components/TextInput';
import TextArea from '@/Components/TextArea';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import toast from 'react-hot-toast';

export default function SchoolProfile({ auth, school, hasSchool }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: school?.name || '',
        name_en: school?.name_en || '',
        description: school?.description || '',
        email: school?.email || '',
        phone: school?.phone || '',
        address: school?.address || '',
        city: school?.city || '',
        country: school?.country || 'Saudi Arabia',
        logo: null,
        background_image: null,
        terms_and_conditions: school?.terms_and_conditions || '',
        is_active: school?.is_active ?? true,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setData(name, type === 'checkbox' ? checked : value);
    };

    const handleLogoUpload = (file) => {
        setData('logo', file?.path || null);
    };

    const handleBackgroundUpload = (file) => {
        setData('background_image', file?.path || null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const url = school ? `/school-admin/school/${school.id}` : '/school-admin/school';

        if (school) {
            post(url, {
                forceFormData: true,
                _method: 'PUT',
                onSuccess: () => {
                    toast.success('تم تحديث المدرسة بنجاح');
                },
                onError: (errors) => {
                    toast.error('يرجى تصحيح الأخطاء');
                    console.error('Errors:', errors);
                },
            });
        } else {
            post(url, {
                forceFormData: true,
                onSuccess: () => {
                    toast.success('تم إنشاء المدرسة بنجاح');
                },
                onError: (errors) => {
                    toast.error('يرجى تصحيح الأخطاء');
                    console.error('Errors:', errors);
                },
            });
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={school ? 'تعديل المدرسة' : 'إنشاء مدرسة'} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">
                            {school ? 'إدارة المدرسة' : 'إنشاء مدرسة جديدة'}
                        </h1>
                        <p className="mt-2 text-sm text-gray-600">
                            قم بإدارة معلومات المدرسة والصور الخاصة بها
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">صور المدرسة</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel value="شعار المدرسة" />
                                    <ImageUpload
                                        currentImage={school?.logo ? `/storage/${school.logo}` : null}
                                        folder="schools/logos"
                                        onUploadComplete={handleLogoUpload}
                                        label="رفع الشعار"
                                        aspectRatio="square"
                                        className="mt-2"
                                    />
                                    <InputError message={errors.logo} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel value="صورة الخلفية" />
                                    <ImageUpload
                                        currentImage={school?.background_image ? `/storage/${school.background_image}` : null}
                                        folder="schools/backgrounds"
                                        onUploadComplete={handleBackgroundUpload}
                                        label="رفع الخلفية"
                                        aspectRatio="video"
                                        className="mt-2"
                                    />
                                    <InputError message={errors.background_image} className="mt-2" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">المعلومات الأساسية</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel htmlFor="name" value="اسم المدرسة (عربي)" />
                                    <TextInput
                                        id="name"
                                        name="name"
                                        value={data.name}
                                        onChange={handleChange}
                                        className="mt-1 block w-full"
                                        required
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="name_en" value="اسم المدرسة (إنجليزي)" />
                                    <TextInput
                                        id="name_en"
                                        name="name_en"
                                        value={data.name_en}
                                        onChange={handleChange}
                                        className="mt-1 block w-full"
                                    />
                                    <InputError message={errors.name_en} className="mt-2" />
                                </div>

                                <div className="md:col-span-2">
                                    <InputLabel htmlFor="description" value="وصف المدرسة" />
                                    <TextArea
                                        id="description"
                                        name="description"
                                        value={data.description}
                                        onChange={handleChange}
                                        className="mt-1 block w-full"
                                        rows={4}
                                    />
                                    <InputError message={errors.description} className="mt-2" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">معلومات الاتصال</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel htmlFor="email" value="البريد الإلكتروني" />
                                    <TextInput
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={data.email}
                                        onChange={handleChange}
                                        className="mt-1 block w-full"
                                        required
                                    />
                                    <InputError message={errors.email} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="phone" value="رقم الهاتف" />
                                    <TextInput
                                        id="phone"
                                        name="phone"
                                        value={data.phone}
                                        onChange={handleChange}
                                        className="mt-1 block w-full"
                                        required
                                    />
                                    <InputError message={errors.phone} className="mt-2" />
                                </div>

                                <div className="md:col-span-2">
                                    <InputLabel htmlFor="address" value="العنوان" />
                                    <TextInput
                                        id="address"
                                        name="address"
                                        value={data.address}
                                        onChange={handleChange}
                                        className="mt-1 block w-full"
                                        required
                                    />
                                    <InputError message={errors.address} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="city" value="المدينة" />
                                    <TextInput
                                        id="city"
                                        name="city"
                                        value={data.city}
                                        onChange={handleChange}
                                        className="mt-1 block w-full"
                                        required
                                    />
                                    <InputError message={errors.city} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="country" value="الدولة" />
                                    <select
                                        id="country"
                                        name="country"
                                        value={data.country}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                                        required
                                    >
                                        <option value="Saudi Arabia">المملكة العربية السعودية</option>
                                        <option value="Egypt">مصر</option>
                                        <option value="UAE">الإمارات العربية المتحدة</option>
                                        <option value="Kuwait">الكويت</option>
                                        <option value="Qatar">قطر</option>
                                        <option value="Bahrain">البحرين</option>
                                        <option value="Oman">عمان</option>
                                        <option value="Jordan">الأردن</option>
                                        <option value="Lebanon">لبنان</option>
                                        <option value="Palestine">فلسطين</option>
                                        <option value="Iraq">العراق</option>
                                        <option value="Syria">سوريا</option>
                                    </select>
                                    <InputError message={errors.country} className="mt-2" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">الشروط والأحكام</h2>
                            <TextArea
                                id="terms_and_conditions"
                                name="terms_and_conditions"
                                value={data.terms_and_conditions}
                                onChange={handleChange}
                                className="mt-1 block w-full"
                                rows={6}
                                placeholder="أدخل الشروط والأحكام الخاصة بمدرستك..."
                            />
                            <InputError message={errors.terms_and_conditions} className="mt-2" />
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={data.is_active}
                                    onChange={handleChange}
                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                                />
                                <span className="mr-2 text-sm text-gray-700">المدرسة نشطة</span>
                            </label>
                        </div>

                        <div className="flex items-center justify-end space-x-4 rtl:space-x-reverse">
                            <button
                                type="button"
                                onClick={() => router.visit(route('dashboard'))}
                                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                            >
                                إلغاء
                            </button>
                            <PrimaryButton disabled={processing}>
                                {processing ? 'جاري الحفظ...' : school ? 'تحديث المدرسة' : 'إنشاء المدرسة'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
