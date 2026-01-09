import React, { useState, useEffect, useRef } from 'react';
import { Camera, Music, Phone, Fan, Wifi, Signal, Thermometer, Navigation, Play, SkipForward, SkipBack, Wind, Pause } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useGesture } from '../context/GestureContext';

const PLAYLIST = [
    { title: "Blinding Lights", artist: "The Weeknd", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" }, // Using valid sample
    { title: "Levitating", artist: "Dua Lipa", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
    { title: "Save Your Tears", artist: "The Weeknd", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" }
];

const Dashboard = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const { isCameraVisible, setIsCameraVisible, gestureEvent, setGestureEvent } = useGesture();

    // Media State
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(50);
    const audioRef = useRef<HTMLAudioElement>(null);

    // Mock Data
    const [temp, setTemp] = useState(22);
    // Control Mode: 'temp' or 'volume'
    const [controlMode, setControlMode] = useState<'temp' | 'volume'>('temp');

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Mute State
    const [isMuted, setIsMuted] = useState(false);
    const [prevVolume, setPrevVolume] = useState(50);

    // Audio Effect: Sync volume and pause state
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume / 100;
            // Only force pause if we strictly want it stopped.
            // If isPlaying is true, autoPlay handles it, or we let it run.
            if (!isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play().catch(e => console.log("Autoplay blocked/pending:", e));
            }
        }
    }, [volume, isPlaying, currentSongIndex]);

    const handleNext = () => {
        setCurrentSongIndex(prev => (prev + 1) % PLAYLIST.length);
        setIsPlaying(true);
    };

    const handlePrev = () => {
        setCurrentSongIndex(prev => (prev - 1 + PLAYLIST.length) % PLAYLIST.length);
        setIsPlaying(true);
    };

    // Handle Gestures
    useEffect(() => {
        if (!gestureEvent) return;

        if (gestureEvent === 'ROTATE_CW') {
            if (controlMode === 'temp') setTemp(prev => Math.min(prev + 1, 30));
            if (controlMode === 'volume') {
                if (isMuted) {
                    setVolume(prevVolume);
                    setIsMuted(false);
                } else {
                    setVolume(prev => Math.min(prev + 2, 100));
                }
            }
        } else if (gestureEvent === 'ROTATE_CCW') {
            if (controlMode === 'temp') setTemp(prev => Math.max(prev - 1, 16));
            if (controlMode === 'volume') setVolume(prev => Math.max(prev - 2, 0));
        } else if (gestureEvent === 'FIST_CLOSED') {
            if (!isMuted) {
                setPrevVolume(volume);
                setVolume(0);
                setIsMuted(true);
            }
        } else if (gestureEvent === 'FIST_OPEN') {
            if (isMuted) {
                setVolume(prevVolume);
                setIsMuted(false);
            }
        } else if (gestureEvent === 'SWIPE_RIGHT') {
            handleNext();
        } else if (gestureEvent === 'SWIPE_LEFT') {
            handlePrev();
        }

        // Reset event after handling ONLY for discrete actions (Rotations/Swipes)
        // We do NOT reset Fists because they are stateful poses.
        if (gestureEvent && (gestureEvent.startsWith('ROTATE') || gestureEvent.startsWith('SWIPE'))) {
            const timeout = setTimeout(() => setGestureEvent(null), 300);
            return () => clearTimeout(timeout);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gestureEvent, controlMode]);

    const currentSong = PLAYLIST[currentSongIndex];

    return (
        <div className="flex flex-col h-full w-full bg-black text-white p-6 font-sans overflow-hidden select-none">
            {/* Hidden Audio Element */}
            <audio
                ref={audioRef}
                src={currentSong.url}
                onEnded={handleNext}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
            />

            {/* --- TOP STATUS BAR --- */}
            <header className="flex justify-between items-center mb-4 px-2">
                <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-medium tracking-tight text-white">{format(currentTime, 'h:mm')}</span>
                    <span className="text-xl text-gray-500">{format(currentTime, 'a')}</span>
                </div>

                <div className="flex items-center gap-6 text-gray-400">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${controlMode === 'volume' ? 'border-blue-500 text-blue-400' : 'border-transparent'}`}>
                        <Music size={18} />
                        <span className="text-lg font-mono">{volume}%</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Thermometer size={18} />
                        <span className="text-lg text-white">1°C</span>
                    </div>
                    <Wifi size={20} />
                    <Signal size={20} />

                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsCameraVisible(!isCameraVisible)}
                        className={`p-2 rounded-full border ${isCameraVisible ? 'bg-blue-600 border-blue-500 text-white' : 'bg-transparent border-gray-700 text-gray-500'}`}
                    >
                        <Camera size={20} />
                    </motion.button>
                </div>
            </header>

            {/* --- MAIN GRID --- */}
            <main className="flex-1 grid grid-cols-12 gap-6 mb-6 min-h-0">
                {/* ... (LEFT MAP REMAINS SAME) ... */}
                <div className="col-span-7 bg-gray-900/50 rounded-3xl border border-white/10 p-6 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                    <div className="relative z-10">
                        <div className="flex items-start gap-4 mb-8">
                            <div className="bg-blue-600 p-3 rounded-xl text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                                <Navigation size={32} fill="currentColor" />
                            </div>
                            <div>
                                <div className="text-blue-400 font-bold tracking-wider text-sm mb-1 uppercase">Next Turn</div>
                                <div className="text-3xl font-bold text-white">Lexington Ave</div>
                            </div>
                        </div>
                    </div>
                    <div className="relative z-10 bg-black/40 backdrop-blur-sm rounded-2xl p-4 border border-white/5 flex justify-between items-center">
                        <div>
                            <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Destination</div>
                            <div className="text-xl font-medium">Home</div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold">5 <span className="text-sm font-normal text-gray-500">min</span></div>
                            <div className="text-xs text-green-500">Fastest Route</div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: MEDIA & SHORTCUTS */}
                <div className="col-span-5 flex flex-col gap-6">

                    {/* MEDIA PLAYER BOX */}
                    <div className="flex-1 bg-gray-900/50 rounded-3xl border border-white/10 p-6 flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-transparent"></div>

                        <div className="relative z-10 flex gap-5 items-center">
                            <div className="w-28 h-28 bg-gray-800 rounded-xl border border-white/10 flex items-center justify-center shadow-lg">
                                <Music size={40} className="text-gray-600" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-indigo-400 font-bold tracking-widest uppercase">Now Playing</span>
                                <h2 className="text-2xl font-bold text-white leading-tight truncate">{currentSong.title}</h2>
                                <p className="text-gray-400 text-lg">{currentSong.artist}</p>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="relative z-10">
                            <div className="w-full h-1 bg-gray-800 rounded-full mb-6 relative">
                                <div className="h-full bg-white rounded-full transition-all duration-300" style={{ width: `${volume}%` }}></div>
                            </div>
                            <div className="flex justify-center mb-2">
                                <span className="text-xs text-gray-500 uppercase tracking-widest">{controlMode === 'volume' ? 'Volume Control Active' : 'Media Control'}</span>
                            </div>
                            <div className="flex justify-between items-center px-4">
                                <SkipBack size={28} className="text-gray-400 hover:text-white cursor-pointer" onClick={handlePrev} />
                                <button
                                    onClick={() => {
                                        if (isPlaying) {
                                            audioRef.current?.pause();
                                        } else {
                                            audioRef.current?.play();
                                        }
                                        setIsPlaying(!isPlaying);
                                    }}
                                    className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform"
                                >
                                    {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                                </button>
                                <SkipForward size={28} className="text-gray-400 hover:text-white cursor-pointer" onClick={handleNext} />
                            </div>
                        </div>
                    </div>

                    {/* CONTROL MODES */}
                    <div className="h-32 grid grid-cols-2 gap-4">
                        <ShortcutCard
                            icon={<Fan size={24} />}
                            label="Temp Control"
                            active={controlMode === 'temp'}
                            onClick={() => setControlMode('temp')}
                        />
                        <ShortcutCard
                            icon={<Music size={24} />}
                            label="Volume Control"
                            active={controlMode === 'volume'}
                            onClick={() => setControlMode('volume')}
                        />
                    </div>
                </div>
            </main>

            {/* --- CLIMATE FOOTER --- */}
            <footer className={`h-24 bg-gray-900 rounded-2xl border transition-colors duration-300 flex items-center justify-center gap-12 px-10 ${controlMode === 'temp' ? 'border-blue-500/50' : 'border-white/10'}`}>
                <div className="flex items-center gap-4 text-gray-500">
                    <Wind size={24} />
                    <span className="text-4xl font-thin text-white tracking-widest">{temp}°C</span>
                    <Fan size={24} className="text-white" />
                </div>
            </footer>
        </div>
    );
};

const ShortcutCard = ({ icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) => (
    <div
        onClick={onClick}
        className={`rounded-2xl border p-4 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer select-none ${active ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-gray-800 border-white/5 text-gray-400 hover:bg-gray-700'}`}
    >
        {icon}
        <span className="text-xs font-bold tracking-wide uppercase">{label}</span>
        {active && <span className="text-[10px] opacity-80">Gestures Active</span>}
    </div>
);

export default Dashboard;
