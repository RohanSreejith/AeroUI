import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGesture } from '../context/GestureContext';

const DigitalTwinCursor = () => {
    const { handPosition, cursorMode } = useGesture();
    // Safe default to prevent crash
    if (!handPosition) return null;

    const x = handPosition.x * window.innerWidth;
    const y = handPosition.y * window.innerHeight;

    return (
        <motion.div
            className="fixed top-0 left-0 pointer-events-none z-[8888]"
            animate={{ x, y }}
            transition={{
                type: "spring",
                stiffness: 800,
                damping: 30,
                mass: 0.2
            }}
        >
            {/* Cursor Graphic */}
            <div className={`
            relative -translate-x-1/2 -translate-y-1/2 
            flex items-center justify-center
            transition-all duration-200
            ${cursorMode === 'click' ? 'scale-75' : 'scale-100'}
        `}>
                {/* Core Dot */}
                <div className={`
                w-6 h-6 rounded-full 
                ${handPosition.isPinching ? 'bg-red-500 shadow-[0_0_20px_#ff0000]' : 'bg-cyan-400 shadow-[0_0_20px_#00ffff]'}
                border-2 border-white
            `}></div>

                {/* Ripple Effect */}
                <div className="absolute inset-0 w-full h-full animate-ping rounded-full bg-white opacity-20"></div>
            </div>
        </motion.div>
    );
};

export default DigitalTwinCursor;
