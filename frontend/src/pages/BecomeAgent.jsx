import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, CheckCircle, ShieldCheck, MapPin, Zap, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../features/user/userSlice';

const BecomeAgent = () => {
    const { user } = useSelector(state => state.user);
    const dispatch = useDispatch();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState(user?.email || '');
    const [otp, setOtp] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const inputClass = "appearance-none rounded-2xl block w-full px-5 py-4 border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-base font-bold transition-all shadow-sm";

    const handleSendVerification = async (e) => {
        e.preventDefault();
        if (email) {
            setIsLoading(true);
            setErrorMsg('');
            try {
                const response = await fetch('/api/auth/become-agent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                const data = await response.json();
                if (response.ok && data.success) {
                    setStep(2);
                } else {
                    setErrorMsg(data.message || 'Verification failed. Are you registered?');
                }
            } catch (err) {
                setErrorMsg('Network error occurred.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (otp) {
            setIsLoading(true);
            setErrorMsg('');
            try {
                const response = await fetch('/api/auth/verify-agent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, otp })
                });
                const data = await response.json();
                if (response.ok && data.success) {
                    setStep(3);
                    localStorage.setItem('quickcart_jwt', data.token);
                    const updatedUser = user 
                        ? { ...user, role: 'DELIVERY_AGENT', token: data.token } 
                        : { email, role: 'DELIVERY_AGENT', token: data.token };
                    dispatch(setUser(updatedUser));
                    setTimeout(() => navigate('/delivery'), 3000);
                } else {
                    setErrorMsg(data.message || 'Invalid OTP');
                }
            } catch (err) {
                setErrorMsg('Network error.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-white py-20 px-4">
            <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                
                {/* Left Side: Marketing/Info */}
                <div className="hidden lg:block space-y-8">
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-3 bg-green-50 rounded-2xl inline-block"
                    >
                        <Truck className="w-12 h-12 text-green-600" />
                    </motion.div>
                    
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h1 className="text-5xl font-black text-slate-900 leading-tight mb-4">
                            Deliver Smiles, <br />
                            <span className="text-green-600">Earn with QuickCart.</span>
                        </h1>
                        <p className="text-xl text-slate-500 font-medium leading-relaxed">
                            Join our elite network of Quicker Agents. Enjoy flexible schedules, competitive earnings, and the best delivery tech in the business.
                        </p>
                    </motion.div>

                    <div className="space-y-6 pt-4">
                        {[
                            { icon: <Zap className="text-green-500" />, title: "Hyper-Fast Payouts", desc: "Get paid instantly for every successful delivery." },
                            { icon: <Clock className="text-blue-500" />, title: "Flexible Timing", desc: "Log in whenever you're ready to hit the road." },
                            { icon: <MapPin className="text-orange-500" />, title: "AI-Routed Deliveries", desc: "Our Gemini AI finds the fastest routes for you." }
                        ].map((item, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + (i * 0.1) }}
                                className="flex gap-4 items-start"
                            >
                                <div className="p-2 bg-white border border-slate-100 shadow-sm rounded-xl">
                                    {item.icon}
                                </div>
                                <div className="text-sm">
                                    <p className="font-bold text-slate-900">{item.title}</p>
                                    <p className="text-slate-500 font-medium">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Right Side: Form */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-green-100 border border-slate-100"
                >
                    <div className="flex flex-col items-center text-center">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div 
                                    key="step1"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="w-full"
                                >
                                    <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg shadow-green-200">
                                        <ShieldCheck className="text-white" size={32} />
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900 mb-2">Agent Verification</h2>
                                    <p className="text-slate-500 mb-8 font-medium">Enter your registered email to begin the onboarding process.</p>
                                    
                                    <form onSubmit={handleSendVerification} className="space-y-6">
                                        {errorMsg && <p className="text-red-500 text-sm font-bold bg-red-50 py-2 rounded-xl border border-red-100">{errorMsg}</p>}
                                        <div className="text-left">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Registration Email</label>
                                            <input 
                                                type="email" 
                                                required 
                                                value={email} 
                                                onChange={e => setEmail(e.target.value)} 
                                                className={inputClass}
                                                placeholder="quicker@agent.com"
                                            />
                                        </div>
                                        <button 
                                            type="submit" 
                                            disabled={isLoading} 
                                            className="w-full py-5 bg-green-600 text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-green-200 hover:bg-green-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                        >
                                            {isLoading ? 'Processing...' : (
                                                <>
                                                    Start My Journey <Zap size={20} />
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div 
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="w-full"
                                >
                                    <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                                        <Clock size={32} />
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900 mb-2">Check Your Inbox</h2>
                                    <p className="text-slate-500 mb-8 font-medium">We've sent a 4-digit verification code to <span className="text-green-600 font-bold">{email}</span>.</p>
                                    
                                    <form onSubmit={handleVerifyOtp} className="space-y-10">
                                        {errorMsg && <p className="text-red-500 text-sm font-bold bg-red-50 py-2 rounded-xl">{errorMsg}</p>}
                                        <div className="flex justify-center">
                                            <input 
                                                type="text" 
                                                maxLength="4" 
                                                required 
                                                value={otp} 
                                                onChange={e => setOtp(e.target.value)} 
                                                className={`${inputClass} !w-48 text-center text-3xl tracking-[0.5em] font-black`}
                                                placeholder="0000"
                                            />
                                        </div>
                                        <button 
                                            type="submit" 
                                            disabled={isLoading} 
                                            className="w-full py-5 bg-green-600 text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-green-200 hover:bg-green-700 transition"
                                        >
                                            {isLoading ? 'Verifying...' : 'Complete Onboarding'}
                                        </button>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Didn't receive it? <span className="text-green-600 cursor-pointer hover:underline">Resend Code</span></p>
                                    </form>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div 
                                    key="step3"
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-center"
                                >
                                    <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-8 mx-auto">
                                        <CheckCircle size={56} />
                                    </div>
                                    <h2 className="text-4xl font-black text-slate-900 mb-4">Welcome, Agent!</h2>
                                    <p className="text-slate-500 text-lg font-medium mb-10 leading-relaxed">
                                        Your account has been upgraded to <br />
                                        <span className="text-green-600 font-black">QuickCart Delivery Expert</span>.
                                    </p>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Redirecting to Delivery Hub</p>
                                        <div className="mt-2 h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: '100%' }}
                                                transition={{ duration: 3 }}
                                                className="h-full bg-green-600"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default BecomeAgent;
