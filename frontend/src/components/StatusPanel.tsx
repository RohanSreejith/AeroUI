import React, { useState, useEffect } from 'react';
import { Wifi, Signal, Battery, BatteryCharging } from 'lucide-react';
import { format } from 'date-fns';

const StatusPanel = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex justify-between items-center mb-6 pl-2 pr-4">
            {/* Clock */}
            <div className="flex flex-col">
                <span className="text-5xl font-light tracking-tight text-white drop-shadow-glow">
                    {format(currentTime, 'h:mm')}
                </span>
                <span className="text-lg text-automotive-500 font-medium tracking-widest uppercase">
                    {format(currentTime, 'EEEE, MMM d')}
                </span>
            </div>

            {/* Status Icons */}
            <div className="flex items-center gap-6 text-automotive-highlight">
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold tracking-wider">5G</span>
                        <Signal size={20} className="drop-shadow-glow-blue" />
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs opacity-70">Connected</span>
                        <Wifi size={16} />
                    </div>
                </div>

                <div className="h-10 w-[1px] bg-white/10 mx-2"></div>

                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <span className="text-2xl font-bold text-automotive-accent text-glow-accent">86%</span>
                        <span className="text-[10px] uppercase tracking-wider text-white/60">Range: 320mi</span>
                    </div>
                    <BatteryCharging size={32} className="text-automotive-accent drop-shadow-glow" />
                </div>
            </div>
        </div>
    );
};

export default StatusPanel;
