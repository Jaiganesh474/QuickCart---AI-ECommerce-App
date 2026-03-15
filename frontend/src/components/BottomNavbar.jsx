import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Grid, ShoppingBag, User, Package, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';

const BottomNavbar = () => {
    const location = useLocation();
    const cartTotalQuantity = useSelector(state => state.cart.totalQuantity);
    const { user } = useSelector(state => state.user);

    // Don't show on admin or delivery pages as they have their own navigation
    if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/delivery')) {
        return null;
    }

    const navItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Grid, label: 'Categories', path: '/categories' },
        { icon: ShoppingBag, label: 'Cart', path: '/cart', badge: cartTotalQuantity },
        { icon: Package, label: 'Orders', path: '/orders' },
        { icon: User, label: 'Account', path: user ? '/account' : '/login' }
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 z-[100] safe-area-bottom">
            <div className="flex items-center justify-around h-16">
                {navItems.map((item, idx) => (
                    <NavLink
                        key={idx}
                        to={item.path}
                        className={({ isActive }) => `
                            relative flex flex-col items-center justify-center w-full h-full transition-all duration-300
                            ${isActive ? 'text-orange-500' : 'text-slate-400'}
                        `}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon 
                                    size={idx === 2 ? 26 : 22} 
                                    className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`}
                                />
                                <span className={`text-[10px] font-bold mt-1 tracking-tight ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                                    {item.label}
                                </span>
                                
                                {item.badge > 0 && (
                                    <span className="absolute top-2 right-[20%] bg-red-500 text-white text-[9px] font-black min-w-[16px] h-4 flex items-center justify-center rounded-full px-1 border-2 border-white">
                                        {item.badge}
                                    </span>
                                )}

                                {isActive && (
                                    <motion.div 
                                        layoutId="bottomNavDot"
                                        className="absolute -top-1 w-1 h-1 bg-orange-500 rounded-full"
                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </div>
    );
};

export default BottomNavbar;
