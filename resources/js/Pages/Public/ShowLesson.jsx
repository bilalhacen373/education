import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    AcademicCapIcon,
    BookOpenIcon,
    ClockIcon,
    StarIcon,
    HeartIcon,
    ShareIcon,
    PlayCircleIcon,
    DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import Modal from '@/Components/Modal';
import ProfessionalVideoPlayer from '@/Components/ProfessionalVideoPlayer';
import ProfessionalDocumentViewer from '@/Components/ProfessionalDocumentViewer';
import axios from 'axios';

export default function ShowLesson({ auth, lesson, reviews, averageRating, isFavorite, hasReviewed, progress }) {
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [localIsFavorite, setLocalIsFavorite] = useState(isFavorite);
    const [showShareModal, setShowShareModal] = useState(false);
    const [currentProgress, setCurrentProgress] = useState(progress?.progress_percentage || 0);
    const [videoProgress, setVideoProgress] = useState(progress?.video_progress || 0);
    const [documentsRead, setDocumentsRead] = useState(progress?.documents_read || 0);
    const [totalDocuments, setTotalDocuments] = useState(progress?.total_documents || 0);
    const [timeSpent, setTimeSpent] = useState(progress?.time_spent_minutes || 0);

    const toggleFavorite = async () => {
        if (!auth.user) {
            window.location.href = route('login');
            return;
        }

        try {
            const response = await fetch(route('public.favorites.toggle'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({
                    type: 'lesson',
                    id: lesson.id,
                }),
            });

            const data = await response.json();
            setLocalIsFavorite(data.isFavorite);
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const updateProgress = async (progressData) => {
        if (!auth.user || !auth.user.student) return;

        try {
            const payload = {};

            if (progressData.videoProgress !== undefined) {
                payload.video_progress = progressData.videoProgress;
                setVideoProgress(progressData.videoProgress);
            }

            if (progressData.documentsRead !== undefined) {
                payload.documents_read = progressData.documentsRead;
                setDocumentsRead(progressData.documentsRead);
            }

            if (progressData.totalDocuments !== undefined) {
                payload.total_documents = progressData.totalDocuments;
                setTotalDocuments(progressData.totalDocuments);
            }

            if (progressData.timeSpent !== undefined) {
                payload.time_spent_minutes = progressData.timeSpent;
                setTimeSpent(progressData.timeSpent);
            }

            const response = await axios.post(route('lessons.update-progress', lesson.id), payload);

            if (response.data.progress) {
                setCurrentProgress(response.data.progress.progress_percentage);
            }
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    };

    const shareLinks = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(lesson.title_ar)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(lesson.title_ar + ' - ' + window.location.href)}`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(lesson.title_ar)}`,
    };

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('تم نسخ الرابط');
    };

    const typeLabels = {
        video: 'فيديو',
        document: 'مستند',
        text: 'نصي',
        interactive: 'تفاعلي',
        mixed: 'متنوع',
    };

    const typeIcons = {
        video: PlayCircleIcon,
        document: DocumentTextIcon,
        text: BookOpenIcon,
        interactive: AcademicCapIcon,
        mixed: BookOpenIcon,
    };

    const TypeIcon = typeIcons[lesson.content_type] || BookOpenIcon;

    return (
        <>
            <Head title={lesson.title_ar} />
            <div className="min-h-screen bg-gray-50" dir="rtl">
                <nav className="bg-white shadow-sm border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <Link href="/" className="text-2xl font-bold text-blue-600">
                                نظام إدارة التعليم
                            </Link>
                            <div className="flex items-center gap-4">
                                <Link
                                    href={route('public.lessons')}
                                    className="text-gray-700 hover:text-blue-600 font-medium"
                                >
                                    الدروس
                                </Link>
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                    >
                                        لوحة التحكم
                                    </Link>
                                ) : (
                                    <Link
                                        href={route('login')}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                    >
                                        تسجيل الدخول
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                <div className="py-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-lg shadow-sm overflow-hidden"
                                >
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                                    {lesson.title_ar}
                                                </h1>
                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                    <div className="flex items-center gap-1">
                                                        <AcademicCapIcon className="w-4 h-4" />
                                                        <span>{lesson.teacher?.user?.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <TypeIcon className="w-4 h-4" />
                                                        <span>{typeLabels[lesson.content_type]}</span>
                                                    </div>
                                                    {averageRating > 0 && (
                                                        <div className="flex items-center gap-1">
                                                            <StarIconSolid className="w-4 h-4 text-yellow-400" />
                                                            <span>{averageRating} ({reviews.total} تقييم)</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={toggleFavorite}
                                                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                                >
                                                    {localIsFavorite ? (
                                                        <HeartIconSolid className="w-6 h-6 text-red-500" />
                                                    ) : (
                                                        <HeartIcon className="w-6 h-6 text-gray-600" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => setShowShareModal(true)}
                                                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                                >
                                                    <ShareIcon className="w-6 h-6 text-gray-600" />
                                                </button>
                                            </div>
                                        </div>

                                        {auth.user && auth.user.student && (
                                            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-blue-900">نسبة الإنجاز</span>
                                                    <span className="text-2xl font-bold text-blue-700">{currentProgress}%</span>
                                                </div>
                                                <div className="w-full bg-blue-200 rounded-full h-3">
                                                    <div
                                                        className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                                                        style={{ width: `${currentProgress}%` }}
                                                    ></div>
                                                </div>
                                                {timeSpent > 0 && (
                                                    <p className="text-xs text-blue-700 mt-2">
                                                        الوقت المستغرق: {timeSpent} دقيقة
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {(lesson.content_type === 'video' || lesson.content_type === 'mixed') && lesson.video_url && (
                                            <ProfessionalVideoPlayer
                                                url={lesson.video_url}
                                                initialProgress={videoProgress}
                                                onProgress={updateProgress}
                                                auth={auth}
                                                lesson={lesson}
                                            />
                                        )}

                                        {lesson.description_ar && (
                                            <div className="mb-6">
                                                <h2 className="text-xl font-bold text-gray-900 mb-3">وصف الدرس</h2>
                                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                                    {lesson.description_ar}
                                                </p>
                                            </div>
                                        )}

                                        {lesson.content_ar && (
                                            <div className="mb-6">
                                                <h2 className="text-xl font-bold text-gray-900 mb-3">محتوى الدرس</h2>
                                                <div
                                                    className="prose prose-blue max-w-none text-gray-700"
                                                    dangerouslySetInnerHTML={{ __html: lesson.content_ar }}
                                                />
                                            </div>
                                        )}

                                        {(lesson.content_type === 'document' || lesson.content_type === 'mixed') && lesson.documents && lesson.documents.length > 0 && (
                                            <ProfessionalDocumentViewer
                                                documents={lesson.documents}
                                                onProgressUpdate={updateProgress}
                                                auth={auth}
                                            />
                                        )}
                                    </div>
                                </motion.div>

                                <ReviewsSection
                                    reviews={reviews}
                                    averageRating={averageRating}
                                    hasReviewed={hasReviewed}
                                    onReviewClick={() => setShowReviewModal(true)}
                                    auth={auth}
                                />
                            </div>

                            <div className="lg:col-span-1">
                                <LessonInfoCard lesson={lesson} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showReviewModal && (
                <ReviewModal
                    type="lesson"
                    id={lesson.id}
                    title={lesson.title_ar}
                    show={showReviewModal}
                    onClose={() => setShowReviewModal(false)}
                />
            )}

            {showShareModal && (
                <ShareModal
                    show={showShareModal}
                    onClose={() => setShowShareModal(false)}
                    shareLinks={shareLinks}
                    onCopyLink={copyLink}
                />
            )}
        </>
    );
}

function OldProfessionalVideoPlayer({ url, initialProgress, onProgress, auth }) {
    const [playing, setPlaying] = useState(false);
    const [played, setPlayed] = useState(initialProgress / 100);
    const [duration, setDuration] = useState(0);
    const [seeking, setSeeking] = useState(false);
    const [volume, setVolume] = useState(0.8);
    const [muted, setMuted] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showControls, setShowControls] = useState(true);
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && duration > 0 && initialProgress > 0) {
            const seekTime = (initialProgress / 100) * duration;
            videoRef.current.currentTime = seekTime;
        }
    }, [duration, initialProgress]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (playing && onProgress && auth.user) {
                const currentProgress = Math.round(played * 100);
                const timeSpent = Math.round((duration * played) / 60);
                onProgress({
                    progress: currentProgress,
                    videoProgress: currentProgress,
                    timeSpent: timeSpent,
                });
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [playing, played, duration, auth.user]);

    const handleProgress = (e) => {
        if (!seeking) {
            const video = e.target;
            setPlayed(video.currentTime / video.duration);
        }
    };

    const handleSeek = (e) => {
        const newValue = parseFloat(e.target.value);
        setPlayed(newValue);
        if (videoRef.current) {
            videoRef.current.currentTime = newValue * duration;
        }
    };

    const formatTime = (seconds) => {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            videoRef.current?.parentElement?.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    return (
        <div
            className="relative bg-black rounded-lg overflow-hidden group"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
        >
            <video
                ref={videoRef}
                src={url}
                className="w-full aspect-video"
                onClick={() => setPlaying(!playing)}
                onTimeUpdate={handleProgress}
                onLoadedMetadata={(e) => setDuration(e.target.duration)}
                onEnded={() => setPlaying(false)}
            />

            <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity ${playing ? 'opacity-0' : 'opacity-100'}`}>
                <button
                    onClick={() => {
                        setPlaying(true);
                        videoRef.current?.play();
                    }}
                    className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center pointer-events-auto hover:bg-white transition-colors"
                >
                    <svg className="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                </button>
            </div>

            <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                <div className="flex items-center gap-3 mb-2">
                    <button
                        onClick={() => {
                            setPlaying(!playing);
                            if (playing) {
                                videoRef.current?.pause();
                            } else {
                                videoRef.current?.play();
                            }
                        }}
                        className="text-white hover:text-blue-400 transition-colors"
                    >
                        {playing ? (
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                        )}
                    </button>

                    <button
                        onClick={() => {
                            setMuted(!muted);
                            if (videoRef.current) videoRef.current.muted = !muted;
                        }}
                        className="text-white hover:text-blue-400 transition-colors"
                    >
                        {muted ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                            </svg>
                        )}
                    </button>

                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => {
                            setVolume(parseFloat(e.target.value));
                            if (videoRef.current) videoRef.current.volume = parseFloat(e.target.value);
                        }}
                        className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />

                    <div className="flex-1 mx-3">
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.001"
                            value={played}
                            onMouseDown={() => setSeeking(true)}
                            onChange={handleSeek}
                            onMouseUp={() => setSeeking(false)}
                            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                            style={{
                                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${played * 100}%, #4b5563 ${played * 100}%, #4b5563 100%)`,
                            }}
                        />
                    </div>

                    <span className="text-white text-sm font-mono">
                        {formatTime(duration * played)} / {formatTime(duration)}
                    </span>

                    <select
                        value={playbackRate}
                        onChange={(e) => {
                            setPlaybackRate(parseFloat(e.target.value));
                            if (videoRef.current) videoRef.current.playbackRate = parseFloat(e.target.value);
                        }}
                        className="bg-gray-700 text-white text-sm rounded px-2 py-1 cursor-pointer"
                    >
                        <option value="0.5">0.5x</option>
                        <option value="0.75">0.75x</option>
                        <option value="1">1x</option>
                        <option value="1.25">1.25x</option>
                        <option value="1.5">1.5x</option>
                        <option value="2">2x</option>
                    </select>

                    <button
                        onClick={toggleFullscreen}
                        className="text-white hover:text-blue-400 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                {auth.user && (
                    <div className="text-xs text-gray-300">
                        نسبة الإكمال: {Math.round(played * 100)}%
                    </div>
                )}
            </div>
        </div>
    );
}

function OldProfessionalDocumentViewer({ url, fileName, onProgressUpdate }) {
    const [zoom, setZoom] = useState(100);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [hasStartedReading, setHasStartedReading] = useState(false);
    const iframeRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const scrollTop = container.scrollTop;
            const scrollHeight = container.scrollHeight - container.clientHeight;
            const progress = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;

            setScrollProgress(progress);

            if (!hasStartedReading && progress > 5) {
                setHasStartedReading(true);
            }

            if (onProgressUpdate && hasStartedReading) {
                onProgressUpdate(progress);
            }
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [hasStartedReading, onProgressUpdate]);

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        link.setAttribute('target', '_blank');
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const handlePrint = () => {
        const printWindow = window.open(url, '_blank');
        printWindow?.print();
    };

    const getFileType = (url) => {
        const extension = url.split('.').pop().toLowerCase();
        return extension;
    };

    const fileType = getFileType(url);

    return (
        <div className="border rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 border-b">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg">
                            <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">{fileName}</h3>
                            <p className="text-sm text-gray-600">{fileType.toUpperCase()}</p>
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
                            onClick={handleDownload}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                            title="تحميل"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span className="hidden sm:inline">تحميل</span>
                        </button>
                    </div>
                </div>

                {hasStartedReading && (
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-blue-900">نسبة القراءة:</span>
                        <div className="flex-1 bg-white rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${scrollProgress}%` }}
                            ></div>
                        </div>
                        <span className="text-sm font-bold text-blue-900 min-w-[45px]">{scrollProgress}%</span>
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
                        src={url}
                        className="w-full bg-white shadow-2xl rounded-lg border-2 border-gray-200"
                        style={{
                            height: `${600 * (zoom / 100)}px`,
                            transform: `scale(${zoom / 100})`,
                            transformOrigin: 'top center',
                            transition: 'transform 0.2s ease'
                        }}
                        title={fileName}
                    />
                </div>
            </div>
        </div>
    );
}

function LessonInfoCard({ lesson }) {
    return (
        <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
            <h3 className="font-semibold text-gray-900 mb-4">معلومات الدرس</h3>

            <div className="space-y-3">
                {lesson.subject && (
                    <div className="flex items-start gap-2 text-sm">
                        <BookOpenIcon className="w-4 h-4 text-gray-600 mt-0.5" />
                        <div>
                            <p className="text-gray-600">المادة:</p>
                            <p className="text-gray-900 font-medium">{lesson.subject.name_ar}</p>
                        </div>
                    </div>
                )}

                {lesson.duration_minutes && (
                    <div className="flex items-start gap-2 text-sm">
                        <ClockIcon className="w-4 h-4 text-gray-600 mt-0.5" />
                        <div>
                            <p className="text-gray-600">المدة:</p>
                            <p className="text-gray-900 font-medium">{lesson.duration_minutes} دقيقة</p>
                        </div>
                    </div>
                )}

                {lesson.course && (
                    <div className="flex items-start gap-2 text-sm">
                        <AcademicCapIcon className="w-4 h-4 text-gray-600 mt-0.5" />
                        <div>
                            <p className="text-gray-600">جزء من الكورس:</p>
                            <Link
                                href={route('public.courses.show', lesson.course.id)}
                                className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                                {lesson.course.title_ar}
                            </Link>
                        </div>
                    </div>
                )}

                <div className="pt-3 border-t">
                    {lesson.is_free ? (
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            درس مجاني
                        </span>
                    ) : (
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            درس مدفوع
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

function ReviewsSection({ reviews, averageRating, hasReviewed, onReviewClick, auth }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm p-6"
        >
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">التقييمات</h2>
                {auth.user && !hasReviewed && (
                    <button
                        onClick={onReviewClick}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                        اكتب تقييم
                    </button>
                )}
            </div>

            {averageRating > 0 && (
                <div className="flex items-center gap-4 mb-6 p-4 bg-yellow-50 rounded-lg">
                    <div className="text-center">
                        <p className="text-4xl font-bold text-yellow-600">{averageRating}</p>
                        <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                                <StarIconSolid
                                    key={i}
                                    className={`w-4 h-4 ${i < Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="text-sm text-gray-600">
                        <p>{reviews.total} تقييم</p>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {reviews.data.length === 0 ? (
                    <p className="text-center text-gray-600 py-8">لا توجد تقييمات بعد</p>
                ) : (
                    reviews.data.map((review) => (
                        <div key={review.id} className="border-b pb-4 last:border-b-0">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <p className="font-medium text-gray-900">{review.reviewer?.name}</p>
                                    <div className="flex items-center gap-1 mt-1">
                                        {[...Array(5)].map((_, i) => (
                                            <StarIconSolid
                                                key={i}
                                                className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <span className="text-sm text-gray-500">
                                    {new Date(review.created_at).toLocaleDateString('ar-DZ')}
                                </span>
                            </div>
                            {review.comment_ar && (
                                <p className="text-gray-700">{review.comment_ar}</p>
                            )}
                        </div>
                    ))
                )}
            </div>
        </motion.div>
    );
}

function ReviewModal({ type, id, title, show, onClose }) {
    const { data, setData, post, processing, errors } = useForm({
        type: type,
        id: id,
        rating: 5,
        comment: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('public.reviews.submit'), {
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="p-6" dir="rtl">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    كتابة تقييم
                </h2>

                <p className="text-gray-700 mb-6">{title}</p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            التقييم
                        </label>
                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((rating) => (
                                <button
                                    key={rating}
                                    type="button"
                                    onClick={() => setData('rating', rating)}
                                    className="focus:outline-none"
                                >
                                    {data.rating >= rating ? (
                                        <StarIconSolid className="w-10 h-10 text-yellow-400" />
                                    ) : (
                                        <StarIcon className="w-10 h-10 text-gray-300" />
                                    )}
                                </button>
                            ))}
                        </div>
                        {errors.rating && (
                            <p className="mt-1 text-sm text-red-600">{errors.rating}</p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            تعليقك (اختياري)
                        </label>
                        <textarea
                            value={data.comment}
                            onChange={(e) => setData('comment', e.target.value)}
                            rows="4"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="شارك رأيك..."
                        />
                        {errors.comment && (
                            <p className="mt-1 text-sm text-red-600">{errors.comment}</p>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? 'جارٍ الإرسال...' : 'إرسال التقييم'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}

function ShareModal({ show, onClose, shareLinks, onCopyLink }) {
    return (
        <Modal show={show} onClose={onClose} maxWidth="sm">
            <div className="p-6" dir="rtl">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    مشاركة الدرس
                </h2>

                <div className="grid grid-cols-2 gap-3">
                    <a
                        href={shareLinks.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <span>Facebook</span>
                    </a>
                    <a
                        href={shareLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 p-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                    >
                        <span>Twitter</span>
                    </a>
                    <a
                        href={shareLinks.whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                        <span>WhatsApp</span>
                    </a>
                    <a
                        href={shareLinks.telegram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        <span>Telegram</span>
                    </a>
                </div>

                <button
                    onClick={onCopyLink}
                    className="w-full mt-4 p-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    نسخ الرابط
                </button>
            </div>
        </Modal>
    );
}
