import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../features/user/userSlice';

const BecomeSeller = () => {
    const { user } = useSelector(state => state.user);
    const dispatch = useDispatch();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState(user?.email || '');
    const [company, setCompany] = useState('');
    const [otp, setOtp] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const inputClass = "appearance-none rounded-lg block w-full px-4 py-3 border border-slate-700 bg-white text-slate-900 placeholder-gray-500 focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-base font-medium";

    const handleSendVerification = async (e) => {
        e.preventDefault();
        if (email && company) {
            setIsLoading(true);
            setErrorMsg('');
            try {
                const response = await fetch('/api/auth/become-seller', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                const data = await response.json();
                if (response.ok && data.success) {
                    setStep(2);
                } else {
                    setErrorMsg(data.message || 'Could not verify. Make sure you are registered.');
                }
            } catch (err) {
                setErrorMsg('Network error.');
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
                const response = await fetch('/api/auth/verify-seller', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, otp })
                });
                const data = await response.json();
                if (response.ok && data.success) {
                    setStep(3);
                    localStorage.setItem('quickcart_jwt', data.token);
                    const updatedUser = user ? { ...user, role: 'ADMIN', token: data.token } : { email, role: 'ADMIN', token: data.token };
                    dispatch(setUser(updatedUser));
                    setTimeout(() => navigate('/admin'), 2000);
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
        <div className="min-h-[80vh] bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-xl w-full bg-white p-10 rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center">

                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mb-6 shadow-md">
                    <Shield className="w-8 h-8 text-white" />
                </div>

                <h1 className="text-3xl font-bold text-slate-900 mb-2">Become a QuickCart Seller</h1>
                <p className="text-slate-600 text-center mb-8">
                    Join thousands of sellers. Verifying your business email gives you access to the Admin Dashboard to manage your products.
                </p>

                <div className="w-full">
                    {errorMsg && <p className="text-red-500 text-sm mb-4 text-center">{errorMsg}</p>}
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.form key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleSendVerification} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Business Email Address</label>
                                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className={inputClass} placeholder="you@company.com" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                                    <input type="text" required value={company} onChange={e => setCompany(e.target.value)} className={inputClass} placeholder="Acme Corp" />
                                </div>
                                <button type="submit" disabled={isLoading} className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors shadow-md text-lg disabled:opacity-50">
                                    {isLoading ? 'Sending Code...' : 'Send Verification Code'}
                                </button>
                            </motion.form>
                        )}

                        {step === 2 && (
                            <motion.form key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleVerifyOtp} className="text-center space-y-6">
                                <p className="text-slate-700">We've sent a 4-digit code to <span className="font-bold">{email}</span>.</p>
                                <input type="text" maxLength="4" required value={otp} onChange={e => setOtp(e.target.value)} className={`${inputClass} w-32 mx-auto tracking-[1em] text-center font-mono text-2xl`} placeholder="••••" />
                                <button type="submit" disabled={isLoading} className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors shadow-md text-lg disabled:opacity-50">
                                    {isLoading ? 'Verifying...' : 'Verify & Upgrade to Seller'}
                                </button>
                            </motion.form>
                        )}

                        {step === 3 && (
                            <motion.div key="s3" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">Verification Successful!</h2>
                                <p className="text-slate-600 text-center">Your account is now upgraded to Seller / Admin. Redirecting to dashboard...</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default BecomeSeller;
