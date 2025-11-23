import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    AcademicCapIcon,
    BookOpenIcon,
    CreditCardIcon,
    CheckCircleIcon,
    XCircleIcon,
} from '@heroicons/react/24/outline';

export default function CourseCheckout({ auth, course, totalAmount, coursePrice, enrollmentFee }) {
    const { data, setData, post, processing, errors } = useForm({
        payment_method: 'direct',
        amount: totalAmount,
        message: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('public.courses.process-payment', course.id));
    };

    return (
        <>
            <Head title={`الدفع - ${course.title_ar}`} />
            <div className="min-h-screen bg-gray-50" dir="rtl">
                <nav className="bg-white shadow-sm border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <Link href="/" className="text-2xl font-bold text-blue-600">
                                نظام إدارة التعليم
                            </Link>
                            <div className="flex items-center gap-4">
                                <Link
                                    href={route('public.courses')}
                                    className="text-gray-700 hover:text-blue-600 font-medium"
                                >
                                    الكورسات
                                </Link>
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                    >
                                        لوحة التحكم
                                    </Link>
                                ) : (
                                    <Link
                                        href={route('login')}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                    >
                                        تسجيل الدخول
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                <div className="py-12">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6"
                        >
                            <Link
                                href={route('public.courses.show', course.id)}
                                className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2"
                            >
                                ← العودة للكورس
                            </Link>
                        </motion.div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-lg shadow-sm p-6"
                                >
                                    <h1 className="text-2xl font-bold text-gray-900 mb-6">
                                        إتمام عملية الدفع
                                    </h1>

                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                        <div className="flex items-start gap-3">
                                            <CreditCardIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <h3 className="font-semibold text-blue-900 mb-1">
                                                    طريقة الدفع المباشر
                                                </h3>
                                                <p className="text-sm text-blue-800">
                                                    يرجى إكمال نموذج الدفع أدناه. سيتم مراجعة طلبك والتواصل معك لإتمام عملية الدفع.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                طريقة الدفع
                                            </label>
                                            <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                                                <label className="flex items-center cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="payment_method"
                                                        value="direct"
                                                        checked={data.payment_method === 'direct'}
                                                        onChange={(e) => setData('payment_method', e.target.value)}
                                                        className="w-4 h-4 text-blue-600"
                                                    />
                                                    <span className="mr-3 font-medium text-gray-900">
                                                        دفع مباشر
                                                    </span>
                                                </label>
                                                <p className="text-sm text-gray-600 mr-7 mt-1">
                                                    سيتم التواصل معك من قبل الإدارة لإتمام عملية الدفع
                                                </p>
                                            </div>
                                            {errors.payment_method && (
                                                <p className="mt-1 text-sm text-red-600">{errors.payment_method}</p>
                                            )}
                                        </div>

                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                رسالة للمعلم (اختياري)
                                            </label>
                                            <textarea
                                                value={data.message}
                                                onChange={(e) => setData('message', e.target.value)}
                                                rows="4"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="اكتب رسالة توضح سبب رغبتك بالتسجيل في الكورس..."
                                            />
                                            {errors.message && (
                                                <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                                            )}
                                        </div>

                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                            <div className="flex gap-3">
                                                <CheckCircleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                                <div className="text-sm text-yellow-800">
                                                    <p className="font-medium mb-1">ملاحظات هامة:</p>
                                                    <ul className="list-disc mr-5 space-y-1">
                                                        <li>سيتم مراجعة طلبك خلال 24-48 ساعة</li>
                                                        <li>ستتلقى إشعاراً عند الموافقة على الطلب</li>
                                                        <li>يمكنك متابعة حالة الطلب من لوحة التحكم</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>

                                        {errors.error && (
                                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                                <div className="flex gap-3">
                                                    <XCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0" />
                                                    <p className="text-sm text-red-800">{errors.error}</p>
                                                </div>
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {processing ? 'جارٍ المعالجة...' : 'تأكيد الطلب'}
                                        </button>
                                    </form>
                                </motion.div>
                            </div>

                            <div className="lg:col-span-1">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-white rounded-lg shadow-sm p-6 sticky top-6"
                                >
                                    <h2 className="text-lg font-bold text-gray-900 mb-4">
                                        ملخص الطلب
                                    </h2>

                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3 pb-4 border-b">
                                            {course.image && (
                                                <img
                                                    src={`/storage/${course.image}`}
                                                    alt={course.title_ar}
                                                    className="w-16 h-16 rounded object-cover"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            )}
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 line-clamp-2">
                                                    {course.title_ar}
                                                </h3>
                                                <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                                                    <AcademicCapIcon className="w-4 h-4" />
                                                    <span>{course.teacher?.user?.name}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3 pb-4 border-b">
                                            {coursePrice > 0 && (
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600">سعر الكورس</span>
                                                    <span className="font-medium text-gray-900">{coursePrice} دج</span>
                                                </div>
                                            )}
                                            {enrollmentFee > 0 && (
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600">رسوم التسجيل</span>
                                                    <span className="font-medium text-gray-900">{enrollmentFee} دج</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-bold text-gray-900">المجموع</span>
                                            <span className="text-2xl font-bold text-blue-600">{totalAmount} دج</span>
                                        </div>

                                        {course.subjects && course.subjects.length > 0 && (
                                            <div className="pt-4 border-t">
                                                <div className="flex items-start gap-2 text-sm">
                                                    <BookOpenIcon className="w-4 h-4 text-gray-600 mt-0.5" />
                                                    <div>
                                                        <p className="text-gray-600 mb-1">المواد:</p>
                                                        <p className="text-gray-900 font-medium">
                                                            {course.subjects.map(s => s.name_ar).join(', ')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
