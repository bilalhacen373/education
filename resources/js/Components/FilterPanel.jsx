import { Fragment } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function FilterPanel({ filters, onFilterChange, children }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between mb-4 lg:hidden">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FunnelIcon className="w-5 h-5" />
                    البحث والتصفية
                </h3>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-gray-600 hover:text-gray-900"
                >
                    {isOpen ? (
                        <XMarkIcon className="w-6 h-6" />
                    ) : (
                        <FunnelIcon className="w-6 h-6" />
                    )}
                </button>
            </div>

            <div className={`${isOpen ? 'block' : 'hidden'} lg:block`}>
                {children}
            </div>
        </div>
    );
}

export function SearchInput({ value, onChange, placeholder = "البحث..." }) {
    return (
        <div className="relative">
            <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
                type="text"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
        </div>
    );
}

export function SelectFilter({ label, value, onChange, options, placeholder = "اختر..." }) {
    // تحويل القيمة إلى string للتأكد من التوافق
    const safeValue = value != null ? String(value) : '';

    // تصفية الـ options للتأكد من أنها تحتوي على القيمة المحددة
    const safeOptions = options || [];

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
            </label>
            <select
                value={safeValue}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
                <option value="">{placeholder}</option>
                {safeOptions.map((option) => (
                    <option
                        key={option.value}
                        value={option.value != null ? String(option.value) : ''}
                    >
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

export function RadioFilter({ label, value, onChange, options }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
            </label>
            <div className="space-y-2">
                {options.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name={label}
                            value={option.value}
                            checked={value === option.value}
                            onChange={(e) => onChange(e.target.value)}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}

export function FilterButton({ onClick, children, variant = 'primary' }) {
    const baseClasses = "px-4 py-2 rounded-lg font-medium transition-all duration-200";
    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700",
        secondary: "bg-gray-200 text-gray-700 hover:bg-gray-300",
    };

    return (
        <button
            onClick={onClick}
            className={`${baseClasses} ${variants[variant]}`}
        >
            {children}
        </button>
    );
}
