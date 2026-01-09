import React from 'react';
import { Navigation, MapPin } from 'lucide-react';

const MapWidget = () => {
    return (
        <div className="h-full w-full glass-panel relative overflow-hidden group">
            {/* Mock Map Background */}
            <div className="absolute inset-0 bg-automotive-800 opacity-80"
                style={{
                    backgroundImage: 'radial-gradient(circle at 50% 50%, #1e293b 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}>
            </div>

            {/* Map Roads (Stylized svg or CSS) */}
            <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M40 100 L45 60 L60 40 L55 0" stroke="#3b82f6" strokeWidth="2" fill="none" />
                <path d="M0 80 L30 70 L45 60" stroke="#64748b" strokeWidth="1" fill="none" />
                <path d="M60 40 L90 35 L100 20" stroke="#64748b" strokeWidth="1" fill="none" />
            </svg>

            {/* Current Location Indicator */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                    <div className="w-16 h-16 bg-blue-500/20 rounded-full animate-ping absolute inset-0"></div>
                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-400/50 shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                        <Navigation size={32} fill="#3b82f6" className="text-white transform -rotate-45" />
                    </div>
                </div>
            </div>

            {/* Navigation Overlay */}
            <div className="absolute top-6 left-6 z-10">
                <div className="glass-panel-light p-4 flex items-center gap-4 border-l-4 border-l-blue-500">
                    <Navigation size={40} className="text-white" />
                    <div>
                        <div className="text-automotive-highlight text-sm font-bold uppercase tracking-wider">Next Turn</div>
                        <div className="text-3xl font-bold text-white">Lexington Ave</div>
                        <div className="text-white/50 text-sm mt-1">2.4 mi</div>
                    </div>
                </div>
            </div>

            {/* ETA Info */}
            <div className="absolute bottom-6 right-6 z-10">
                <div className="glass-panel-light p-4 px-6 text-right">
                    <div className="text-3xl font-bold text-white">12<span className="text-lg opacity-60">:45</span></div>
                    <div className="text-green-400 text-sm font-medium">On Time</div>
                </div>
            </div>
        </div>
    );
};

export default MapWidget;
