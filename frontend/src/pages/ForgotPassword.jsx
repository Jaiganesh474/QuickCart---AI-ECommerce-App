import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const inputClass = "appearance-none rounded-lg block w-full px-3 py-2 border border-slate-700 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm";

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (email) {
            setIsLoading(true);
            setErrorMsg('');
            try {
                const response = await fetch('/api/auth/forgot-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                const data = await response.json();
                if (response.ok && data.success) {
                    setStep(2);
                } else {
                    setErrorMsg(data.message || 'Request failed');
                }
            } catch (err) {
                setErrorMsg('Network error.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleVerifyOtpAndReset = async (e) => {
        e.preventDefault();
        if (otp && newPassword) {
            setIsLoading(true);
            setErrorMsg('');
            try {
                const response = await fetch('/api/auth/reset-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, otp, newPassword })
                });
                const data = await response.json();
                if (response.ok && data.success) {
                    alert('Password reset successfully!');
                    navigate('/login');
                } else {
                    setErrorMsg(data.message || 'Verification failed');
                }
            } catch (err) {
                setErrorMsg('Network error.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-slate-100">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Password assistance</h2>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.form key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleSendOtp}>
                            {errorMsg && <p className="text-red-500 text-sm mb-2">{errorMsg}</p>}
                            <p className="text-sm text-slate-600 mb-4">
                                Enter the email address associated with your QuickCart account. We will send an OTP to your inbox.
                            </p>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
                                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
                            </div>
                            <button type="submit" disabled={isLoading} className="w-full py-2 bg-yellow-400 hover:bg-yellow-500 rounded-lg font-medium text-slate-900 shadow-sm disabled:opacity-50">
                                {isLoading ? 'Sending...' : 'Continue'}
                            </button>
                        </motion.form>
                    )}

                    {step === 2 && (
                        <motion.form key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} onSubmit={handleVerifyOtpAndReset}>
                            {errorMsg && <p className="text-red-500 text-sm mb-2">{errorMsg}</p>}
                            <p className="text-sm text-slate-600 mb-4">
                                We've sent an OTP to {email}. Enter it below to reset your password.
                            </p>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Enter OTP</label>
                                <input type="text" maxLength="4" required value={otp} onChange={(e) => setOtp(e.target.value)} className={`${inputClass} text-center tracking-widest text-lg`} />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                                <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputClass} minLength="6" />
                            </div>
                            <button type="submit" disabled={isLoading} className="w-full py-2 bg-yellow-400 hover:bg-yellow-500 rounded-lg font-medium text-slate-900 shadow-sm disabled:opacity-50">
                                {isLoading ? 'Verifying...' : 'Save changes and Sign in'}
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>

                <div className="mt-6 text-center">
                    <Link to="/login" className="text-sm text-blue-600 hover:underline">Return to sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
