import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, ChevronRight, Loader2, PlusCircle, CheckCircle2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAddresses, setSelectedAddress, setDefaultAddress } from '../../features/address/addressSlice';
import { useNavigate } from 'react-router-dom';

const LocationModal = ({ isOpen, onClose, user }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items: addresses, status, selectedAddress } = useSelector(state => state.address);
    const [pincode, setPincode] = useState('');
    const [isPincodeLoading, setIsPincodeLoading] = useState(false);
    const [pincodeError, setPincodeError] = useState('');

    useEffect(() => {
        if (isOpen && status === 'idle' && user) {
            dispatch(fetchAddresses());
        }
    }, [isOpen, status, dispatch, user]);

    const handleSelectAddress = (address) => {
        dispatch(setSelectedAddress(address));
        onClose();
    };

    const handleSetDefault = (e, address) => {
        e.stopPropagation();
        dispatch(setDefaultAddress(address.id));
    };

    const handleApplyPincode = async () => {
        if (!pincode || pincode.length !== 6) {
            setPincodeError('Please enter a valid 6-digit Indian pincode');
            return;
        }
        setIsPincodeLoading(true);
        setPincodeError('');
        try {
            const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
            const data = await response.json();

            if (data[0].Status === "Success") {
                const postOffice = data[0].PostOffice[0];
                const locationAddress = {
                    id: `temp-${pincode}`,
                    fullName: 'Selected Area',
                    streetAddress: postOffice.Name,
                    city: postOffice.District,
                    state: postOffice.State,
                    zipCode: pincode,
                    country: 'India',
                    isDefault: false,
                    isTemporary: true
                };
                dispatch(setSelectedAddress(locationAddress));
                onClose();
            } else {
                setPincodeError('Invalid Pincode. Please try again.');
            }
        } catch (error) {
            setPincodeError('Error verifying pincode. Please try again later.');
        } finally {
            setIsPincodeLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white  w-full max-w-[420px] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50">
                    <h2 className="text-lg font-bold text-slate-800">Choose your location</h2>
                    <button onClick={onClose} className="p-2 hover:text-white rounded-full transition-colors group">
                        <X size={20} className="text-slate-900 group-hover:rotate-90  transition-transform" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                    <p className="text-sm text-slate-900">
                        Select a delivery location to see product availability and delivery options
                    </p>

                    {/* Address List */}
                    <div className="space-y-3">
                        {user ? (
                            <>
                                {addresses.length > 0 ? (
                                    addresses.map((addr) => (
                                        <div
                                            key={addr.id}
                                            onClick={() => handleSelectAddress(addr)}
                                            className={`w-full cursor-pointer text-left p-4 rounded-xl border-2 transition-all relative ${selectedAddress?.id === addr.id
                                                    ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-500/10'
                                                    : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`mt-1 h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedAddress?.id === addr.id ? 'border-blue-500' : 'border-slate-300'}`}>
                                                    {selectedAddress?.id === addr.id && <div className="h-2 w-2 rounded-full bg-blue-500" />}
                                                </div>
                                                <div className="flex-1 min-w-0 pr-6">
                                                    <p className="font-bold text-slate-900 dark:text-slate-900 text-sm">
                                                        {addr.fullName} <span className="font-normal text-slate-900 truncate block">{addr.streetAddress}, {addr.city}, {addr.state} {addr.zipCode}</span>
                                                    </p>
                                                    {addr.isDefault && (
                                                        <p className="text-[11px] font-medium text-slate-500 mt-1">Default address</p>
                                                    )}
                                                    {!addr.isDefault && (
                                                        <button
                                                            onClick={(e) => handleSetDefault(e, addr)}
                                                            className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline mt-1"
                                                        >
                                                            Set as Default
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                        <p className="text-sm text-slate-500">No addresses saved yet.</p>
                                    </div>
                                )}

                                <button
                                    onClick={() => { onClose(); navigate('/account?tab=addresses'); }}
                                    className="w-full flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-orange-500 transition-colors px-1 mt-2"
                                >
                                    Add an address or pick-up point
                                </button>
                            </>
                        ) : (
                            <div className="p-6 bg-orange-50 dark:bg-orange-500/10 rounded-2xl border border-orange-100 dark:border-orange-500/20 text-center">
                                <p className="text-sm text-slate-700 dark:text-slate-300 mb-4 font-medium">Sign in to see your addresses</p>
                                <button
                                    onClick={() => { onClose(); navigate('/login'); }}
                                    className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/20"
                                >
                                    Sign In to see your addresses
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="relative py-2 flex items-center gap-3">
                        <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">or enter an Indian pincode</span>
                        <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
                    </div>

                    {/* Pincode Search */}
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                maxLength="6"
                                value={pincode}
                                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                                placeholder="600056"
                                className="flex-1 px-4 py-2 bg-white bg-slate-900 text-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                            />
                            <button
                                onClick={handleApplyPincode}
                                disabled={isPincodeLoading || pincode.length !== 6}
                                className="px-8 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-all disabled:opacity-50 shadow-sm min-w-[100px]"
                            >
                                {isPincodeLoading ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Apply'}
                            </button>
                        </div>
                        {pincodeError && (
                            <p className="text-xs text-red-500 font-medium pl-1 text-center">{pincodeError}</p>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default LocationModal;
