import React from 'react';
import Webcam from 'react-webcam';

const DebugCamera = () => {
    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            width: '300px',
            height: '200px',
            border: '5px solid red',
            zIndex: 999999,
            background: 'white'
        }}>
            <div style={{ background: 'red', color: 'white', padding: '5px' }}>DEBUG CAMERA (NO AI)</div>
            <Webcam
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
        </div>
    );
};

export default DebugCamera;
