import { useState, useRef, useEffect } from 'react';
import { PlayIcon, PauseIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';

export default function ProfessionalVideoPlayer({ url, initialProgress, onProgress, auth, lesson }) {
    const [isOpen, setIsOpen] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [played, setPlayed] = useState(initialProgress / 100);
    const [duration, setDuration] = useState(0);
    const [seeking, setSeeking] = useState(false);
    const [volume, setVolume] = useState(0.8);
    const [muted, setMuted] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showControls, setShowControls] = useState(true);
    const videoRef = useRef(null);
    const progressIntervalRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && duration > 0 && initialProgress > 0) {
            const seekTime = (initialProgress / 100) * duration;
            videoRef.current.currentTime = seekTime;
        }
    }, [duration, initialProgress]);

    useEffect(() => {
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
        }

        if (playing && onProgress && auth.user) {
            progressIntervalRef.current = setInterval(() => {
                if (videoRef.current && duration > 0) {
                    const currentProgress = Math.round((videoRef.current.currentTime / duration) * 100);
                    const timeSpent = Math.round(videoRef.current.currentTime / 60);
                    onProgress({
                        videoProgress: currentProgress,
                        timeSpent: timeSpent,
                    });
                }
            }, 10000);
        }

        return () => {
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
        };
    }, [playing, duration, auth.user, onProgress]);

    const handleProgress = (e) => {
        if (!seeking && videoRef.current) {
            const video = e.target;
            const currentPlayed = video.currentTime / video.duration;
            setPlayed(currentPlayed);
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

    const togglePlayer = () => {
        setIsOpen(!isOpen);
        if (!isOpen && videoRef.current) {
            setTimeout(() => {
                if (initialProgress > 0 && duration > 0) {
                    const seekTime = (initialProgress / 100) * duration;
                    videoRef.current.currentTime = seekTime;
                }
            }, 100);
        }
    };

    return (
        <div className="mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                        <PlayIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold">مشغل الفيديو</h3>
                        <p className="text-blue-100 text-sm">
                            {auth.user && `التقدم: ${Math.round(played * 100)}%`}
                        </p>
                    </div>
                </div>
                <button
                    onClick={togglePlayer}
                    className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center gap-2"
                >
                    {isOpen ? (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            إغلاق المشغل
                        </>
                    ) : (
                        <>
                            <PlayIcon className="w-5 h-5" />
                            فتح المشغل
                        </>
                    )}
                </button>
            </div>

            {isOpen && (
                <div className="border border-gray-200 rounded-b-lg overflow-hidden bg-black">
                    <div
                        className="relative group"
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
                            onEnded={() => {
                                setPlaying(false);
                                if (onProgress && auth.user) {
                                    onProgress({ videoProgress: 100 });
                                }
                            }}
                        />

                        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity ${playing ? 'opacity-0' : 'opacity-100'}`}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setPlaying(true);
                                    videoRef.current?.play();
                                }}
                                className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center pointer-events-auto hover:bg-white transition-colors shadow-2xl"
                            >
                                <PlayIcon className="w-10 h-10 text-blue-600 mr-1" />
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
                                        <PauseIcon className="w-6 h-6" />
                                    ) : (
                                        <PlayIcon className="w-6 h-6" />
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
                                        <SpeakerXMarkIcon className="w-5 h-5" />
                                    ) : (
                                        <SpeakerWaveIcon className="w-5 h-5" />
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
                </div>
            )}
        </div>
    );
}
