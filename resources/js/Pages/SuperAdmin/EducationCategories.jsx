import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { toast } from 'react-hot-toast';

export default function EducationCategories({ auth, categories }) {
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [editingSubcategory, setEditingSubcategory] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [errors, setErrors] = useState({});

    const [categoryForm, setCategoryForm] = useState({
        name_ar: '',
        name_en: '',
        display_order: 0,
    });

    const [subcategoryForm, setSubcategoryForm] = useState({
        category_id: '',
        name_ar: '',
        name_en: '',
        display_order: 0,
        is_final_exam: false,
    });

    const openCategoryModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setCategoryForm({
                name_ar: category.name_ar,
                name_en: category.name_en,
                display_order: category.display_order,
            });
        } else {
            setEditingCategory(null);
            setCategoryForm({ name_ar: '', name_en: '', display_order: 0 });
        }
        setShowCategoryModal(true);
        setErrors({});
    };

    const openSubcategoryModal = (categoryId, subcategory = null) => {
        if (subcategory) {
            setEditingSubcategory(subcategory);
            setSubcategoryForm({
                category_id: subcategory.category_id,
                name_ar: subcategory.name_ar,
                name_en: subcategory.name_en,
                display_order: subcategory.display_order,
                is_final_exam: subcategory.is_final_exam,
            });
        } else {
            setEditingSubcategory(null);
            setSubcategoryForm({
                category_id: categoryId,
                name_ar: '',
                name_en: '',
                display_order: 0,
                is_final_exam: false,
            });
        }
        setShowSubcategoryModal(true);
        setErrors({});
    };

    const handleCategorySubmit = (e) => {
        e.preventDefault();
        const url = editingCategory
            ? route('admin.education-categories.update', editingCategory.id)
            : route('admin.education-categories.store');
        const method = editingCategory ? 'put' : 'post';

        router[method](url, categoryForm, {
            onSuccess: () => {
                setShowCategoryModal(false);
                toast.success(editingCategory ? 'تم تحديث المستوى التعليمي بنجاح' : 'تم إضافة المستوى التعليمي بنجاح');
            },
            onError: (errors) => {
                setErrors(errors);
                toast.error('حدث خطأ');
            },
        });
    };

    const handleSubcategorySubmit = (e) => {
        e.preventDefault();
        const url = editingSubcategory
            ? route('admin.education-subcategories.update', editingSubcategory.id)
            : route('admin.education-subcategories.store');
        const method = editingSubcategory ? 'put' : 'post';

        router[method](url, subcategoryForm, {
            onSuccess: () => {
                setShowSubcategoryModal(false);
                toast.success(editingSubcategory ? 'تم تحديث السنة الدراسية بنجاح' : 'تم إضافة السنة الدراسية بنجاح');
            },
            onError: (errors) => {
                setErrors(errors);
                toast.error('حدث خطأ');
            },
        });
    };

    const handleDeleteCategory = (id) => {
        if (confirm('هل أنت متأكد من حذف هذا المستوى التعليمي؟')) {
            router.delete(route('admin.education-categories.destroy', id), {
                onSuccess: () => toast.success('تم حذف المستوى التعليمي بنجاح'),
                onError: () => toast.error('حدث خطأ أثناء الحذف'),
            });
        }
    };

    const handleDeleteSubcategory = (id) => {
        if (confirm('هل أنت متأكد من حذف هذه السنة الدراسية؟')) {
            router.delete(route('admin.education-subcategories.destroy', id), {
                onSuccess: () => toast.success('تم حذف السنة الدراسية بنجاح'),
                onError: () => toast.error('حدث خطأ أثناء الحذف'),
            });
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="إدارة المستويات التعليمية" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">
                                    إدارة المستويات التعليمية
                                </h2>
                                <PrimaryButton onClick={() => openCategoryModal()}>
                                    + إضافة مستوى تعليمي
                                </PrimaryButton>
                            </div>

                            <div className="space-y-6">
                                {categories.map((category) => (
                                    <div
                                        key={category.id}
                                        className="border rounded-lg p-4 bg-gray-50"
                                    >
                                        <div className="flex justify-between items-center mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900">
                                                    {category.name_ar}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    {category.name_en}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <SecondaryButton
                                                    onClick={() =>
                                                        openSubcategoryModal(category.id)
                                                    }
                                                >
                                                    + إضافة سنة دراسية
                                                </SecondaryButton>
                                                <SecondaryButton
                                                    onClick={() => openCategoryModal(category)}
                                                >
                                                    تعديل
                                                </SecondaryButton>
                                                <DangerButton
                                                    onClick={() => handleDeleteCategory(category.id)}
                                                >
                                                    حذف
                                                </DangerButton>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-lg p-4">
                                            <h4 className="font-semibold mb-3 text-gray-700">
                                                السنوات الدراسية:
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {category.subcategories?.map((sub) => (
                                                    <div
                                                        key={sub.id}
                                                        className="border rounded p-3 flex justify-between items-center hover:bg-gray-50"
                                                    >
                                                        <div>
                                                            <p className="font-medium text-gray-900">
                                                                {sub.name_ar}
                                                            </p>
                                                            <p className="text-xs text-gray-600">
                                                                {sub.name_en}
                                                            </p>
                                                            {sub.is_final_exam && (
                                                                <span className="inline-block mt-1 px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                                                                    امتحان نهائي
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <button
                                                                onClick={() =>
                                                                    openSubcategoryModal(
                                                                        category.id,
                                                                        sub
                                                                    )
                                                                }
                                                                className="text-blue-600 hover:text-blue-800 p-1"
                                                            >
                                                                تعديل
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleDeleteSubcategory(sub.id)
                                                                }
                                                                className="text-red-600 hover:text-red-800 p-1"
                                                            >
                                                                حذف
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={showCategoryModal} onClose={() => setShowCategoryModal(false)}>
                <form onSubmit={handleCategorySubmit} className="p-6">
                    <h2 className="text-lg font-bold mb-4">
                        {editingCategory ? 'تعديل المستوى التعليمي' : 'إضافة مستوى تعليمي'}
                    </h2>

                    <div className="mb-4">
                        <InputLabel htmlFor="name_ar" value="الاسم بالعربية" />
                        <TextInput
                            id="name_ar"
                            type="text"
                            value={categoryForm.name_ar}
                            onChange={(e) =>
                                setCategoryForm({ ...categoryForm, name_ar: e.target.value })
                            }
                            className="mt-1 block w-full"
                            required
                        />
                        <InputError message={errors.name_ar} className="mt-2" />
                    </div>

                    <div className="mb-4">
                        <InputLabel htmlFor="name_en" value="الاسم بالإنجليزية" />
                        <TextInput
                            id="name_en"
                            type="text"
                            value={categoryForm.name_en}
                            onChange={(e) =>
                                setCategoryForm({ ...categoryForm, name_en: e.target.value })
                            }
                            className="mt-1 block w-full"
                            required
                        />
                        <InputError message={errors.name_en} className="mt-2" />
                    </div>

                    <div className="mb-4">
                        <InputLabel htmlFor="display_order" value="الترتيب" />
                        <TextInput
                            id="display_order"
                            type="number"
                            value={categoryForm.display_order}
                            onChange={(e) =>
                                setCategoryForm({
                                    ...categoryForm,
                                    display_order: parseInt(e.target.value),
                                })
                            }
                            className="mt-1 block w-full"
                            required
                        />
                        <InputError message={errors.display_order} className="mt-2" />
                    </div>

                    <div className="flex justify-end gap-2">
                        <SecondaryButton onClick={() => setShowCategoryModal(false)}>
                            إلغاء
                        </SecondaryButton>
                        <PrimaryButton type="submit">حفظ</PrimaryButton>
                    </div>
                </form>
            </Modal>

            <Modal show={showSubcategoryModal} onClose={() => setShowSubcategoryModal(false)}>
                <form onSubmit={handleSubcategorySubmit} className="p-6">
                    <h2 className="text-lg font-bold mb-4">
                        {editingSubcategory ? 'تعديل السنة الدراسية' : 'إضافة سنة دراسية'}
                    </h2>

                    <div className="mb-4">
                        <InputLabel htmlFor="sub_name_ar" value="الاسم بالعربية" />
                        <TextInput
                            id="sub_name_ar"
                            type="text"
                            value={subcategoryForm.name_ar}
                            onChange={(e) =>
                                setSubcategoryForm({ ...subcategoryForm, name_ar: e.target.value })
                            }
                            className="mt-1 block w-full"
                            required
                        />
                        <InputError message={errors.name_ar} className="mt-2" />
                    </div>

                    <div className="mb-4">
                        <InputLabel htmlFor="sub_name_en" value="الاسم بالإنجليزية" />
                        <TextInput
                            id="sub_name_en"
                            type="text"
                            value={subcategoryForm.name_en}
                            onChange={(e) =>
                                setSubcategoryForm({ ...subcategoryForm, name_en: e.target.value })
                            }
                            className="mt-1 block w-full"
                            required
                        />
                        <InputError message={errors.name_en} className="mt-2" />
                    </div>

                    <div className="mb-4">
                        <InputLabel htmlFor="sub_display_order" value="الترتيب" />
                        <TextInput
                            id="sub_display_order"
                            type="number"
                            value={subcategoryForm.display_order}
                            onChange={(e) =>
                                setSubcategoryForm({
                                    ...subcategoryForm,
                                    display_order: parseInt(e.target.value),
                                })
                            }
                            className="mt-1 block w-full"
                            required
                        />
                        <InputError message={errors.display_order} className="mt-2" />
                    </div>

                    <div className="mb-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={subcategoryForm.is_final_exam}
                                onChange={(e) =>
                                    setSubcategoryForm({
                                        ...subcategoryForm,
                                        is_final_exam: e.target.checked,
                                    })
                                }
                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                            />
                            <span className="mr-2 text-sm text-gray-600">
                                سنة امتحان نهائي
                            </span>
                        </label>
                    </div>

                    <div className="flex justify-end gap-2">
                        <SecondaryButton onClick={() => setShowSubcategoryModal(false)}>
                            إلغاء
                        </SecondaryButton>
                        <PrimaryButton type="submit">حفظ</PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
