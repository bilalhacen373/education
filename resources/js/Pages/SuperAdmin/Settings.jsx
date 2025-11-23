import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import {
    CogIcon,
    CheckIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function Settings({ auth, settings = {} }) {
    const [formData, setFormData] = useState({
        site_name: settings.site_name || '',
        site_name_en: settings.site_name_en || '',
        site_description: settings.site_description || '',
        site_email: settings.site_email || '',
        site_phone: settings.site_phone || '',
        support_email: settings.support_email || '',
        currency: settings.currency || 'SAR',
        currency_symbol: settings.currency_symbol || 'دج',
        default_language: settings.default_language || 'ar',
        timezone: settings.timezone || 'Asia/Riyadh',
        date_format: settings.date_format || 'Y-m-d',
        time_format: settings.time_format || 'H:i',
        enable_registration: settings.enable_registration !== false,
        enable_email_verification: settings.enable_email_verification !== false,
        maintenance_mode: settings.maintenance_mode === true,
        terms_of_service: settings.terms_of_service || '',
        privacy_policy: settings.privacy_policy || '',
    });

    const [activeTab, setActiveTab] = useState('general');

    const handleSubmit = (e) => {
        e.preventDefault();

        router.post('/admin/settings', formData, {
            onSuccess: () => {
                toast.success('تم حفظ الإعدادات بنجاح');
            },
            onError: () => {
                toast.error('حدث خطأ أثناء حفظ الإعدادات');
            },
        });
    };

    const tabs = [
        { id: 'general', name: 'إعدادات عامة' },
        { id: 'localization', name: 'اللغة والتوقيت' },
        { id: 'features', name: 'المميزات' },
        { id: 'legal', name: 'القانونية' },
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800">إعدادات النظام</h2>}
        >
            <Head title="إعدادات النظام" />

            <div className="space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden"
                >
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 rtl:space-x-reverse px-6" aria-label="Tabs">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                        activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    {tab.name}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6">
                        {activeTab === 'general' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            اسم الموقع (عربي)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.site_name}
                                            onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            اسم الموقع (إنجليزي)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.site_name_en}
                                            onChange={(e) => setFormData({ ...formData, site_name_en: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            وصف الموقع
                                        </label>
                                        <textarea
                                            value={formData.site_description}
                                            onChange={(e) => setFormData({ ...formData, site_description: e.target.value })}
                                            rows="3"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            البريد الإلكتروني للموقع
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.site_email}
                                            onChange={(e) => setFormData({ ...formData, site_email: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            رقم الهاتف
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.site_phone}
                                            onChange={(e) => setFormData({ ...formData, site_phone: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            بريد الدعم الفني
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.support_email}
                                            onChange={(e) => setFormData({ ...formData, support_email: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'localization' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            العملة
                                        </label>
                                        <select
                                            value={formData.currency}
                                            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="SAR">دج سعودي (SAR)</option>
                                            <option value="USD">دولار أمريكي (USD)</option>
                                            <option value="EUR">يورو (EUR)</option>
                                            <option value="EGP">جنيه مصري (EGP)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            رمز العملة
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.currency_symbol}
                                            onChange={(e) => setFormData({ ...formData, currency_symbol: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            اللغة الافتراضية
                                        </label>
                                        <select
                                            value={formData.default_language}
                                            onChange={(e) => setFormData({ ...formData, default_language: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="ar">العربية</option>
                                            <option value="en">English</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            المنطقة الزمنية
                                        </label>
                                        <select
                                            value={formData.timezone}
                                            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="Asia/Riyadh">الرياض (Asia/Riyadh)</option>
                                            <option value="Asia/Dubai">دبي (Asia/Dubai)</option>
                                            <option value="Africa/Cairo">القاهرة (Africa/Cairo)</option>
                                            <option value="UTC">UTC</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            صيغة التاريخ
                                        </label>
                                        <select
                                            value={formData.date_format}
                                            onChange={(e) => setFormData({ ...formData, date_format: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="Y-m-d">YYYY-MM-DD</option>
                                            <option value="d/m/Y">DD/MM/YYYY</option>
                                            <option value="m/d/Y">MM/DD/YYYY</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            صيغة الوقت
                                        </label>
                                        <select
                                            value={formData.time_format}
                                            onChange={(e) => setFormData({ ...formData, time_format: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="H:i">24 ساعة (HH:MM)</option>
                                            <option value="h:i A">12 ساعة (hh:mm AM/PM)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'features' && (
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h4 className="font-medium text-gray-900">تفعيل التسجيل</h4>
                                            <p className="text-sm text-gray-600">السماح للمستخدمين الجدد بالتسجيل</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.enable_registration}
                                                onChange={(e) => setFormData({ ...formData, enable_registration: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h4 className="font-medium text-gray-900">التحقق من البريد الإلكتروني</h4>
                                            <p className="text-sm text-gray-600">طلب التحقق من البريد الإلكتروني للمستخدمين الجدد</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.enable_email_verification}
                                                onChange={(e) => setFormData({ ...formData, enable_email_verification: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h4 className="font-medium text-gray-900">وضع الصيانة</h4>
                                            <p className="text-sm text-gray-600">تعطيل الموقع للصيانة</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.maintenance_mode}
                                                onChange={(e) => setFormData({ ...formData, maintenance_mode: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'legal' && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        الشروط والأحكام
                                    </label>
                                    <textarea
                                        value={formData.terms_of_service}
                                        onChange={(e) => setFormData({ ...formData, terms_of_service: e.target.value })}
                                        rows="8"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="أدخل الشروط والأحكام..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        سياسة الخصوصية
                                    </label>
                                    <textarea
                                        value={formData.privacy_policy}
                                        onChange={(e) => setFormData({ ...formData, privacy_policy: e.target.value })}
                                        rows="8"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="أدخل سياسة الخصوصية..."
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-end pt-6 border-t mt-6">
                            <button
                                type="submit"
                                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium"
                            >
                                <CheckIcon className="w-5 h-5 ml-2" />
                                حفظ الإعدادات
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AuthenticatedLayout>
    );
}
