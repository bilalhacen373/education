import { useEffect } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        user_type: 'student',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <GuestLayout>
            <Head title="إنشاء حساب" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md mx-auto"
            >
                <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                            إنشاء حساب جديد
                        </h1>
                        <p className="text-gray-600">انضم إلى منصة التعليم الرائدة</p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <InputLabel htmlFor="name" value="الاسم الكامل" />
                            <TextInput
                                id="name"
                                name="name"
                                value={data.name}
                                className="mt-2 block w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                autoComplete="name"
                                isFocused={true}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="أدخل اسمك الكامل"
                                required
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="email" value="البريد الإلكتروني" />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-2 block w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                autoComplete="username"
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="أدخل بريدك الإلكتروني"
                                required
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="phone" value="رقم الهاتف" />
                            <TextInput
                                dir="rtl"
                                id="phone"
                                type="tel"
                                name="phone"
                                value={data.phone}
                                className="mt-2 block w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                onChange={(e) => setData('phone', e.target.value)}
                                placeholder="مثال: 0671486396"
                            />
                            <InputError message={errors.phone} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="user_type" value="نوع الحساب" />
                            <select
                                id="user_type"
                                name="user_type"
                                value={data.user_type}
                                className="mt-2 block w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                onChange={(e) => setData('user_type', e.target.value)}
                                required
                            >
                                <option value="student">طالب</option>
                                <option value="teacher">معلم</option>
                                <option value="school_admin">مدير مدرسة</option>
                            </select>
                            <InputError message={errors.user_type} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password" value="كلمة المرور" />
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-2 block w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                autoComplete="new-password"
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="أدخل كلمة مرور قوية"
                                required
                            />
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password_confirmation" value="تأكيد كلمة المرور" />
                            <TextInput
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className="mt-2 block w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                autoComplete="new-password"
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                placeholder="أعد إدخال كلمة المرور"
                                required
                            />
                            <InputError message={errors.password_confirmation} className="mt-2" />
                        </div>

                        <PrimaryButton
                            className="w-full justify-center py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                            disabled={processing}
                        >
                            {processing ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
                        </PrimaryButton>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            لديك حساب بالفعل؟{' '}
                            <Link
                                href={route('login')}
                                className="text-indigo-600 hover:text-indigo-500 font-medium transition-colors"
                            >
                                تسجيل الدخول
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </GuestLayout>
    );
}
