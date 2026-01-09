import React, { useState, useEffect } from 'react';
import { Camera, MapPin, Music, Phone, Fan, Wifi, Signal, Battery, ChevronRight, Play, SkipForward, SkipBack, Wind, Thermometer, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useGesture } from '../context/GestureContext';

const Dashboard = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const { isCameraVisible, setIsCameraVisible } = useGesture();

    // Mock Data
    const [temp, setTemp] = useState(72);
    const [passTemp, setPassTemp] = useState(74);
    const [isPlaying, setIsPlaying] = useState(true);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex flex-col h-full w-full bg-black text-white p-6 font-sans overflow-hidden select-none">

            {/* --- TOP STATUS BAR --- */}
            <header className="flex justify-between items-center mb-4 px-2">
                <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-medium tracking-tight text-white">{format(currentTime, 'h:mm')}</span>
                    <span className="text-xl text-gray-500">{format(currentTime, 'a')}</span>
                </div>

                <div className="flex items-center gap-6 text-gray-400">
                    <div className="flex items-center gap-2">
                        <Thermometer size={18} />
                        <span className="text-lg text-white">34°F</span>
                    </div>
                    <Wifi size={20} />
                    <Signal size={20} />

                    {/* Camera Toggle */}
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

                {/* LEFT: MAP / NAVIGATION BOX */}
                <div className="col-span-7 bg-gray-900/50 rounded-3xl border border-white/10 p-6 flex flex-col justify-between relative overflow-hidden">
                    {/* Grid Pattern Background */}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

                    {/* Content */}
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
                            {/* Album Art Placeholder Box */}
                            <div className="w-28 h-28 bg-gray-800 rounded-xl border border-white/10 flex items-center justify-center shadow-lg">
                                <Music size={40} className="text-gray-600" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-indigo-400 font-bold tracking-widest uppercase">Now Playing</span>
                                <h2 className="text-2xl font-bold text-white leading-tight">Blinding Lights</h2>
                                <p className="text-gray-400 text-lg">The Weeknd</p>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="relative z-10">
                            <div className="w-full h-1 bg-gray-800 rounded-full mb-6">
                                <div className="h-full w-1/3 bg-white rounded-full"></div>
                            </div>
                            <div className="flex justify-between items-center px-4">
                                <SkipBack size={28} className="text-gray-400 hover:text-white cursor-pointer" />
                                <button
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform"
                                >
                                    {isPlaying ? <div className="flex gap-1"><div className="w-1.5 h-5 bg-black rounded-full" /><div className="w-1.5 h-5 bg-black rounded-full" /></div> : <Play size={24} fill="currentColor" className="ml-1" />}
                                </button>
                                <SkipForward size={28} className="text-gray-400 hover:text-white cursor-pointer" />
                            </div>
                        </div>
                    </div>

                    {/* SHORTCUTS */}
                    <div className="h-32 grid grid-cols-3 gap-4">
                        <ShortcutCard icon={<Music size={24} />} label="Media" active />
                        <ShortcutCard icon={<Phone size={24} />} label="Phone" />
                        <ShortcutCard icon={<Fan size={24} />} label="Climate" />
                    </div>
                </div>

            </main>

            {/* --- CLIMATE FOOTER --- */}
            <footer className="h-24 bg-gray-900 rounded-2xl border border-white/10 flex items-center justify-between px-10">
                <TempAdjuster temp={temp} setTemp={setTemp} label="Driver" />

                <div className="flex items-center gap-12 text-gray-500">
                    <Wind size={24} />
                    <span className="text-4xl font-thin text-white tracking-widest">{temp}°</span>
                    <Fan size={24} className="text-white" />
                </div>

                <TempAdjuster temp={passTemp} setTemp={setPassTemp} label="Pass" />
            </footer>

        </div>
    );
};

const ShortcutCard = ({ icon, label, active }: { icon: any, label: string, active?: boolean }) => (
    <div className={`rounded-2xl border p-4 flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer ${active ? 'bg-gray-800 border-white/20 text-white' : 'bg-transparent border-white/5 text-gray-500 hover:border-white/10'}`}>
        {icon}
        <span className="text-xs font-medium tracking-wide">{label}</span>
    </div>
);

const TempAdjuster = ({ temp, setTemp, label }: { temp: number, setTemp: (t: number) => void, label: string }) => (
    <div className="flex items-center gap-4">
        <button onClick={() => setTemp(temp - 1)} className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-white">-</button>
        <div className="text-center w-12">
            <div className="text-2xl font-bold text-white">{temp}°</div>
            <div className="text-[10px] text-gray-500 font-bold uppercase">{label}</div>
        </div>
        <button onClick={() => setTemp(temp + 1)} className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-white">+</button>
    </div>
);

export default Dashboard;
