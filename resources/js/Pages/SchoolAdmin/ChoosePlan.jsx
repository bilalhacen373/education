import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { CheckIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

export default function ChoosePlan({ auth, plans, currentSubscription }) {
    const handleSelectPlan = (plan) => {
        if (currentSubscription) {
            toast.error('لديك اشتراك نشط بالفعل');
            return;
        }

        router.post(route('subscriptions.subscribe', plan.id), {
            onSuccess: () => {
                toast.success('جاري معالجة الاشتراك');
            },
            onError: (errors) => {
                toast.error(errors.error || 'حدث خطأ أثناء الاشتراك');
            },
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
            <Head title="اختر الباقة المناسبة" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-bold text-gray-900 mb-4"
                    >
                        اختر الباقة المناسبة لمدرستك
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-gray-600"
                    >
                        ابدأ بتطوير مدرستك مع أفضل الخدمات التعليمية
                    </motion.p>
                </div>

                {currentSubscription && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 bg-green-50 border-r-4 border-green-500 p-4 rounded-lg"
                    >
                        <div className="flex">
                            <CheckIcon className="h-6 w-6 text-green-500 ml-3" />
                            <div>
                                <h3 className="text-lg font-semibold text-green-900">
                                    لديك اشتراك نشط
                                </h3>
                                <p className="text-green-700 mt-1">
                                    الباقة الحالية: {currentSubscription.plan.name_ar || currentSubscription.plan.name}
                                </p>
                                <p className="text-sm text-green-600 mt-1">
                                    تنتهي في: {new Date(currentSubscription.end_date).toLocaleDateString('ar')}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative bg-white rounded-2xl shadow-lg overflow-hidden ${
                                plan.is_popular
                                    ? 'ring-2 ring-blue-500 transform scale-105'
                                    : 'hover:shadow-xl transition-shadow'
                            }`}
                        >
                            {plan.is_popular && (
                                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-green-600 text-white text-center py-2 text-sm font-semibold">
                                    الأكثر شعبية
                                </div>
                            )}

                            <div className={`p-8 ${plan.is_popular ? 'pt-16' : ''}`}>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    {plan.name_ar || plan.name}
                                </h3>
                                <p className="text-gray-600 mb-6 min-h-[3rem]">
                                    {plan.description_ar || plan.description}
                                </p>

                                <div className="mb-6">
                                    <div className="flex items-baseline">
                                        <span className="text-5xl font-extrabold text-gray-900">
                                            {plan.price}
                                        </span>
                                        <span className="text-xl text-gray-600 mr-2 rtl:ml-2">دج</span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {plan.billing_cycle === 'monthly' ? 'شهرياً' : 'سنوياً'}
                                    </p>
                                </div>

                                <ul className="space-y-4 mb-8">
                                    {plan.features && Array.isArray(plan.features) && plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start">
                                            <CheckIcon className="h-6 w-6 text-green-500 ml-2 flex-shrink-0" />
                                            <span className="text-gray-700">{feature}</span>
                                        </li>
                                    ))}
                                    <li className="flex items-start">
                                        <CheckIcon className="h-6 w-6 text-green-500 ml-2 flex-shrink-0" />
                                        <span className="text-gray-700">
                                            {plan.max_students ? `حتى ${plan.max_students} طالب` : 'عدد طلاب غير محدود'}
                                        </span>
                                    </li>
                                    <li className="flex items-start">
                                        <CheckIcon className="h-6 w-6 text-green-500 ml-2 flex-shrink-0" />
                                        <span className="text-gray-700">
                                            {plan.max_teachers ? `حتى ${plan.max_teachers} معلم` : 'عدد معلمين غير محدود'}
                                        </span>
                                    </li>
                                    <li className="flex items-start">
                                        <CheckIcon className="h-6 w-6 text-green-500 ml-2 flex-shrink-0" />
                                        <span className="text-gray-700">
                                            {plan.max_classes ? `حتى ${plan.max_classes} صف` : 'عدد صفوف غير محدود'}
                                        </span>
                                    </li>
                                </ul>

                                <button
                                    onClick={() => handleSelectPlan(plan)}
                                    disabled={currentSubscription}
                                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                                        plan.is_popular
                                            ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white hover:from-blue-700 hover:to-green-700 shadow-lg'
                                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {currentSubscription ? 'اشتراك نشط' : 'اختر هذه الباقة'}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-12 text-center"
                >
                    <p className="text-gray-600 mb-4">
                        هل لديك أسئلة؟ نحن هنا للمساعدة
                    </p>
                    <a
                        href="mailto:support@example.com"
                        className="text-blue-600 hover:text-blue-700 font-semibold"
                    >
                        تواصل مع الدعم الفني
                    </a>
                </motion.div>
            </div>
        </div>
    );
}
