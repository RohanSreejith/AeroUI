import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Webcam from 'react-webcam';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import type { HandLandmarkerResult } from '@mediapipe/tasks-vision';
import { useGesture } from '../context/GestureContext';

const GestureController = () => {
    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { setHandPosition, setCursorMode, isCameraVisible, setGestureEvent, gestureEvent } = useGesture();
    const [landmarker, setLandmarker] = useState<HandLandmarker | null>(null);
    const [minimized, setMinimized] = useState(false);
    const [status, setStatus] = useState("Initializing...");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Gesture State
    const [hoverTarget, setHoverTarget] = useState<string>("None");
    const [lastClickTime, setLastClickTime] = useState(0);

    // Logic State
    const gestureHistory = useRef<{ x: number, y: number }[]>([]);
    const lastGestureTime = useRef(0);

    // Optimization Refs
    const lastHandPos = useRef({ x: 0, y: 0 });
    const lastPinchState = useRef(false);
    const lastCursorMode = useRef('default');

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
                }
            }
        }
    };

    // =========================================================================
    //                            GESTURE LOGIC REWRITE
    // =========================================================================

    const handleDetection = (result: HandLandmarkerResult) => {
        if (result.landmarks.length > 0) {
            const landmark = result.landmarks[0];
            const wrist = landmark[0];
            const indexTip = landmark[8];
            const thumbTip = landmark[4];

            // 1. UPDATE CURSOR (Index Finger Tip)
            const handX = 1 - indexTip.x;
            const handY = indexTip.y;

            // Pinch for Click (Thumb close to Index)
            const pinchDist = Math.hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y);
            const isPinching = pinchDist < 0.05;

            setHandPosition({
                x: handX,
                y: handY,
                z: indexTip.z,
                isPinching,
                isHovering: true
            });
            setCursorMode(isPinching ? 'click' : 'default');

            if (isPinching) triggerClick(handX, handY);

            // -----------------------------------------------------------------
            // 2. DETECT MOTION (Velocity Check)
            // -----------------------------------------------------------------
            const now = Date.now();
            gestureHistory.current.push({ x: handX, y: handY });
            if (gestureHistory.current.length > 60) gestureHistory.current.shift(); // 2 sec history

            // Calculate Velocity (distance moved in last 5 frames)
            let isMoving = false;
            if (gestureHistory.current.length > 5) {
                const recent = gestureHistory.current.slice(-5);
                const dist = Math.hypot(
                    recent[recent.length - 1].x - recent[0].x,
                    recent[recent.length - 1].y - recent[0].y
                );
                // Threshold: If moved more than 2% of screen in ~150ms, it's moving
                if (dist > 0.02) isMoving = true;
            }

            // -----------------------------------------------------------------
            // 3. BRANCH LOGIC: DYNAMIC (Rotate) vs STATIC (Mute)
            // -----------------------------------------------------------------

            if (isMoving) {
                // === ROTATION LOGIC (Only when moving) ===
                detectRotation(now);
            } else {
                // === POSE LOGIC (Only when stationary) ===
                // This prevents Mute triggering while rotating
                if (now - lastGestureTime.current > 500) {
                    detectStaticPose(landmark, now);
                }
            }

            // Debug Hover
            updateHoverTarget(handX, handY);
        }
    };

    // --- A. ROTATION DETECTION ---
    const detectRotation = (now: number) => {
        // Requires significant history (e.g., 20 frames)
        if (gestureHistory.current.length < 20) return;
        if (now - lastGestureTime.current < 300) return; // Cooldown

        const points = gestureHistory.current;

        // 1. Centroid
        let sumX = 0, sumY = 0;
        points.forEach(p => { sumX += p.x; sumY += p.y; });
        const cx = sumX / points.length;
        const cy = sumY / points.length;

        // 2. Linearity (Arc Length vs Net Displacement)
        // Circle has high Arc, low Displacement. Line has Ratio ~ 1.0.
        let arcLen = 0;
        for (let i = 1; i < points.length; i++) {
            arcLen += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
        }
        const netDisp = Math.hypot(points[points.length - 1].x - points[0].x, points[points.length - 1].y - points[0].y);
        const linearity = arcLen > 0 ? netDisp / arcLen : 1;

        // 3. Radius Consistency
        let rSum = 0;
        points.forEach(p => rSum += Math.hypot(p.x - cx, p.y - cy));
        const avgR = rSum / points.length;

        let varSum = 0;
        points.forEach(p => varSum += Math.pow(Math.hypot(p.x - cx, p.y - cy) - avgR, 2));
        const stdDev = Math.sqrt(varSum / points.length);

        // 4. Accumulated Angle (Winding Number)
        let totalAngle = 0;
        for (let i = 1; i < points.length; i++) {
            const a1 = Math.atan2(points[i - 1].y - cy, points[i - 1].x - cx);
            const a2 = Math.atan2(points[i].y - cy, points[i].x - cx);
            let delta = a2 - a1;
            if (delta > Math.PI) delta -= 2 * Math.PI;
            if (delta < -Math.PI) delta += 2 * Math.PI;
            totalAngle += delta;
        }

        // STRICT RULES:
        // - Linearity < 0.5 (Must be curved)
        // - Avg Radius > 0.04 (Must be distinct circle, not point rotation)
        // - StdDev < 0.05 (Must be roughly circular)
        // - Angle > 4.0 rad (Must be > 230 degrees rotation)

        if (linearity < 0.5 && avgR > 0.04 && stdDev < 0.05) {
            if (totalAngle > 4.0) {
                setGestureEvent("ROTATE_CW");
                lastGestureTime.current = now;
                gestureHistory.current = []; // Reset
            } else if (totalAngle < -4.0) {
                setGestureEvent("ROTATE_CCW");
                lastGestureTime.current = now;
                gestureHistory.current = []; // Reset
            }
        }
    };

    // --- B. STATIC POSE DETECTION (Fist/Open) ---
    const detectStaticPose = (landmark: any[], now: number) => {
        const wrist = landmark[0];

        // Fingers: Index(8), Middle(12), Ring(16), Pinky(20)
        // Joints: PIP(6, 10, 14, 18)
        const tipIds = [8, 12, 16, 20];
        const pipIds = [6, 10, 14, 18];
        let foldedCount = 0;

        for (let i = 0; i < 4; i++) {
            const tip = landmark[tipIds[i]];
            const pip = landmark[pipIds[i]];
            const dTip = Math.hypot(tip.x - wrist.x, tip.y - wrist.y);
            const dPip = Math.hypot(pip.x - wrist.x, pip.y - wrist.y);
            if (dTip < dPip) foldedCount++;
        }

        // Thumb: Tip(4) vs IP(3)
        const tTip = landmark[4];
        const tIp = landmark[3];
        const dtTip = Math.hypot(tTip.x - wrist.x, tTip.y - wrist.y);
        const dtIp = Math.hypot(tIp.x - wrist.x, tIp.y - wrist.y);
        if (dtTip < dtIp) foldedCount++;

        // LOGIC
        if (foldedCount === 5) {
            // ALL 5 FINGERS FOLDED -> MUTE
            if (gestureEvent !== "FIST_CLOSED") {
                setGestureEvent("FIST_CLOSED");
                lastGestureTime.current = now;
            }
        } else if (foldedCount <= 1) {
            // 0 or 1 FINGER FOLDED -> OPEN -> UNMUTE
            // Ensure Index is extended
            const iTip = landmark[8];
            const iPip = landmark[6];
            const diTip = Math.hypot(iTip.x - wrist.x, iTip.y - wrist.y);
            const diPip = Math.hypot(iPip.x - wrist.x, iPip.y - wrist.y);

            if (diTip > diPip) { // Index extended
                if (gestureEvent !== "FIST_OPEN") {
                    setGestureEvent("FIST_OPEN");
                    lastGestureTime.current = now;
                }
            }
        }
    };

    // --- UTILS ---
    const updateHoverTarget = (x: number, y: number) => {
        const sx = x * window.innerWidth;
        const sy = y * window.innerHeight;
        const el = document.elementFromPoint(sx, sy);
        if (el) {
            let name = el.tagName;
            if (el.id) name += "#" + el.id;
            setHoverTarget(name.substring(0, 20));
        } else {
            setHoverTarget("None");
        }
    };

    const triggerClick = (x: number, y: number) => {
        const now = Date.now();
        if (now - lastClickTime < 500) return;
        const sx = x * window.innerWidth;
        const sy = y * window.innerHeight;
        const el = document.elementFromPoint(sx, sy);
        if (el) {
            (el as HTMLElement).click?.();
        }
        setLastClickTime(now);
    };

    // --- RENDER ---
    const boxWidth = minimized ? 192 : 320;
    const boxHeight = minimized ? 144 : 240;

    if (!isCameraVisible) return null;

    return (
        <div style={{
            position: 'fixed', top: '20px', right: '20px',
            width: `${boxWidth}px`, height: `${boxHeight}px`,
            zIndex: 99999, backgroundColor: 'black',
            border: '4px solid white', borderRadius: '12px',
            overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
        }}>
            <div className="relative w-full h-full">
                <Webcam ref={webcamRef}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', transform: 'scaleX(-1)', objectFit: 'fill' }}
                    onUserMedia={() => setStatus("Camera Active")}
                />
                <canvas ref={canvasRef}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', transform: 'scaleX(-1)', pointerEvents: 'none' }}
                />
                {errorMsg && <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-red-500 font-bold p-4">{errorMsg}</div>}

                <div style={{ position: 'absolute', top: 5, left: 5, color: '#00ff00', fontSize: '10px', fontFamily: 'monospace', background: 'rgba(0,0,0,0.5)', padding: '2px' }}>
                    TARGET: {hoverTarget}<br />GESTURE: {gestureEvent || "None"}
                </div>

                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', padding: '8px', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'white', fontSize: '10px', fontFamily: 'monospace' }}>{status}</span>
                    <button onClick={() => setMinimized(!minimized)} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>
                        {minimized ? 'EXPAND' : 'MINI'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GestureController;
