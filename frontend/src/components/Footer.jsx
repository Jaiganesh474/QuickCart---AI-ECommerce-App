import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="bg-[#232F3E] text-white mt-8 font-sans hidden md:block">
            <button
                onClick={scrollToTop}
                className="w-full bg-[#37475A] hover:bg-[#485769] text-[15px] font-medium py-5 text-center transition-colors focus:outline-none"
            >
                Back to top
            </button>
            <div className="max-w-[1100px] mx-auto py-12 px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                    <h3 className="font-bold text-lg mb-4 tracking-wide">Get to Know Us</h3>
                    <ul className="space-y-3 text-[15px] text-gray-300 font-medium tracking-wide">
                        <li><span className="hover:underline cursor-pointer">About QuickCart</span></li>
                        <li><span className="hover:underline cursor-pointer">Careers</span></li>
                        <li><span className="hover:underline cursor-pointer">Press Releases</span></li>
                        <li><span className="hover:underline cursor-pointer">QuickCart Science</span></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-bold text-lg mb-4 tracking-wide">Connect with Us</h3>
                    <ul className="space-y-3 text-[15px] text-gray-300 font-medium tracking-wide">
                        <li><span className="hover:underline cursor-pointer">Facebook</span></li>
                        <li><span className="hover:underline cursor-pointer">Twitter</span></li>
                        <li><span className="hover:underline cursor-pointer">Instagram</span></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-bold text-lg mb-4 tracking-wide">Make Money with Us</h3>
                    <ul className="space-y-3 text-[15px] text-gray-300 font-medium tracking-wide">
                        <li><span className="hover:underline cursor-pointer">Sell on QuickCart</span></li>
                        <li><span className="hover:underline cursor-pointer">Sell under QuickCart Accelerator</span></li>
                        <li><span className="hover:underline cursor-pointer">Protect and Build Your Brand</span></li>
                        <li><span className="hover:underline cursor-pointer">Become an Affiliate</span></li>
                        <li><span className="hover:underline cursor-pointer">Fulfilment by QuickCart</span></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-bold text-lg mb-4 tracking-wide">Let Us Help You</h3>
                    <ul className="space-y-3 text-[15px] text-gray-300 font-medium tracking-wide">
                        <li><span className="hover:underline cursor-pointer">COVID-19 and QuickCart</span></li>
                        <li><span className="hover:underline cursor-pointer">Your Account</span></li>
                        <li><span className="hover:underline cursor-pointer">Returns Centre</span></li>
                        <li><span className="hover:underline cursor-pointer">100% Purchase Protection</span></li>
                        <li><span className="hover:underline cursor-pointer">Help</span></li>
                    </ul>
                </div>
            </div>
            <div className="bg-[#131A22] py-10 border-t border-gray-700 w-full flex flex-col items-center">
                <Link to="/" className="mb-6 flex items-center justify-center gap-1 group">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden group-hover:shadow-orange-500/50 transition duration-300">
                        <span className="text-white font-extrabold text-2xl tracking-tighter relative z-10">Q</span>
                    </div>
                    <span className="text-3xl font-extrabold tracking-tight text-white ml-2">QuickCart</span>
                </Link>
                <div className="text-xs text-gray-400 space-x-6 flex justify-center flex-wrap gap-y-2 px-4 mb-2">
                    <span className="hover:underline cursor-pointer">Conditions of Use & Sale</span>
                    <span className="hover:underline cursor-pointer">Privacy Notice</span>
                    <span className="hover:underline cursor-pointer">Interest-Based Ads</span>
                </div>
                <div className="text-xs text-gray-400 font-medium">
                    © 2026, QuickCart.com, Inc. or its affiliates
                </div>
            </div>
        </footer>
    );
};

export default Footer;
