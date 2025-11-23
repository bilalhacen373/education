import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    AcademicCapIcon,
    UserGroupIcon,
    ChartBarIcon,
    CalendarIcon,
    CurrencyDollarIcon,
    BookOpenIcon,
    ClockIcon,
    StarIcon,
    CheckCircleIcon,
} from '@heroicons/react/24/outline';

const StatCard = ({ title, value, icon: Icon, color, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.6 }}
        className={`bg-gradient-to-r ${color} rounded-xl p-6 text-white`}
    >
        <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
            <div>
                <p className="text-white/80 text-sm">{title}</p>
                <p className="text-3xl font-bold">{value}</p>
            </div>
            <Icon className="w-12 h-12 text-white/60" />
        </div>
    </motion.div>
);

const ActivityCard = ({ activity, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay, duration: 0.6 }}
        className="flex items-center space-x-3 rtl:space-x-reverse p-4 bg-gray-50 rounded-lg"
    >
        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
        <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{activity.title}</p>
            <p className="text-xs text-gray-500">{activity.time}</p>
        </div>
    </motion.div>
);

const SessionCard = ({ session, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay, duration: 0.6 }}
        className="bg-white rounded-lg p-4 border border-gray-200"
    >
        <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">{session.title}</h4>
            <span className="text-xs text-gray-500">{session.subject}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
            <CalendarIcon className="w-4 h-4 ml-1" />
            <span>{session.time}</span>
        </div>
    </motion.div>
);

export default function Dashboard({ auth, stats = {}, recentActivities = [], upcomingSessions = [] }) {
    const userType = auth.user.user_type;

    const getStatsForUserType = () => {
        switch (userType) {
            case 'super_admin':
                return [
                    { title: 'إجمالي المدارس', value: stats.total_schools || 0, icon: AcademicCapIcon, color: 'from-blue-500 to-blue-600' },
                    { title: 'إجمالي المعلمين', value: stats.total_teachers || 0, icon: UserGroupIcon, color: 'from-green-500 to-green-600' },
                    { title: 'إجمالي الطلاب', value: stats.total_students || 0, icon: UserGroupIcon, color: 'from-purple-500 to-purple-600' },
                    { title: 'الإيرادات الشهرية', value: `${stats.monthly_revenue || 0}دج`, icon: CurrencyDollarIcon, color: 'from-yellow-500 to-yellow-600' },
                ];
            case 'school_admin':
                return [
                    { title: 'المعلمين', value: stats.teachers_count || 0, icon: UserGroupIcon, color: 'from-blue-500 to-blue-600' },
                    { title: 'الطلاب', value: stats.students_count || 0, icon: UserGroupIcon, color: 'from-green-500 to-green-600' },
                    { title: 'الفصول', value: stats.classes_count || 0, icon: AcademicCapIcon, color: 'from-purple-500 to-purple-600' },
                    { title: 'معدل الحضور', value: `${stats.attendance_rate || 0}%`, icon: ChartBarIcon, color: 'from-orange-500 to-orange-600' },
                ];
            case 'teacher':
                return [
                    { title: 'فصولي', value: stats.my_classes || 0, icon: AcademicCapIcon, color: 'from-blue-500 to-blue-600' },
                    { title: 'طلابي', value: stats.my_students || 0, icon: UserGroupIcon, color: 'from-green-500 to-green-600' },
                    { title: 'كورساتي', value: stats.my_courses || 0, icon: BookOpenIcon, color: 'from-purple-500 to-purple-600' },
                    { title: 'الجلسات المباشرة', value: stats.live_sessions || 0, icon: CalendarIcon, color: 'from-orange-500 to-orange-600' },
                ];
            case 'student':
                return [
                    { title: 'الكورسات المسجلة', value: stats.enrolled_courses || 0, icon: BookOpenIcon, color: 'from-blue-500 to-blue-600' },
                    { title: 'الدروس المكتملة', value: stats.completed_lessons || 0, icon: CheckCircleIcon, color: 'from-green-500 to-green-600' },
                    { title: 'معدل التقدم', value: `${Math.round(stats.progress_rate || 0)}%`, icon: ChartBarIcon, color: 'from-purple-500 to-purple-600' },
                    { title: 'متوسط الدرجات', value: `${Math.round(stats.average_grade || 0)}%`, icon: StarIcon, color: 'from-yellow-500 to-yellow-600' },
                ];
            default:
                return [];
        }
    };

    const statsData = getStatsForUserType();

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">لوحة التحكم</h2>}
        >
            <Head title="لوحة التحكم" />

            <div className="space-y-6">
                {/* Welcome Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white"
                >
                    <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">
                                مرحباً، {auth.user.name}
                            </h1>
                            <p className="text-indigo-100">
                                {userType === 'super_admin' && 'مرحباً بك في لوحة تحكم المدير العام'}
                                {userType === 'school_admin' && 'مرحباً بك في لوحة تحكم إدارة المدرسة'}
                                {userType === 'teacher' && 'مرحباً بك في لوحة تحكم المعلم'}
                                {userType === 'student' && 'مرحباً بك في لوحة تحكم الطالب'}
                            </p>
                        </div>
                        <div className="hidden md:block">
                            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                                <UserGroupIcon className="w-12 h-12 text-white" />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statsData.map((stat, index) => (
                        <StatCard
                            key={stat.title}
                            title={stat.title}
                            value={stat.value}
                            icon={stat.icon}
                            color={stat.color}
                            delay={index * 0.1}
                        />
                    ))}
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Activities */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white rounded-xl shadow-lg p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">الأنشطة الأخيرة</h3>
                            <ClockIcon className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="space-y-4">
                            {recentActivities.length > 0 ? (
                                recentActivities.map((activity, index) => (
                                    <ActivityCard
                                        key={index}
                                        activity={activity}
                                        delay={0.5 + index * 0.1}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <ClockIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">لا توجد أنشطة حديثة</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Upcoming Sessions */}
                    {(userType === 'teacher' || userType === 'student') && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-white rounded-xl shadow-lg p-6"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">الجلسات القادمة</h3>
                                <CalendarIcon className="w-5 h-5 text-gray-400" />
                            </div>
                            <div className="space-y-4">
                                {upcomingSessions.length > 0 ? (
                                    upcomingSessions.map((session, index) => (
                                        <SessionCard
                                            key={index}
                                            session={session}
                                            delay={0.6 + index * 0.1}
                                        />
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500">لا توجد جلسات قادمة</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Quick Actions for School Admin */}
                    {userType === 'school_admin' && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-white rounded-xl shadow-lg p-6"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">إجراءات سريعة</h3>
                                <AcademicCapIcon className="w-5 h-5 text-gray-400" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <a
                                    href="/teachers"
                                    className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                    <UserGroupIcon className="w-8 h-8 text-blue-600 mb-2" />
                                    <p className="text-sm font-medium text-blue-900">إدارة المعلمين</p>
                                </a>
                                <a
                                    href="/students"
                                    className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                                >
                                    <UserGroupIcon className="w-8 h-8 text-green-600 mb-2" />
                                    <p className="text-sm font-medium text-green-900">إدارة الطلاب</p>
                                </a>
                                <a
                                    href="/classes"
                                    className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                                >
                                    <AcademicCapIcon className="w-8 h-8 text-purple-600 mb-2" />
                                    <p className="text-sm font-medium text-purple-900">إدارة الفصول</p>
                                </a>
                                <a
                                    href="/reports"
                                    className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                                >
                                    <ChartBarIcon className="w-8 h-8 text-orange-600 mb-2" />
                                    <p className="text-sm font-medium text-orange-900">التقارير</p>
                                </a>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
