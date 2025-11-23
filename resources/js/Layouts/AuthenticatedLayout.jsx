import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bars3Icon,
    XMarkIcon,
    HomeIcon,
    AcademicCapIcon,
    UserGroupIcon,
    CalendarIcon,
    CurrencyDollarIcon,
    ChartBarIcon,
    CogIcon,
    BellIcon,
    UserCircleIcon,
    BookOpenIcon,
    InboxIcon,
    VideoCameraIcon,
    BriefcaseIcon
} from '@heroicons/react/24/outline';

const navigation = {
    super_admin: [
        { name: 'لوحة التحكم', name_en: 'Dashboard', href: '/dashboard', icon: HomeIcon },
        { name: 'الخطط والعروض', name_en: 'Plans & Offers', href: '/admin/plans', icon: CurrencyDollarIcon },
        { name: 'المدفوعات', name_en: 'Payments', href: '/admin/payments', icon: CurrencyDollarIcon },
        { name: 'التقارير', name_en: 'Reports', href: '/admin/reports', icon: ChartBarIcon },
        { name: 'فئات التعليم', name_en: 'Education Categories', href: '/admin/education-categories', icon: BookOpenIcon },
        { name: 'الإعدادات', name_en: 'Settings', href: '/admin/settings', icon: CogIcon },
    ],

    school_admin: [
        { name: 'لوحة التحكم', name_en: 'Dashboard', href: '/dashboard', icon: HomeIcon },
        { name: 'المدرسة', name_en: 'School', href: '/school-admin/school', icon: AcademicCapIcon },
        { name: 'المعلمين', name_en: 'Teachers', href: '/school-admin/teachers', icon: UserGroupIcon },
        { name: 'الطلاب', name_en: 'Students', href: '/school-admin/students', icon: UserGroupIcon },
        { name: 'الفصول', name_en: 'Classes', href: '/school-admin/classes', icon: AcademicCapIcon },
        { name: 'المواد', name_en: 'Subjects', href: '/school-admin/subjects', icon: BookOpenIcon },
        { name: 'الجدول الزمني', name_en: 'Timetable', href: '/school-admin/timetable', icon: CalendarIcon },
        { name: 'المدفوعات', name_en: 'Payments', href: '/school-admin/payments', icon: CurrencyDollarIcon },
        { name: 'الإعدادات', name_en: 'Settings', href: '/school-admin/settings', icon: CogIcon },
        { name: 'التقارير', name_en: 'Reports', href: '/school-admin/reports', icon: ChartBarIcon },
    ],

    teacher: [
        { name: 'لوحة التحكم', name_en: 'Dashboard', href: '/dashboard', icon: HomeIcon },
        { name: 'الفصول', name_en: 'Classes', href: '/teacher/classes', icon: AcademicCapIcon },
        { name: 'الطلاب', name_en: 'Students', href: '/teacher/students', icon: UserGroupIcon },
        { name: 'الدروس', name_en: 'Lessons', href: '/teacher/lessons', icon: BookOpenIcon },
        { name: 'الكورسات', name_en: 'Courses', href: '/teacher/courses', icon: BookOpenIcon },
        { name: 'طلبات التسجيل', name_en: 'Enrollment Requests', href: '/teacher/enrollment-requests', icon: InboxIcon },
        { name: 'الحضور', name_en: 'Attendance', href: '/teacher/attendance', icon: CalendarIcon },
        { name: 'الدرجات', name_en: 'Grades', href: '/teacher/grades', icon: ChartBarIcon },
        { name: 'البث المباشر', name_en: 'Live Sessions', href: '/teacher/live-sessions', icon: VideoCameraIcon },
        { name: 'الوظائف', name_en: 'Job Requests', href: '/teacher/job-requests', icon: BriefcaseIcon },
        { name: 'المدفوعات', name_en: 'Payments', href: '/teacher/payments', icon: CurrencyDollarIcon },
        { name: 'الجدول الزمني', name_en: 'Timetable', href: '/teacher/timetable', icon: CalendarIcon },
    ],

    student: [
        { name: 'لوحة التحكم', name_en: 'Dashboard', href: '/dashboard', icon: HomeIcon },
        { name: 'الكورسات', name_en: 'Courses', href: '/student/courses', icon: BookOpenIcon },
        { name: 'طلبات الكورسات', name_en: 'Courses Requests', href: '/student/enrollment-requests', icon: InboxIcon },
        { name: 'الدروس', name_en: 'Lessons', href: '/student/lessons', icon: AcademicCapIcon },
        { name: 'الدرجات', name_en: 'Grades', href: '/student/grades', icon: ChartBarIcon },
        { name: 'الحضور', name_en: 'Attendance', href: '/student/attendance', icon: CalendarIcon },
        { name: 'البث المباشر', name_en: 'Live Sessions', href: '/student/live-sessions', icon: VideoCameraIcon },
        { name: 'الإشعارات', name_en: 'Notifications', href: '/notifications', icon: BellIcon },
    ],
};

export default function AuthenticatedLayout({ user, header, children }) {
    const { auth, locale = 'ar' } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);

    const currentUser = user || auth.user;
    const userNavigation = navigation[currentUser?.user_type] || [];
    const isRTL = locale === 'ar';

    return (
        <div dir={isRTL ? 'rtl' : 'ltr'} className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 ${isRTL ? 'rtl' : 'ltr'}`}>
            {/* Mobile sidebar */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            exit={{opacity: 0}}
                            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                        <motion.div
                            initial={{x: isRTL ? 256 : -256}}
                            animate={{x: 0}}
                            exit={{x: isRTL ? 256 : -256}}
                            className={`fixed inset-y-0 z-50 w-64 bg-white shadow-xl lg:hidden ${
                                isRTL ? 'right-0' : 'left-0'
                            }`}
                        >
                            <div className="flex h-16 items-center justify-between px-4">
                                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                    {isRTL ? 'نظام التعليم' : 'EduSystem'}
                                </h1>
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XMarkIcon className="h-6 w-6"/>
                                </button>
                            </div>
                            <nav className="mt-8 px-4">
                                {userNavigation.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="group flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:text-blue-600 transition-all duration-200"
                                    >
                                        <item.icon className={`h-5 w-5 ${isRTL ? 'ml-3' : 'mr-3'}`}/>
                                        {isRTL ? item.name : item.name_en}
                                    </Link>
                                ))}
                            </nav>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop sidebar */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{x: isRTL ? 256 : -256}}
                        animate={{x: 0}}
                        exit={{x: isRTL ? 256 : -256}}
                        transition={{duration: 0.3}}
                        className={`hidden lg:block lg:fixed lg:inset-y-0 lg:w-64 lg:z-40 ${isRTL ? 'lg:right-0' : 'lg:left-0'}`}
                    >
                        <div className="flex flex-col h-full bg-white shadow-xl">
                            <div
                                className="flex h-16 items-center justify-between px-6 bg-gradient-to-r from-blue-600 to-cyan-600">
                                <h1 className="text-xl font-bold text-white">
                                    {isRTL ? 'نظام التعليم' : 'EduSystem'}
                                </h1>
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    className="text-white hover:text-gray-200 lg:block"
                                >
                                    <XMarkIcon className="h-6 w-6"/>
                                </button>
                            </div>
                            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                                {userNavigation.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="group flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:text-blue-600 transition-all duration-200"
                                    >
                                        <item.icon className={`h-5 w-5 ${isRTL ? 'ml-3' : 'mr-3'}`}/>
                                        {isRTL ? item.name : item.name_en}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main content */}
            <div className="w-full transition-all duration-300">
                {/* Top navigation */}
                <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200">
                    <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center space-x-4 rtl:space-x-reverse">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="text-gray-500 hover:text-gray-600 transition-colors"
                            >
                                <Bars3Icon className="h-6 w-6"/>
                            </button>
                            {header && (
                                <div className="hidden sm:block">
                                    {header}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center space-x-4 rtl:space-x-reverse">
                            {/* Notifications */}
                            <div className="relative">
                                <button
                                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                                    className="relative p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    <BellIcon className="h-6 w-6"/>
                                    <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                                </button>

                                {/* Notifications Dropdown */}
                                <AnimatePresence>
                                    {notificationsOpen && (
                                        <motion.div
                                            initial={{opacity: 0, y: -10}}
                                            animate={{opacity: 1, y: 0}}
                                            exit={{opacity: 0, y: -10}}
                                            className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2`}
                                        >
                                            <div className="px-4 py-2 border-b border-gray-200">
                                                <h3 className="text-sm font-semibold text-gray-900">
                                                    {isRTL ? 'الإشعارات' : 'Notifications'}
                                                </h3>
                                            </div>
                                            <div className="max-h-96 overflow-y-auto">
                                                <div className="px-4 py-8 text-center text-sm text-gray-500">
                                                    {isRTL ? 'لا توجد إشعارات جديدة' : 'No new notifications'}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* User menu */}
                            <div className="relative">
                                <button
                                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                    className="flex items-center space-x-3 rtl:space-x-reverse hover:opacity-80 transition-opacity"
                                >
                                    <div className={`text-sm hidden md:block ${isRTL ? 'text-right' : 'text-left'}`}>
                                        <p className="font-medium text-gray-900">{currentUser?.name}</p>
                                        <p className="text-gray-500 capitalize text-xs">
                                            {currentUser?.user_type?.replace('_', ' ')}
                                        </p>
                                    </div>
                                    <div
                                        className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center hover:shadow-lg transition-shadow">
                                        <UserCircleIcon className="h-6 w-6 text-white"/>
                                    </div>
                                </button>

                                {/* Profile Dropdown */}
                                <AnimatePresence>
                                    {profileMenuOpen && (
                                        <motion.div
                                            initial={{opacity: 0, y: -10}}
                                            animate={{opacity: 1, y: 0}}
                                            exit={{opacity: 0, y: -10}}
                                            className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2`}
                                        >
                                            <Link
                                                href={route('profile.edit')}
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                {isRTL ? 'الملف الشخصي' : 'Profile'}
                                            </Link>
                                            <Link
                                                href={route('logout')}
                                                method="post"
                                                as="button"
                                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                {isRTL ? 'تسجيل الخروج' : 'Logout'}
                                            </Link>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Page content */}
                <main className="py-6">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>

            </div>
        </div>
    )
        ;
}
