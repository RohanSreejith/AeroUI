import React, { createContext, useContext, useState, ReactNode } from 'react';

interface HandPosition {
    x: number;
    y: number;
    z: number;
    isPinching: boolean;
    isHovering: boolean;
}

interface GestureContextType {
    handPosition: HandPosition | null;
    setHandPosition: (pos: HandPosition | null) => void;
    cursorMode: 'default' | 'click' | 'drag';
    setCursorMode: (mode: 'default' | 'click' | 'drag') => void;
}

const GestureContext = createContext<GestureContextType | undefined>(undefined);

export const GestureProvider = ({ children }: { children: ReactNode }) => {
    const [handPosition, setHandPosition] = useState<HandPosition | null>(null);
    const [cursorMode, setCursorMode] = useState<'default' | 'click' | 'drag'>('default');

    return (
        <GestureContext.Provider value={{ handPosition, setHandPosition, cursorMode, setCursorMode }}>
            {children}
        </GestureContext.Provider>
    );
};

export const useGesture = () => {
    const context = useContext(GestureContext);
    if (!context) throw new Error('useGesture must be used within a GestureProvider');
    return context;
};
