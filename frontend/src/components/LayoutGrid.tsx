import React, { ReactNode } from 'react';

interface LayoutGridProps {
    children: ReactNode;
}

const LayoutGrid: React.FC<LayoutGridProps> = ({ children }) => {
    return (
        <div className="grid grid-cols-12 gap-6 p-6 h-screen w-full box-border">
            {children}
        </div>
    );
};

export default LayoutGrid;
