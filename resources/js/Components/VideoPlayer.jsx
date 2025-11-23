import { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';

export default function VideoPlayer({
    url,
    onProgress,
    onComplete,
    initialProgress = 0,
    className = '',
}) {
    const [playing, setPlaying] = useState(false);
    const [played, setPlayed] = useState(initialProgress / 100);
    const [duration, setDuration] = useState(0);
    const [seeking, setSeeking] = useState(false);
    const playerRef = useRef(null);
    const progressIntervalRef = useRef(null);

    useEffect(() => {
        return () => {
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
        };
    }, []);

    const handleProgress = (state) => {
        if (!seeking) {
            setPlayed(state.played);

            if (onProgress) {
                onProgress({
                    progress: Math.round(state.played * 100),
                    timeSpent: Math.round(state.playedSeconds / 60),
                });
            }

            if (state.played >= 0.95 && onComplete) {
                onComplete();
            }
        }
    };

    const handleDuration = (duration) => {
        setDuration(duration);
    };

    const handleSeekChange = (e) => {
        setPlayed(parseFloat(e.target.value));
    };

    const handleSeekMouseDown = () => {
        setSeeking(true);
    };

    const handleSeekMouseUp = (e) => {
        setSeeking(false);
        if (playerRef.current) {
            playerRef.current.seekTo(parseFloat(e.target.value));
        }
    };

    const formatTime = (seconds) => {
        const date = new Date(seconds * 1000);
        const hh = date.getUTCHours();
        const mm = date.getUTCMinutes();
        const ss = date.getUTCSeconds().toString().padStart(2, '0');
        if (hh) {
            return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
        }
        return `${mm}:${ss}`;
    };

    return (
        <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
            <ReactPlayer
                ref={playerRef}
                url={url}
                playing={playing}
                controls={false}
                width="100%"
                height="100%"
                onProgress={handleProgress}
                onDuration={handleDuration}
                progressInterval={5000}
                config={{
                    file: {
                        attributes: {
                            controlsList: 'nodownload',
                        },
                    },
                }}
            />

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center space-x-4 rtl:space-x-reverse mb-2">
                    <button
                        onClick={() => setPlaying(!playing)}
                        className="text-white hover:text-blue-400 transition-colors"
                    >
                        {playing ? (
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                        )}
                    </button>

                    <div className="flex-1">
                        <input
                            type="range"
                            min={0}
                            max={0.999999}
                            step="any"
                            value={played}
                            onMouseDown={handleSeekMouseDown}
                            onChange={handleSeekChange}
                            onMouseUp={handleSeekMouseUp}
                            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                            style={{
                                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${played * 100}%, #4b5563 ${played * 100}%, #4b5563 100%)`,
                            }}
                        />
                    </div>

                    <div className="text-white text-sm font-mono">
                        {formatTime(duration * played)} / {formatTime(duration)}
                    </div>
                </div>

                {onProgress && (
                    <div className="text-xs text-gray-300">
                        نسبة الإكمال: {Math.round(played * 100)}%
                    </div>
                )}
            </div>

            <style jsx>{`
                .slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #3b82f6;
                    cursor: pointer;
                    border: 2px solid white;
                }

                .slider::-moz-range-thumb {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #3b82f6;
                    cursor: pointer;
                    border: 2px solid white;
                }
            `}</style>
        </div>
    );
}
