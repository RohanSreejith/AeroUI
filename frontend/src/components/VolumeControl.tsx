import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import KnobControl from './KnobControl';

interface VolumeControlProps {
    isActive?: boolean;
    onActivate?: () => void;
}

const VolumeControl: React.FC<VolumeControlProps> = ({ isActive, onActivate }) => {
    const [volume, setVolume] = useState(45);
    const [isMuted, setIsMuted] = useState(false);
    const prevVolume = React.useRef(45);

    const toggleMute = () => {
        if (isMuted) {
            setVolume(prevVolume.current);
            setIsMuted(false);
        } else {
            prevVolume.current = volume;
            setVolume(0);
            setIsMuted(true);
        }
    };

    const handleVolumeChange = (v: number) => {
        setVolume(v);
        if (v > 0) setIsMuted(false);
    };

    const handleFistClose = () => {
        if (!isMuted && volume > 0) {
            prevVolume.current = volume;
            setVolume(0);
            setIsMuted(true);
        }
    };

    const handleFistOpen = () => {
        if (isMuted) {
            setVolume(prevVolume.current);
            setIsMuted(false);
        }
    };

    return (
        <div className={`glass-panel p-5 flex flex-col items-center justify-center relative overflow-hidden h-full transition-all duration-300 ${isActive ? 'ring-2 ring-cyan-400 bg-cyan-900/20' : ''}`}>
            <KnobControl
                value={volume}
                min={0}
                max={100}
                step={2}
                onChange={handleVolumeChange}
                onClick={onActivate} // First click activates
                onSecondaryClick={toggleMute} // Second click (when active) toggles Mute
                onFistClose={handleFistClose}
                onFistOpen={handleFistOpen}
                isActive={isActive}
                label={isMuted ? "MUTED" : "VOLUME"}
                icon={isMuted ? <VolumeX size={28} className="text-red-400" /> : <Volume2 size={28} className="text-white" />}
                colorClass={isMuted ? "text-red-500" : "text-automotive-highlight"}
            />
        </div>
    );
};

export default VolumeControl;
