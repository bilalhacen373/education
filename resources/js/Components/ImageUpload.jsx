import { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

export default function ImageUpload({
    currentImage = null,
    folder = 'images',
    onUploadComplete,
    className = '',
    label = 'رفع صورة',
    aspectRatio = 'square',
}) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(currentImage);
    const fileInputRef = useRef(null);

    const aspectRatioClasses = {
        square: 'aspect-square',
        video: 'aspect-video',
        portrait: 'aspect-[3/4]',
        wide: 'aspect-[21/9]',
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('يرجى اختيار ملف صورة');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(file);

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', 'image');
            formData.append('folder', folder);

            const response = await axios.post('/api/files/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success('تم رفع الصورة بنجاح');
            if (onUploadComplete) {
                onUploadComplete(response.data.file);
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error.response?.data?.message || 'حدث خطأ أثناء رفع الصورة');
            setPreview(currentImage);
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        if (onUploadComplete) {
            onUploadComplete(null);
        }
    };

    return (
        <div className={className}>
            <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
                id={`image-upload-${folder}`}
                disabled={uploading}
            />

            <div className="space-y-3">
                {preview ? (
                    <div className="relative">
                        <div className={`w-full ${aspectRatioClasses[aspectRatio]} rounded-lg overflow-hidden bg-gray-100`}>
                            <img
                                src={preview}
                                alt="Preview"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {!uploading && (
                            <button
                                onClick={handleRemove}
                                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-lg"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                        {uploading && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                                <div className="text-white text-center">
                                    <svg
                                        className="animate-spin h-10 w-10 mx-auto mb-2"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    <p className="text-sm">جاري الرفع...</p>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <label
                        htmlFor={`image-upload-${folder}`}
                        className={`flex flex-col items-center justify-center w-full ${aspectRatioClasses[aspectRatio]} border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors`}
                    >
                        <div className="flex flex-col items-center justify-center py-6">
                            <svg
                                className="w-12 h-12 mb-3 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                            </svg>
                            <p className="mb-2 text-sm text-gray-700 font-semibold">{label}</p>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF, WEBP (MAX. 5MB)</p>
                        </div>
                    </label>
                )}
            </div>
        </div>
    );
}
