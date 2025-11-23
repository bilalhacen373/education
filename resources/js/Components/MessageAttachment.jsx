import {
    DocumentIcon,
    PhotoIcon,
    DocumentTextIcon,
    CodeBracketIcon
} from '@heroicons/react/24/outline';

export default function MessageAttachment({ attachments, isUser }) {
    if (!attachments || attachments.length === 0) return null;

    const getFileIcon = (attachment) => {
        const type = attachment.type || '';
        const name = attachment.name || '';

        if (type.startsWith('image/')) {
            return <PhotoIcon className="w-4 h-4" />;
        } else if (type.includes('pdf')) {
            return <DocumentIcon className="w-4 h-4" />;
        } else if (type.includes('text') || type.includes('document')) {
            return <DocumentTextIcon className="w-4 h-4" />;
        } else if (type.includes('code') || name.match(/\.(js|py|java|cpp|php|ts|tsx|jsx)$/)) {
            return <CodeBracketIcon className="w-4 h-4" />;
        }

        return <DocumentIcon className="w-4 h-4" />;
    };

    const formatFileSize = (bytes) => {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <div className="mt-2 space-y-1">
            {attachments.map((attachment, index) => (
                <div
                    key={index}
                    className={`flex items-center space-x-2 text-xs p-2 rounded ${
                        isUser
                            ? 'bg-blue-700 bg-opacity-50'
                            : 'bg-gray-200'
                    }`}
                >
                    {getFileIcon(attachment)}
                    <div className="flex-1 min-w-0">
                        <p className={`truncate ${isUser ? 'text-blue-50' : 'text-gray-700'}`}>
                            {attachment.name}
                        </p>
                        {attachment.size && (
                            <p className={`${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
                                {formatFileSize(attachment.size)}
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
