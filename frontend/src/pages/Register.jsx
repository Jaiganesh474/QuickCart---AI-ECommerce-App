import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../features/user/userSlice';
import { CheckCircle } from 'lucide-react';

const Register = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [name, setName] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const inputClass = "appearance-none rounded-lg block w-full px-3 py-2 border border-slate-700 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm";

    const handleStep1 = async (e) => {
        e.preventDefault();
        if (email && password && name) {
            setIsLoading(true);
            setErrorMsg('');
            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password, mobileNumber })
                });

                const data = await response.json();
                if (response.ok && data.success) {
                    setStep(2);
                } else {
                    setErrorMsg(data.message || 'Registration failed');
                }
            } catch (err) {
                setErrorMsg('Network error. Is the backend running?');
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
                const response = await fetch('/api/auth/verify-register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, otp })
                });

                const data = await response.json();
                if (response.ok && data.success) {
                    setStep(3);
                    localStorage.setItem('quickcart_jwt', data.token);

                    setTimeout(() => {
                        dispatch(setUser({ email, role: 'USER', token: data.token, name, mobileNumber }));
                        navigate('/');
                    }, 2000);
                } else {
                    setErrorMsg(data.message || 'Invalid OTP');
                }
            } catch (err) {
                setErrorMsg('Network error checking OTP.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <Link to="/">
                        <img 
                            src="/logocroppedquick.png" 
                            alt="QuickCart Logo" 
                            className="h-12 w-auto mx-auto mb-4 object-contain"
                        />
                    </Link>
                    <h2 className="mt-4 text-3xl font-extrabold text-slate-900">Create Account</h2>
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.form
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="bg-white p-8 rounded-xl shadow-lg border border-slate-100"
                            onSubmit={handleStep1}
                        >
                            <div className="text-center mb-8">
                                <Link to="/">
                                    <img
                                        src="/logocroppedquick.png"
                                        alt="QuickCart Logo"
                                        className="h-12 w-auto mx-auto mb-4 object-contain"
                                    />
                                </Link>
                                <h2 className="mt-4 text-3xl font-extrabold text-slate-900">Create Account</h2>
                            </div>
                            <div className="space-y-4">
                                {errorMsg && <p className="text-red-500 text-sm mb-2">{errorMsg}</p>}

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Your Name</label>
                                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Full Name" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="Enter your email" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                                    <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} minLength="6" className={inputClass} placeholder="At least 6 characters" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold border-r border-slate-200 pr-2 text-sm">+91</span>
                                        <input 
                                            type="tel" 
                                            required 
                                            value={mobileNumber} 
                                            onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))} 
                                            className={`${inputClass} pl-12`} 
                                            placeholder="10-digit number" 
                                        />
                                    </div>
                                </div>
                                <button type="submit" disabled={isLoading} className="w-full py-2.5 px-4 rounded-lg text-slate-900 bg-yellow-400 hover:bg-yellow-500 font-medium shadow-sm transition-colors disabled:opacity-50">
                                    {isLoading ? 'Sending OTP...' : 'Verify Details'}
                                </button>
                            </div>
                            <p className="mt-4 text-sm text-slate-600">
                                Already have an account? <Link to="/login" className="text-blue-600 hover:text-orange-500 font-medium">Sign in</Link>
                            </p>
                        </motion.form>
                    )}

                    {step === 2 && (
                        <motion.form
                            key="step2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="bg-white p-8 rounded-xl shadow-lg border border-slate-100 text-center"
                            onSubmit={handleVerifyOtp}
                        >
                             <h3 className="text-xl font-bold text-slate-900 mb-2">Verification Required</h3>
                             {errorMsg && <p className="text-red-500 text-sm mb-2">{errorMsg}</p>}
                             <p className="text-sm text-slate-600 mb-6">
                                 We've sent an OTP to <span className="font-semibold text-slate-900">{email}</span> and your mobile. Please enter it below.
                             </p>
                            <div className="mb-4">
                                <input type="text" maxLength="4" required value={otp} onChange={(e) => setOtp(e.target.value)} className={`${inputClass} text-center tracking-widest text-2xl py-3`} placeholder="••••" />
                            </div>
                            <button type="submit" disabled={isLoading} className="w-full py-2.5 px-4 rounded-lg text-slate-900 bg-yellow-400 hover:bg-yellow-500 font-medium shadow-sm transition-colors disabled:opacity-50">
                                {isLoading ? 'Verifying...' : 'Create your QuickCart account'}
                            </button>
                            <button type="button" onClick={() => setStep(1)} className="mt-4 text-sm text-blue-600 hover:underline">
                                Change email address
                            </button>
                        </motion.form>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white p-8 rounded-xl shadow-lg border border-slate-100 text-center flex flex-col items-center"
                        >
                            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Account Created!</h3>
                            <p className="text-slate-600">A welcome email has been sent to {email}. Redirecting you to the home page...</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Register;
