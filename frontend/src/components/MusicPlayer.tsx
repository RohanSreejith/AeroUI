import React, { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Music, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

const MusicPlayer = () => {
    const [isPlaying, setIsPlaying] = useState(false);

    const song = {
        title: "Starboy",
        artist: "The Weeknd",
        album: "Starboy"
    };

    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative glass-panel-light p-4 overflow-hidden group shadow-[0_15px_35px_rgba(0,0,0,0.4)]"
            style={{
                background: 'linear-gradient(90deg, rgba(30,41,59,0.4) 0%, rgba(15,23,42,0.6) 100%)',
                borderColor: 'rgba(255,255,255,0.05)'
            }}
        >
            {/* Background Animated Gradient */}
            <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-cyan-900 via-magenta-900 to-blue-900 -z-10 animate-pulse-glow"></div>

            <div className="flex items-center justify-between gap-6">
                {/* Left: Song Info */}
                <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center relative overflow-hidden shrink-0">
                        <Music size={20} className="text-cyan-400 drop-shadow-glow" />
                        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-magenta-500/10"></div>
                    </div>

                    <div className="min-w-0">
                        <h2 className="text-sm font-bold text-white tracking-wide truncate uppercase">{song.title}</h2>
                        <p className="text-xs text-cyan-400 font-mono opacity-60 truncate">{song.artist}</p>
                    </div>
                </div>

                {/* Center: Progress Visualizer */}
                <div className="hidden md:flex flex-col items-center gap-2 flex-1 px-4">
                    <div className="flex items-end gap-0.5 h-6">
                        {[0.4, 0.7, 1, 0.6, 0.8, 0.3, 0.9, 0.5, 0.7, 1].map((h, i) => (
                            <motion.div
                                key={i}
                                animate={isPlaying ? { height: [h * 10, h * 24, h * 10] } : { height: h * 10 }}
                                transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                                className="w-1 bg-cyan-400/40 rounded-full"
                            />
                        ))}
                    </div>
                </div>

                {/* Right: Controls */}
                <div className="flex items-center gap-4">
                    <button className="text-white/40 hover:text-cyan-400 transition-colors btn-automotive">
                        <SkipBack size={20} fill="currentColor" />
                    </button>

                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white border border-white/10 transition-all shadow-lg active:scale-90"
                    >
                        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                    </button>

                    <button className="text-white/40 hover:text-cyan-400 transition-colors btn-automotive">
                        <SkipForward size={20} fill="currentColor" />
                    </button>

                    <button className="ml-2 text-white/20 hover:text-magenta-400 transition-colors">
                        <Layers size={18} />
                    </button>
                </div>
            </div>

            {/* Glowing Bottom Accent Strip */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-30 shadow-[0_0_10px_cyan]"></div>
        </motion.div>
    );
};

export default MusicPlayer;
