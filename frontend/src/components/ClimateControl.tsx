import React, { useState } from 'react';
import { Fan } from 'lucide-react';
import KnobControl from './KnobControl';

interface ClimateControlProps {
    isActive?: boolean;
    onActivate?: () => void;
}

const ClimateControl: React.FC<ClimateControlProps> = ({ isActive, onActivate }) => {
    const [temp, setTemp] = useState(21);
    const [isAuto, setIsAuto] = useState(false);

    return (
        <div className={`glass-panel p-5 flex flex-col items-center justify-center relative overflow-hidden h-full transition-all duration-300 ${isActive ? 'ring-2 ring-cyan-400 bg-cyan-900/20' : ''}`}>
            <KnobControl
                value={temp}
                min={16}
                max={30}
                step={0.5}
                onChange={setTemp}
                onClick={onActivate} // First click activates
                onSecondaryClick={() => setIsAuto(!isAuto)} // Second click (when active) toggles Auto
                isActive={isActive}
                label={isAuto ? "AUTO CLIMATE" : "MANUAL"}
                icon={<Fan size={28} className={isAuto ? "text-green-400 animate-spin-slow" : "text-white"} />}
                colorClass={isAuto ? "text-green-500" : "text-red-500"}
                unit="°C"
            />
        </div>
    );
};

export default ClimateControl;
