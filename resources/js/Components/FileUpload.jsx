import { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

export default function FileUpload({
    type = 'image',
    folder = null,
    multiple = false,
    maxFiles = 10,
    onUploadComplete,
    className = '',
    accept,
    label = 'اختر الملفات',
}) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef(null);

    const acceptTypes = {
        image: 'image/jpeg,image/png,image/gif,image/webp',
        document: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt',
        video: 'video/mp4,video/mpeg,video/quicktime,video/webm',
        audio: 'audio/mpeg,audio/wav,audio/ogg,audio/webm',
    };

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);

        if (files.length === 0) return;

        if (multiple && files.length > maxFiles) {
            toast.error(`يمكنك رفع ${maxFiles} ملفات كحد أقصى`);
            return;
        }

        setUploading(true);
        setProgress(0);

        try {
            const formData = new FormData();
            formData.append('type', type);
            if (folder) formData.append('folder', folder);

            if (multiple) {
                files.forEach((file) => {
                    formData.append('files[]', file);
                });

                const response = await axios.post('/api/files/upload-multiple', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setProgress(percentCompleted);
                    },
                });

                toast.success('تم رفع الملفات بنجاح');
                if (onUploadComplete) {
                    onUploadComplete(response.data.files);
                }
            } else {
                formData.append('file', files[0]);

                const response = await axios.post('/api/files/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setProgress(percentCompleted);
                    },
                });

                toast.success('تم رفع الملف بنجاح');
                if (onUploadComplete) {
                    onUploadComplete(response.data.file);
                }
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error.response?.data?.message || 'حدث خطأ أثناء رفع الملف');
        } finally {
            setUploading(false);
            setProgress(0);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className={className}>
            <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                multiple={multiple}
                accept={accept || acceptTypes[type]}
                className="hidden"
                id="file-upload"
                disabled={uploading}
            />
            <label
                htmlFor="file-upload"
                className={`inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-lg font-semibold text-sm text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors cursor-pointer ${
                    uploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
                {uploading ? (
                    <>
                        <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
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
                        جاري الرفع... {progress}%
                    </>
                ) : (
                    <>
                        <svg
                            className="w-5 h-5 mr-2 rtl:ml-2"
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
                        {label}
                    </>
                )}
            </label>
        </div>
    );
}
