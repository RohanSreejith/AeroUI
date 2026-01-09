import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import type { HandLandmarkerResult } from '@mediapipe/tasks-vision';
import { useGesture } from '../context/GestureContext';

const GestureController = () => {
    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { setHandPosition, setCursorMode, isCameraVisible } = useGesture();
    const [landmarker, setLandmarker] = useState<HandLandmarker | null>(null);
    const [minimized, setMinimized] = useState(false);
    const [status, setStatus] = useState("Initializing...");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Debug State
    const [hoverTarget, setHoverTarget] = useState<string>("None");
    const [lastClickTime, setLastClickTime] = useState(0);

    useEffect(() => {
        const loadLandmarker = async () => {
            try {
                setStatus("Loading WASM...");
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
                );
                setStatus("Loading Model...");
                const output = await HandLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                        delegate: "GPU"
                    },
                    runningMode: "VIDEO",
                    numHands: 1
                });
                setLandmarker(output);
                setStatus("Ready");
            } catch (error: any) {
                console.error("Error loading MediaPipe:", error);
                setStatus("Error");
                setErrorMsg(error.message || "Unknown Error");
            }
        };
        loadLandmarker();
    }, []);

    const processVideo = () => {
        if (webcamRef.current && webcamRef.current.video && landmarker) {
            const video = webcamRef.current.video;
            if (video.readyState !== 4) {
                requestAnimationFrame(processVideo);
                return;
            }

            const startTime = performance.now();
            const detection = landmarker.detectForVideo(video, startTime);
            handleDetection(detection);
            drawLandmarks(detection);
        }
        requestAnimationFrame(processVideo);
    };

    useEffect(() => {
        if (landmarker && webcamRef.current) {
            processVideo();
        }
    }, [landmarker]);

    const drawLandmarks = (result: HandLandmarkerResult) => {
        const canvas = canvasRef.current;
        const video = webcamRef.current?.video;
        if (!canvas || !video) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Ensure canvas matches video size
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (result.landmarks) {
            for (const landmarks of result.landmarks) {
                for (const point of landmarks) {
                    ctx.beginPath();
                    ctx.arc(point.x * canvas.width, point.y * canvas.height, 4, 0, 2 * Math.PI);
                    ctx.fillStyle = "#00FF00";
                    ctx.fill();
                }
            }
        }
    };

    const handleDetection = (result: HandLandmarkerResult) => {
        if (result.landmarks.length > 0) {
            const landmark = result.landmarks[0];
            const indexTip = landmark[8];
            const thumbTip = landmark[4];

            const pinchDist = Math.hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y);
            const isPinching = pinchDist < 0.05;

            const handX = 1 - indexTip.x;
            const handY = indexTip.y;

            setHandPosition({
                x: handX,
                y: handY,
                z: indexTip.z,
                isPinching,
                isHovering: true
            });

            setCursorMode(isPinching ? 'click' : 'default');

            // DEBUG: Identify what is under the cursor
            // Note: We use the flipped X coordinate (1-x) for visual but for element detection
            // we need to be handled carefully. The cursor currently maps using the same logic.
            const screenX = handX * window.innerWidth;
            const screenY = handY * window.innerHeight;

            const el = document.elementFromPoint(screenX, screenY);
            if (el) {
                let name = el.tagName;
                if (el.id) name += "#" + el.id;
                else if (typeof el.className === 'string' && el.className) name += "." + el.className.split(" ")[0];
                else if (el.getAttribute("class")) name += "." + el.getAttribute("class")?.split(" ")[0];
                setHoverTarget(name.substring(0, 25));
            } else {
                setHoverTarget("None");
            }

            if (isPinching) {
                triggerClick(handX, handY);
            }
        }
    };

    const triggerClick = (x: number, y: number) => {
        const now = Date.now();
        if (now - lastClickTime < 500) return; // Debounce

        const screenX = x * window.innerWidth;
        const screenY = y * window.innerHeight;

        const element = document.elementFromPoint(screenX, screenY);
        if (element) {
            console.log("CLICKING:", element);

            if ((element as HTMLElement).click) {
                (element as HTMLElement).click();
            }

            const clickEvent = new MouseEvent("click", {
                "view": window,
                "bubbles": true,
                "cancelable": true
            });
            element.dispatchEvent(clickEvent);
        }
        setLastClickTime(now);
    };



    const boxWidth = minimized ? 192 : 320;
    const boxHeight = minimized ? 144 : 240;

    if (!isCameraVisible) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                width: `${boxWidth}px`,
                height: `${boxHeight}px`,
                zIndex: 99999,
                backgroundColor: 'black',
                border: '4px solid white',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
        >
            <div className="relative w-full h-full">
                {/* WEBCAM */}
                <Webcam
                    ref={webcamRef}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'fill',
                        transform: 'scaleX(-1)'
                    }}
                    screenshotFormat="image/jpeg"
                    onUserMediaError={(err) => {
                        console.error("Webcam Error:", err);
                        setErrorMsg("Camera Error");
                    }}
                    onUserMedia={() => setStatus("Camera Active")}
                />

                {/* CANVAS */}
                <canvas
                    ref={canvasRef}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'fill',
                        transform: 'scaleX(-1)',
                        pointerEvents: 'none'
                    }}
                />

                {/* ERROR MSG */}
                {errorMsg && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-red-500 font-bold p-4 text-center">
                        {errorMsg}
                    </div>
                )}

                {/* DEBUG TEXT */}
                <div style={{ position: 'absolute', top: 5, left: 5, color: '#00ff00', fontSize: '10px', fontFamily: 'monospace', backgroundColor: 'rgba(0,0,0,0.5)', padding: '2px' }}>
                    TARGET: {hoverTarget}
                </div>

                {/* CONTROLS */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', padding: '8px', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'white', fontSize: '10px', fontFamily: 'monospace' }}>{status}</span>
                    <button
                        onClick={() => setMinimized(!minimized)}
                        style={{ background: '#2563eb', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        {minimized ? 'EXPAND' : 'MINI'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GestureController;
