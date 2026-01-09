import React, { useState, useEffect } from 'react';
import { Settings, Music, Fan, Map, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('home');

    return (
        <div className="flex h-full w-full bg-gradient-to-br from-automotive-900 to-automotive-800 text-white p-6 gap-6">
            {/* Sidebar */}
            <nav className="w-24 flex flex-col items-center gap-8 py-8 bg-automotive-800/50 backdrop-blur-md rounded-2xl border border-automotive-700 shadow-xl">
                <NavIcon icon={<Settings />} active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
                <NavIcon icon={<Music />} active={activeTab === 'media'} onClick={() => setActiveTab('media')} />
                <NavIcon icon={<Fan />} active={activeTab === 'climate'} onClick={() => setActiveTab('climate')} />
                <NavIcon icon={<Map />} active={activeTab === 'nav'} onClick={() => setActiveTab('nav')} />
                <NavIcon icon={<Phone />} active={activeTab === 'phone'} onClick={() => setActiveTab('phone')} />
            </nav>

            {/* Main Content */}
            <main className="flex-1 bg-automotive-800/30 backdrop-blur-sm rounded-2xl border border-automotive-700 p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-automotive-500 to-transparent opacity-50"></div>

                <h1 className="text-4xl font-bold mb-8 tracking-wider bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    {activeTab.toUpperCase()}
                </h1>

                <div className="grid grid-cols-2 gap-8">
                    <div className="h-64 rounded-xl bg-black/40 border border-white/10 p-6">
                        <h2 className="text-xl text-automotive-400 mb-4">Vehicle Status</h2>
                        <div className="text-5xl font-mono">68°F</div>
                        <div className="text-sm text-gray-400 mt-2">Interior Temp</div>
                    </div>
                    <div className="h-64 rounded-xl bg-black/40 border border-white/10 p-6 flex items-center justify-center">
                        <div
                            onClick={() => alert("Engine Started!")}
                            className="w-32 h-32 rounded-full border-4 border-automotive-500 flex items-center justify-center relative cursor-pointer hover:scale-105 transition-transform active:scale-95 bg-black/50"
                        >
                            <span className="text-2xl font-bold">START</span>
                            <div className="absolute inset-0 rounded-full border-t-4 border-automotive-accent animate-spin duration-[3000ms]"></div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const NavIcon = ({ icon, active, onClick }: { icon: any, active: boolean, onClick: () => void }) => (
    <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={`p-4 rounded-xl transition-all duration-300 ${active
            ? 'bg-automotive-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]'
            : 'text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
    >
        {React.cloneElement(icon, { size: 28 })}
    </motion.button>
);

export default Dashboard;
