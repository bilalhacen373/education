import { useState, useRef } from 'react';
import {
    PaperClipIcon,
    XMarkIcon,
    DocumentIcon,
    PhotoIcon,
    DocumentTextIcon,
    CodeBracketIcon
} from '@heroicons/react/24/outline';

export default function ChatFileAttachment({ onFilesChange, disabled }) {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(files);
        onFilesChange(files);
    };

    const removeFile = (index) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(newFiles);
        onFilesChange(newFiles);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const getFileIcon = (file) => {
        const type = file.type;

        if (type.startsWith('image/')) {
            return <PhotoIcon className="w-5 h-5 text-blue-600" />;
        } else if (type.includes('pdf')) {
            return <DocumentIcon className="w-5 h-5 text-red-600" />;
        } else if (type.includes('text') || type.includes('document')) {
            return <DocumentTextIcon className="w-5 h-5 text-green-600" />;
        } else if (type.includes('code') || file.name.match(/\.(js|py|java|cpp|php|ts|tsx|jsx)$/)) {
            return <CodeBracketIcon className="w-5 h-5 text-purple-600" />;
        }

        return <DocumentIcon className="w-5 h-5 text-gray-600" />;
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <div>
            <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
                disabled={disabled}
                accept=".epub,.mobi,.azw3,.pdf,.txt,.md,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.svg,.gif,.webp,.bmp,.ico,.tiff,.js,.py,.java,.cpp,.c,.ts,.tsx,.jsx,.go,.php,.css,.html,.json,.csv,.tsv,.yaml,.yml,.xml"
            />

            <label
                htmlFor="file-upload"
                className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
            >
                <PaperClipIcon className="w-5 h-5 mr-2 rtl:ml-2" />
                Attach Files
            </label>

            {selectedFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                    {selectedFiles.map((file, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200"
                        >
                            <div className="flex items-center space-x-2 flex-1 min-w-0">
                                {getFileIcon(file)}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {formatFileSize(file.size)}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="ml-2 text-red-600 hover:text-red-700 flex-shrink-0"
                                disabled={disabled}
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
