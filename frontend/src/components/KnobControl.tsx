import React, { useState, useEffect, useRef } from 'react';
import { useGesture } from '../context/GestureContext';
import { motion, AnimatePresence } from 'framer-motion';

interface KnobControlProps {
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (value: number) => void;
    label: string;
    icon: React.ReactNode;
    colorClass?: string;
    unit?: string;
    onClick?: () => void;
    onSecondaryClick?: () => void;
    onFistClose?: () => void;
    onFistOpen?: () => void;
    isActive?: boolean;
}

const KnobControl: React.FC<KnobControlProps> = ({
    value,
    min,
    max,
    step = 1,
    onChange,
    label,
    icon,
    colorClass = "text-cyan-400",
    unit = "",
    onClick,
    onSecondaryClick,
    onFistClose,
    onFistOpen,
    isActive = false
}) => {
    const { gestureEvent, setGestureEvent } = useGesture();

    // SVG Constants for Arc
    const radius = 70;
    const center = 80;
    const circumference = 2 * Math.PI * radius;
    const arcAngle = 270; // 270 degree sweep
    const startAngle = 135; // Start at bottom-left

    // Map value to arc length
    const dashOffset = () => {
        const percentage = (value - min) / (max - min);
        const arcLength = (arcAngle / 360) * circumference;
        return circumference - (percentage * arcLength);
    };

    // Interaction handling
    const knobRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startY, setStartY] = useState(0);
    const [startValue, setStartValue] = useState(0);
    const [isPressed, setIsPressed] = useState(false);

    // --- GESTURE HANDLING ---
    useEffect(() => {
        if (!isActive || !gestureEvent) return;

        if (gestureEvent === "ROTATE_CW") {
            const newValue = Math.min(max, value + (step * 5));
            onChange(newValue);
            setGestureEvent(null);
        } else if (gestureEvent === "ROTATE_CCW") {
            const newValue = Math.max(min, value - (step * 5));
            onChange(newValue);
            setGestureEvent(null);
        } else if (gestureEvent === "FIST_CLOSED") {
            if (onFistClose) onFistClose();
            setGestureEvent(null);
        } else if (gestureEvent === "FIST_OPEN") {
            if (onFistOpen) onFistOpen();
            setGestureEvent(null);
        }
    }, [gestureEvent, isActive, value, step, max, min, onChange, setGestureEvent, onFistClose, onFistOpen]);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        setStartY(e.clientY);
        setStartValue(value);
        setIsPressed(true);
    };

    useEffect(() => {
        let hasMoved = false;
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            const deltaY = startY - e.clientY;
            if (Math.abs(deltaY) > 5) {
                hasMoved = true;
                const valueChange = Math.round(deltaY / 5) * step;
                onChange(Math.max(min, Math.min(max, startValue + valueChange)));
            }
        };
        const handleMouseUp = () => {
            if (isDragging && !hasMoved) {
                if (isActive && onSecondaryClick) onSecondaryClick();
                else if (onClick) onClick();
            }
            setIsDragging(false);
            setIsPressed(false);
        };
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, startY, startValue, value, min, max, step, onChange, onClick, onSecondaryClick, isActive]);

    const activeColor = isActive ? "text-cyan-400" : colorClass;
    const glowColor = isActive ? "rgba(0, 229, 255, 0.5)" : "rgba(255, 0, 255, 0.3)";

    return (
        <div className="flex flex-col items-center gap-6 select-none relative">
            {/* 1. Value Display & Floating Label */}
            <div className="flex flex-col items-center z-20">
                <motion.span
                    animate={isActive ? { scale: [1, 1.1, 1], textShadow: "0 0 20px rgba(0,229,255,0.8)" } : {}}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className={`text-5xl font-thin tracking-tighter ${isActive ? 'text-cyan-400' : 'text-white'} drop-shadow-glow transition-colors`}
                >
                    {value}<span className="text-xl opacity-40 ml-1">{unit}</span>
                </motion.span>
                <span className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-bold mt-2">{label}</span>
            </div>

            {/* 2. Physical/Holographic Knob Container */}
            <div
                ref={knobRef}
                onMouseDown={handleMouseDown}
                className="relative w-48 h-48 flex items-center justify-center cursor-pointer group"
            >
                {/* Background "Socket" */}
                <div className="absolute inset-4 rounded-full bg-black/80 shadow-[inset_0_0_20px_rgba(0,0,0,1)] border border-white/5"></div>

                {/* --- DIGITAL LED ARC --- */}
                <svg className="absolute inset-0 w-full h-full -rotate-90 z-10 pointer-events-none" viewBox="0 0 160 160">
                    {/* Track */}
                    <circle
                        cx={center} cy={center} r={radius}
                        fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference * (1 - arcAngle / 360)}
                        style={{ transform: `rotate(${startAngle}deg)`, transformOrigin: 'center' }}
                    />
                    {/* Active Arc */}
                    <circle
                        cx={center} cy={center} r={radius}
                        fill="none"
                        stroke={isActive ? "#00E5FF" : "#FF00FF"}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        style={{
                            strokeDashoffset: dashOffset(),
                            transform: `rotate(${startAngle}deg)`,
                            transformOrigin: 'center',
                            transition: 'stroke-dashoffset 0.1s ease-out, stroke 0.3s ease',
                            filter: `drop-shadow(0 0 8px ${isActive ? '#00E5FF' : '#FF00FF'})`
                        }}
                    />
                </svg>

                {/* --- HOLOGRAPHIC FLOATING RING --- */}
                <AnimatePresence>
                    {isActive && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1.1, opacity: 1 }}
                            exit={{ scale: 1.2, opacity: 0 }}
                            className="absolute inset-0 rounded-full border border-cyan-400/30 animate-holographic pointer-events-none"
                            style={{ boxShadow: '0 0 30px rgba(0,229,255,0.2)' }}
                        >
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-cyan-400 rounded-full blur-sm"></div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* --- CENTER CAP (Raised) --- */}
                <motion.div
                    animate={isPressed ? { scale: 0.92 } : { scale: 1 }}
                    className={`relative w-28 h-28 rounded-full z-20 flex items-center justify-center transition-all duration-300
                        ${isActive ? 'bg-gradient-to-br from-gray-800 to-black shadow-[0_15px_35px_rgba(0,0,0,0.8),inset_0_2px_10px_rgba(0,229,255,0.2)]'
                            : 'bg-gradient-to-br from-gray-900 to-[#050505] shadow-[0_10px_25px_rgba(0,0,0,0.8)]'}
                        border border-white/10
                    `}
                >
                    {/* Inner Recess */}
                    <div className="w-16 h-16 rounded-full bg-black/60 shadow-[inset_0_2px_8px_rgba(0,0,0,0.9)] flex items-center justify-center relative overflow-hidden">
                        <div className={`absolute inset-0 opacity-20 ${isActive ? 'bg-cyan-400' : 'bg-magenta-500'} blur-xl`}></div>
                        <div className={`${isActive ? 'text-cyan-400 scale-110' : 'text-white/60'} transition-all duration-500 drop-shadow-glow`}>
                            {icon}
                        </div>
                    </div>

                    {/* Glossy Reflection */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none"></div>
                </motion.div>

                {/* Ambient Floor Glow */}
                <div className={`absolute -inset-4 rounded-full blur-3xl transition-opacity duration-500 -z-10 
                    ${isActive ? 'opacity-40 bg-cyan-500' : 'opacity-10 bg-magenta-500'}`}
                ></div>
            </div>

            {/* Gesture Prompt */}
            <div className="flex flex-col items-center">
                <div className={`text-[9px] font-bold tracking-[0.4em] transition-all duration-300 
                    ${isActive ? 'text-cyan-400 translate-y-0' : 'text-white/20 translate-y-2'}`}
                >
                    {isActive ? "TOUCHLESS SENSOR ACTIVE" : "PRESS TO INITIALIZE"}
                </div>
            </div>
        </div>
    );
};

export default KnobControl;
