import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import type { HandLandmarkerResult } from '@mediapipe/tasks-vision';
import { useGesture } from '../context/GestureContext';

const GestureController = () => {
    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { setHandPosition, setCursorMode } = useGesture();
    const [landmarker, setLandmarker] = useState<HandLandmarker | null>(null);
    const [minimized, setMinimized] = useState(false);
    const [status, setStatus] = useState("Initializing...");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

                    // Draw connections could be added here for better visuals
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
            const isPinching = pinchDist < 0.08;

            setHandPosition({
                x: 1 - indexTip.x,
                y: indexTip.y,
                z: indexTip.z,
                isPinching,
                isHovering: true
            });

            setCursorMode(isPinching ? 'click' : 'default');

            if (isPinching) {
                // Click logic handled in wrapper or context ideally, 
                // but for now relying on cursor graphic to show state
            }
        }
    };

    return (
        <div className={`fixed top-4 right-4 bg-black border-2 border-automotive-500 rounded-lg overflow-hidden transition-all duration-300 z-[9999] shadow-2xl ${minimized ? 'w-40 h-32' : 'w-80 h-60'}`}>

            <div className="relative w-full h-full">
                {errorMsg ? (
                    <div className="absolute inset-0 flex items-center justify-center p-4 text-red-500 text-xs text-center bg-black">
                        {errorMsg}
                    </div>
                ) : (
                    <>
                        <Webcam
                            ref={webcamRef}
                            className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
                            screenshotFormat="image/jpeg"
                            onUserMediaError={(err) => setErrorMsg("Camera Error: " + err)}
                        />
                        <canvas
                            ref={canvasRef}
                            className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
                        />
                    </>
                )}
            </div>

            {/* Status Bar */}
            <div className="absolute top-0 left-0 bg-black/70 text-[10px] text-white p-1 w-full font-mono flex justify-between">
                <span>{status}</span>
                <button onClick={() => setMinimized(!minimized)} className="text-automotive-400 hover:text-white uppercase font-bold px-1">
                    {minimized ? '[+]' : '[-]'}
                </button>
            </div>
        </div>
    );
};

export default GestureController;
