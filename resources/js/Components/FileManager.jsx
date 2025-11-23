import { useState } from 'react';
import FileUpload from './FileUpload';
import FileBrowser from './FileBrowser';

export default function FileManager({
    type = 'document',
    folder = null,
    multiple = true,
    initialFiles = [],
    onFilesChange,
    className = '',
}) {
    const [files, setFiles] = useState(initialFiles);

    const handleUploadComplete = (uploadedFiles) => {
        const newFiles = Array.isArray(uploadedFiles) ? uploadedFiles : [uploadedFiles];
        const updatedFiles = [...files, ...newFiles];
        setFiles(updatedFiles);
        if (onFilesChange) {
            onFilesChange(updatedFiles);
        }
    };

    const handleDelete = (fileToDelete) => {
        const updatedFiles = files.filter(file => file.path !== fileToDelete.path);
        setFiles(updatedFiles);
        if (onFilesChange) {
            onFilesChange(updatedFiles);
        }
    };

    return (
        <div className={className}>
            <div className="mb-4">
                <FileUpload
                    type={type}
                    folder={folder}
                    multiple={multiple}
                    onUploadComplete={handleUploadComplete}
                    label={multiple ? 'رفع ملفات' : 'رفع ملف'}
                />
            </div>

            <FileBrowser
                files={files}
                onDelete={handleDelete}
            />
        </div>
    );
}
