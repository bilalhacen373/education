import { useState, useRef, useEffect } from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

export default function ProfessionalDocumentViewer({ documents, onProgressUpdate, auth }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [zoom, setZoom] = useState(100);
    const [readDocuments, setReadDocuments] = useState(new Set());
    const iframeRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        if (onProgressUpdate && auth?.user && documents && documents.length > 0) {
            const totalDocs = documents.length;
            const docsRead = readDocuments.size;
            onProgressUpdate({
                documentsRead: docsRead,
                totalDocuments: totalDocs,
            });
        }
    }, [readDocuments, documents, onProgressUpdate, auth]);

    const handleDocumentView = (doc, index) => {
        setSelectedDoc({ ...doc, index });
        setIsOpen(true);

        setTimeout(() => {
            markAsRead(index);
        }, 5000);
    };

    const markAsRead = (index) => {
        setReadDocuments(prev => {
            const newSet = new Set(prev);
            newSet.add(index);
            return newSet;
        });
    };

    const handleDownload = (doc) => {
        const link = document.createElement('a');
        link.href = `/storage/${doc.path}`;
        link.setAttribute('download', doc.name);
        link.setAttribute('target', '_blank');
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const handlePrint = () => {
        if (selectedDoc) {
            const printWindow = window.open(`/storage/${selectedDoc.path}`, '_blank');
            printWindow?.print();
        }
    };

    const getFileType = (doc) => {
        const extension = doc.name.split('.').pop().toLowerCase();
        return extension;
    };

    const getFileIcon = (doc) => {
        const ext = getFileType(doc);
        const colors = {
            pdf: 'text-red-500',
            doc: 'text-blue-500',
            docx: 'text-blue-500',
            xls: 'text-green-500',
            xlsx: 'text-green-500',
            ppt: 'text-orange-500',
            pptx: 'text-orange-500',
        };
        return colors[ext] || 'text-gray-500';
    };

    if (!documents || documents.length === 0) {
        return null;
    }

    return (
        <div className="mb-6">
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-t-lg p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <DocumentTextIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-white font-semibold">المستندات ({documents.length})</h3>
                            {auth?.user && (
                                <p className="text-green-100 text-sm">
                                    قرأت {readDocuments.size} من {documents.length}
                                </p>
                            )}
                        </div>
                    </div>
                    {!isOpen && documents.length > 0 && (
                        <button
                            onClick={() => {
                                setSelectedDoc({ ...documents[0], index: 0 });
                                setIsOpen(true);
                                setTimeout(() => markAsRead(0), 5000);
                            }}
                            className="px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium flex items-center gap-2"
                        >
                            <DocumentTextIcon className="w-5 h-5" />
                            فتح القارئ
                        </button>
                    )}
                    {isOpen && (
                        <button
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            إغلاق القارئ
                        </button>
                    )}
                </div>
            </div>

            <div className="border-x border-gray-200 bg-white p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {documents.map((doc, index) => (
                        <div
                            key={index}
                            className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
                                readDocuments.has(index)
                                    ? 'border-green-200 bg-green-50'
                                    : 'border-gray-200 bg-white hover:border-green-300'
                            }`}
                            onClick={() => handleDocumentView(doc, index)}
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <DocumentTextIcon className={`w-8 h-8 flex-shrink-0 ${getFileIcon(doc)}`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                                    <p className="text-xs text-gray-500">{getFileType(doc).toUpperCase()}</p>
                                </div>
                            </div>
                            {readDocuments.has(index) && (
                                <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {isOpen && selectedDoc && (
                <div className="border border-gray-200 rounded-b-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <DocumentTextIcon className={`w-6 h-6 ${getFileIcon(selectedDoc)}`} />
                                <div>
                                    <h3 className="font-semibold text-gray-900">{selectedDoc.name}</h3>
                                    <p className="text-sm text-gray-600">{getFileType(selectedDoc).toUpperCase()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setZoom(Math.max(50, zoom - 10))}
                                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    title="تصغير"
                                >
                                    <span className="text-lg font-bold">-</span>
                                </button>
                                <span className="text-sm text-gray-700 font-medium min-w-[60px] text-center bg-white px-3 py-2 rounded-lg border border-gray-300">
                                    {zoom}%
                                </span>
                                <button
                                    onClick={() => setZoom(Math.min(200, zoom + 10))}
                                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    title="تكبير"
                                >
                                    <span className="text-lg font-bold">+</span>
                                </button>
                                <button
                                    onClick={handlePrint}
                                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                    title="طباعة"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                    <span className="hidden sm:inline">طباعة</span>
                                </button>
                                <button
                                    onClick={() => handleDownload(selectedDoc)}
                                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
                                    title="تحميل"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    <span className="hidden sm:inline">تحميل</span>
                                </button>
                            </div>
                        </div>

                        {documents.length > 1 && (
                            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                                {documents.map((doc, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setSelectedDoc({ ...doc, index });
                                            setTimeout(() => markAsRead(index), 5000);
                                        }}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                                            selectedDoc.index === index
                                                ? 'bg-green-600 text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        {readDocuments.has(index) && (
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                        مستند {index + 1}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div
                        ref={containerRef}
                        className="bg-gray-100 overflow-auto"
                        style={{ height: '700px' }}
                    >
                        <div className="p-4 flex items-center justify-center min-h-full">
                            <iframe
                                ref={iframeRef}
                                src={`/storage/${selectedDoc.path}`}
                                className="w-full bg-white shadow-2xl rounded-lg border-2 border-gray-200"
                                style={{
                                    height: `${600 * (zoom / 100)}px`,
                                    transform: `scale(${zoom / 100})`,
                                    transformOrigin: 'top center',
                                    transition: 'transform 0.2s ease'
                                }}
                                title={selectedDoc.name}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
