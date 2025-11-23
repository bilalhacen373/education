import { Link, Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    AcademicCapIcon,
    UserGroupIcon,
    ChartBarIcon,
    GlobeAltIcon,
    StarIcon,
    PlayCircleIcon,
    BookOpenIcon,
} from '@heroicons/react/24/outline';

const FeatureCard = ({ icon: Icon, title, description, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.6 }}
        className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100"
    >
        <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
            <Icon className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
    </motion.div>
);

const StatCard = ({ number, label, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay, duration: 0.6 }}
        className="text-center"
    >
        <div className="text-4xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent mb-2">
            {number}
        </div>
        <div className="text-gray-600 font-medium">{label}</div>
    </motion.div>
);

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    return (
        <>
            <Head title="نظام إدارة التعليم" />
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50" dir="rtl">
                {/* Navigation */}
                <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center">
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                                    نظام إدارة التعليم
                                </h1>
                            </div>
                            <div className="flex items-center gap-6">
                                <Link
                                    href={route('public.courses')}
                                    className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
                                >
                                    الكورسات
                                </Link>
                                <Link
                                    href={route('public.lessons')}
                                    className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
                                >
                                    الدروس
                                </Link>
                                <Link
                                    href={route('public.classes')}
                                    className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
                                >
                                    الفصول
                                </Link>
                                <div className="h-6 w-px bg-gray-300"></div>
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
                                    >
                                        لوحة التحكم
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
                                        >
                                            تسجيل الدخول
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
                                        >
                                            إنشاء حساب
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="relative overflow-hidden py-20 lg:py-32">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                                    مستقبل التعليم
                                    <span className="block bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                                        يبدأ هنا
                                    </span>
                                </h1>
                                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                                    منصة شاملة لإدارة المدارس والتعليم الإلكتروني مع دعم كامل للغة العربية
                                    وأحدث التقنيات التعليمية
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Link
                                        href={route('register')}
                                        className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-200 text-center"
                                    >
                                        ابدأ مجاناً
                                    </Link>
                                    <Link
                                        href={route('public.courses')}
                                        className="flex items-center justify-center gap-3 border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-indigo-600 hover:text-indigo-600 transition-all duration-200"
                                    >
                                        <BookOpenIcon className="w-6 h-6" />
                                        تصفح الكورسات
                                    </Link>
                                </div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="relative"
                            >
                                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-8 shadow-2xl">
                                    <div className="bg-white rounded-2xl p-6">
                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <StatCard number="1000+" label="مدرسة" delay={0.4} />
                                            <StatCard number="50K+" label="طالب" delay={0.5} />
                                            <StatCard number="5K+" label="معلم" delay={0.6} />
                                            <StatCard number="99%" label="رضا العملاء" delay={0.7} />
                                        </div>
                                        <div className="flex items-center justify-center">
                                            <div className="flex -space-x-2 rtl:space-x-reverse">
                                                {[1, 2, 3, 4, 5].map((i) => (
                                                    <StarIcon key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                                                ))}
                                            </div>
                                            <span className="mr-3 text-gray-600 font-medium">تقييم ممتاز</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">
                                لماذا تختار منصتنا؟
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                نوفر حلولاً متكاملة لإدارة التعليم مع أحدث التقنيات وأفضل تجربة مستخدم
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <FeatureCard
                                icon={AcademicCapIcon}
                                title="إدارة شاملة للمدارس"
                                description="نظام متكامل لإدارة المدارس والفصول والطلاب والمعلمين مع واجهة سهلة الاستخدام"
                                delay={0.1}
                            />
                            <FeatureCard
                                icon={UserGroupIcon}
                                title="نظام أدوار متقدم"
                                description="صلاحيات مرنة للمديرين والمعلمين والطلاب مع إمكانية التحكم الكامل في الوصول"
                                delay={0.2}
                            />
                            <FeatureCard
                                icon={ChartBarIcon}
                                title="تقارير وإحصائيات"
                                description="تقارير مفصلة عن الأداء والحضور والدرجات مع رسوم بيانية تفاعلية"
                                delay={0.3}
                            />
                            <FeatureCard
                                icon={GlobeAltIcon}
                                title="بث مباشر متقدم"
                                description="نظام بث مباشر عالي الجودة للحصص الافتراضية مع إمكانية التسجيل والمشاركة"
                                delay={0.4}
                            />
                            <FeatureCard
                                icon={StarIcon}
                                title="نظام تقييم ذكي"
                                description="حساب الدرجات تلقائياً مع نظام تقييم مرن يدعم أنواع مختلفة من الاختبارات"
                                delay={0.5}
                            />
                            <FeatureCard
                                icon={PlayCircleIcon}
                                title="محتوى تفاعلي"
                                description="دعم جميع أنواع المحتوى التعليمي من فيديوهات ومستندات وأنشطة تفاعلية"
                                delay={0.6}
                            />
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 bg-gradient-to-r from-indigo-500 to-purple-600">
                    <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-4xl font-bold text-white mb-6">
                                ابدأ رحلتك التعليمية اليوم
                            </h2>
                            <p className="text-xl text-indigo-100 mb-8">
                                انضم إلى آلاف المدارس والمعلمين الذين يثقون في منصتنا
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href={route('register')}
                                    className="inline-block bg-white text-purple-600 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all duration-200"
                                >
                                    إنشاء حساب مجاني
                                </Link>
                                <Link
                                    href={route('public.courses')}
                                    className="inline-block bg-purple-700 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all duration-200"
                                >
                                    استكشف الكورسات
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-gray-900 text-white py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-4 gap-8">
                            <div>
                                <h3 className="text-2xl font-bold mb-4">نظام إدارة التعليم</h3>
                                <p className="text-gray-400">
                                    منصة شاملة لإدارة التعليم مع دعم كامل للغة العربية
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-4">المنتج</h4>
                                <ul className="space-y-2 text-gray-400">
                                    <li>الميزات</li>
                                    <li>الأسعار</li>
                                    <li>الدعم</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-4">الشركة</h4>
                                <ul className="space-y-2 text-gray-400">
                                    <li>من نحن</li>
                                    <li>اتصل بنا</li>
                                    <li>الوظائف</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-4">القانونية</h4>
                                <ul className="space-y-2 text-gray-400">
                                    <li>سياسة الخصوصية</li>
                                    <li>شروط الاستخدام</li>
                                    <li>ملفات تعريف الارتباط</li>
                                </ul>
                            </div>
                        </div>
                        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                            <p>&copy; 2024 نظام إدارة التعليم. جميع الحقوق محفوظة.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
