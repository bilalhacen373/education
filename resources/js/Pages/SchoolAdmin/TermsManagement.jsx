import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { toast } from 'react-hot-toast';

export default function TermsManagement({ auth, school }) {
    const [termsContent, setTermsContent] = useState(school?.terms_conditions || '');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);

        router.put(route('schools.update-terms', school.id), {
            terms_conditions: termsContent
        }, {
            onSuccess: () => {
                toast.success('تم تحديث الشروط والأحكام بنجاح');
                setErrors({});
            },
            onError: (errors) => {
                setErrors(errors);
                toast.error('حدث خطأ أثناء الحفظ');
            },
            onFinish: () => {
                setProcessing(false);
            },
        });
    };

    const defaultTerms = `
الشروط والأحكام العامة للمدرسة

1. القبول والتسجيل:
- يجب استيفاء جميع المتطلبات والمستندات المطلوبة للتسجيل
- تحتفظ المدرسة بحق قبول أو رفض أي طلب تسجيل
- رسوم التسجيل غير قابلة للاسترداد

2. الرسوم الدراسية:
- يجب دفع الرسوم في المواعيد المحددة
- التأخر في الدفع قد يؤدي إلى تعليق الخدمات التعليمية
- الرسوم الدراسية غير قابلة للاسترداد إلا في حالات استثنائية

3. الحضور والانضباط:
- يجب على الطلاب الالتزام بالحضور المنتظم
- الغياب المتكرر قد يؤدي إلى إجراءات تأديبية
- يجب احترام قواعد السلوك والانضباط

4. المسؤولية:
- المدرسة غير مسؤولة عن الممتلكات الشخصية للطلاب
- يتحمل أولياء الأمور مسؤولية أي ضرر يسببه أبناؤهم

5. الإلغاء والانسحاب:
- يجب تقديم إشعار كتابي قبل 30 يوماً من الانسحاب
- قد تطبق رسوم إضافية في حالة الانسحاب المبكر

6. سياسة الخصوصية:
- تحترم المدرسة خصوصية بيانات الطلاب وأولياء الأمور
- لن يتم مشاركة المعلومات الشخصية مع أطراف ثالثة دون موافقة

7. تعديل الشروط:
- تحتفظ المدرسة بحق تعديل هذه الشروط في أي وقت
- سيتم إخطار أولياء الأمور بأي تغييرات جوهرية
    `.trim();

    const handleLoadDefault = () => {
        if (confirm('هل تريد تحميل الشروط والأحكام الافتراضية؟ سيتم استبدال المحتوى الحالي.')) {
            setTermsContent(defaultTerms);
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="إدارة الشروط والأحكام" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">
                            إدارة الشروط والأحكام
                        </h1>
                        <p className="mt-2 text-sm text-gray-600">
                            قم بتحديد الشروط والأحكام الخاصة بالمدرسة
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <InputLabel value="محتوى الشروط والأحكام" />
                                <button
                                    type="button"
                                    onClick={handleLoadDefault}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    تحميل النموذج الافتراضي
                                </button>
                            </div>

                            <textarea
                                value={termsContent}
                                onChange={(e) => setTermsContent(e.target.value)}
                                rows={20}
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder="أدخل الشروط والأحكام هنا..."
                                required
                            />
                            <InputError message={errors.terms_conditions} className="mt-2" />

                            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                <h4 className="text-sm font-semibold text-blue-900 mb-2">
                                    نصائح لكتابة الشروط والأحكام:
                                </h4>
                                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                                    <li>كن واضحاً ومباشراً في الصياغة</li>
                                    <li>قسم المحتوى إلى أقسام واضحة</li>
                                    <li>حدد السياسات المتعلقة بالرسوم والحضور</li>
                                    <li>اذكر حقوق ومسؤوليات الطرفين</li>
                                    <li>راجع الشروط مع مستشار قانوني إن أمكن</li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">معاينة</h3>
                            <div className="prose max-w-none border border-gray-200 rounded-lg p-6 bg-gray-50">
                                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">
                                    {termsContent || 'لا يوجد محتوى للمعاينة'}
                                </pre>
                            </div>
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
                                {processing ? 'جاري الحفظ...' : 'حفظ الشروط والأحكام'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
