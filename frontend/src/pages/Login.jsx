import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../features/user/userSlice';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const inputClass = "appearance-none rounded-lg block w-full px-3 py-2 border border-slate-700 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm";

    const handleLogin = async (e) => {
        e.preventDefault();
        if (email && password) {
            setIsLoading(true);
            setErrorMsg('');
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                if (response.ok && data.success) {
                    const base64Url = data.token.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    }).join(''));
                    const decoded = JSON.parse(jsonPayload);

                    localStorage.setItem('quickcart_jwt', data.token);
                    const userObj = { email: decoded.sub || email, role: decoded.role, name: decoded.name, token: data.token };
                    dispatch(setUser(userObj));
                    
                    const params = new URLSearchParams(window.location.search);
                    const redirect = params.get('redirect');
                    navigate(redirect || '/');
                } else {
                    setErrorMsg(data.message || 'Login failed');
                }
            } catch (err) {
                setErrorMsg('Network error. Is the backend running?');
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-xl border border-slate-100"
            >
                <div className="text-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg mx-auto flex items-center justify-center mb-4">
                        <span className="text-white font-bold text-2xl">Q</span>
                    </div>
                    <h2 className="mt-2 text-3xl font-extrabold text-slate-900">Sign in</h2>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    {errorMsg && <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">{errorMsg}</div>}

                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="email-address" className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                required
                                className={inputClass}
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className={inputClass}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded" />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900">Remember me</label>
                        </div>

                        <div className="text-sm">
                            <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-orange-500">
                                Forgot your password?
                            </Link>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-slate-900 bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 shadow-sm disabled:opacity-50"
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </div>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-slate-500">New to QuickCart?</span>
                        </div>
                    </div>

                    <div className="mt-6">
                        <Link to="/register" className="w-full flex justify-center py-2.5 px-4 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Create your QuickCart account
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
