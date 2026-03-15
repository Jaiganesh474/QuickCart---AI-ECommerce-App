import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, X, Sparkles, CheckCircle2 } from 'lucide-react';

const ScratchCard = ({ onComplete, discount = 2.5 }) => {
    const canvasRef = useRef(null);
    const [isScratched, setIsScratched] = useState(false);
    const [isScratching, setIsScratching] = useState(false);
    const [scratchPercentage, setScratchPercentage] = useState(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // Fill canvas with scratch layer
        ctx.fillStyle = '#CBD5E1'; // Slate-300
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add some patterns
        ctx.strokeStyle = '#94A3B8'; // Slate-400
        ctx.lineWidth = 1;
        for (let i = 0; i < 10; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.stroke();
        }
    }, []);

    const scratch = (e) => {
        if (!isScratching || isScratched) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();

        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;

        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fill();

        // Calculate percentage
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let transparentCount = 0;
        for (let i = 0; i < pixels.length; i += 4) {
            if (pixels[i + 3] === 0) transparentCount++;
        }

        const percentage = (transparentCount / (canvas.width * canvas.height)) * 100;
        setScratchPercentage(percentage);

        if (percentage > 50 && !isScratched) {
            setIsScratched(true);
            setTimeout(() => onComplete(), 1000);
        }
    };

    return (
        <div className="relative w-full aspect-video max-w-sm mx-auto overflow-hidden rounded-2xl bg-white border-2 border-slate-100 shadow-xl">
            {/* Underlying Reward */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 p-6">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg mb-3">
                    <Sparkles className="text-orange-500 w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">CONGRATULATIONS!</h3>
                <p className="text-slate-600 text-sm mb-2">You unlocked a gift discount</p>
                <div className="text-4xl font-black text-orange-600">
                    {discount}% OFF
                </div>
                <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-widest font-bold">Applied to your cart</p>
            </div>

            {/* Scratch Layer */}
            {!isScratched && (
                <canvas
                    ref={canvasRef}
                    width={400}
                    height={200}
                    className="absolute inset-0 z-10 cursor-crosshair touch-none"
                    onMouseDown={() => setIsScratching(true)}
                    onMouseUp={() => setIsScratching(false)}
                    onMouseMove={scratch}
                    onTouchStart={() => setIsScratching(true)}
                    onTouchEnd={() => setIsScratching(false)}
                    onTouchMove={scratch}
                />
            )}

            {/* Instructions */}
            {!isScratched && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                    <div className="px-4 py-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center gap-2">
                        <Gift className="text-orange-500 w-4 h-4 animate-bounce" />
                        <span className="text-[10px] font-bold text-slate-800 uppercase tracking-tight">Scratch to reveal gift</span>
                    </div>
                </div>
            )}

            {/* Completion Overlay */}
            <AnimatePresence>
                {isScratched && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 z-30 bg-white/20 backdrop-blur-[2px] flex items-center justify-center pointer-events-none"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", damping: 10 }}
                            className="bg-white p-4 rounded-full shadow-2xl border-4 border-orange-500"
                        >
                            <CheckCircle2 className="text-orange-500 w-12 h-12" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ScratchCard;
