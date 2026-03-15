import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { MapPin, Plus, Edit2, Trash2, Check, X, Navigation, Locate } from 'lucide-react';
import { addAddress, updateAddress, deleteAddress, setDefaultAddress, fetchAddresses } from '../../features/address/addressSlice';

const Addresses = () => {
    const dispatch = useDispatch();
    const { items: addresses, status } = useSelector(state => state.address);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        streetAddress: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India',
        isDefault: false
    });
    const [isDetecting, setIsDetecting] = useState(false);

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchAddresses());
        }
    }, [status, dispatch]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingId) {
            dispatch(updateAddress({ id: editingId, addressData: formData }));
            setEditingId(null);
        } else {
            dispatch(addAddress(formData));
            setIsAdding(false);
        }
        setFormData({
            fullName: '',
            phoneNumber: '',
            streetAddress: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'India',
            isDefault: false
        });
    };

    const handleEdit = (address) => {
        setFormData({
            fullName: address.fullName,
            phoneNumber: address.phoneNumber,
            streetAddress: address.streetAddress,
            city: address.city,
            state: address.state,
            zipCode: address.zipCode,
            country: address.country,
            isDefault: address.isDefault
        });
        setEditingId(address.id);
        setIsAdding(true);
    };

    const detectLocation = () => {
        setIsDetecting(true);
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            setIsDetecting(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                // Using OpenStreetMap Nominatim API (Free, no key required)
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`);
                const data = await response.json();

                if (data.address) {
                    const addr = data.address;
                    setFormData(prev => ({
                        ...prev,
                        streetAddress: `${addr.road || ''} ${addr.suburb || ''} ${addr.neighbourhood || ''}`.trim(),
                        city: addr.city || addr.town || addr.village || '',
                        state: addr.state || '',
                        zipCode: addr.postcode || '',
                    }));
                }
            } catch (error) {
                console.error("Error fetching address:", error);
                alert("Failed to get address details. Please enter manually.");
            } finally {
                setIsDetecting(false);
            }
        }, () => {
            alert("Unable to retrieve your location");
            setIsDetecting(false);
        });
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <MapPin className="text-orange-500" /> Your Addresses
                </h2>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all font-medium whitespace-nowrap"
                    >
                        <Plus size={18} /> Add New Address
                    </button>
                )}
            </div>

            {isAdding ? (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-orange-500"></div>
                    <div className="flex justify-between items-center mb-6 pl-2">
                        <h3 className="font-bold text-lg text-slate-900">{editingId ? 'Edit Address' : 'New Address'}</h3>
                        <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="p-2 hover:bg-slate-100 rounded-full">
                            <X size={20} className="text-slate-400" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 pl-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-slate-700 text-slate-900">Full Name</label>
                                <input name="fullName" value={formData.fullName} onChange={handleInputChange} required className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-orange-500 text-slate-900" placeholder="e.g. John Doe" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-slate-700 text-slate-900">Phone Number</label>
                                <input name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} required className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-orange-500 text-slate-900" placeholder="10-digit mobile number" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-bold text-slate-700">Street Address</label>
                                <button
                                    type="button"
                                    onClick={detectLocation}
                                    className="text-xs font-bold text-orange-600 flex items-center gap-1 hover:underline"
                                    disabled={isDetecting}
                                >
                                    <Locate size={14} className={isDetecting ? 'animate-spin' : ''} /> {isDetecting ? 'Detecting...' : 'Detect My Location'}
                                </button>
                            </div>
                            <input name="streetAddress" value={formData.streetAddress} onChange={handleInputChange} required className="w-full p-2.5 border border-slate-200 text-slate-900 rounded-xl outline-none focus:border-orange-500" placeholder="Flat, House no., Building, Company, Apartment" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-slate-700">City</label>
                                <input name="city" value={formData.city} onChange={handleInputChange} required className="w-full p-2.5 border text-slate-900 border-slate-200 rounded-xl outline-none focus:border-orange-500" placeholder="Town/City" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-slate-700">State</label>
                                <input name="state" value={formData.state} onChange={handleInputChange} required className="w-full p-2.5 border text-slate-900 border-slate-200 rounded-xl outline-none focus:border-orange-500" placeholder="State" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-slate-700">Zip Code</label>
                                <input name="zipCode" value={formData.zipCode} onChange={handleInputChange} required className="w-full p-2.5 border text-slate-900 border-slate-200 rounded-xl outline-none focus:border-orange-500" placeholder="6 digits [0-9]" />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 py-2">
                            <input type="checkbox" id="isDefault" name="isDefault" checked={formData.isDefault} onChange={handleInputChange} className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500" />
                            <label htmlFor="isDefault" className="text-sm font-medium text-slate-600">Make this my default address</label>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-slate-100">
                            <button type="submit" className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all active:scale-95">
                                {editingId ? 'Update Address' : 'Save Address'}
                            </button>
                            <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); }} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {addresses.length === 0 ? (
                        <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-slate-200 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MapPin className="text-slate-300 w-8 h-8" />
                            </div>
                            <p className="text-slate-500 font-medium">No addresses saved yet.</p>
                            <button onClick={() => setIsAdding(true)} className="mt-4 text-orange-600 font-bold hover:underline">Add one now</button>
                        </div>
                    ) : (
                        addresses.map(address => (
                            <div key={address.id} className={`bg-white p-5 rounded-2xl border-2 transition-all relative ${address.isDefault ? 'border-orange-400 shadow-md shadow-orange-500/5' : 'border-slate-100 hover:border-slate-200'}`}>
                                {address.isDefault && (
                                    <span className="absolute -top-3 left-6 px-3 py-1 bg-orange-500 text-white text-[10px] font-bold rounded-full shadow-sm flex items-center gap-1">
                                        <Check size={12} /> DEFAULT
                                    </span>
                                )}

                                <div className="flex justify-between gap-4">
                                    <div className="flex-1 space-y-1">
                                        <p className="font-bold text-lg text-slate-900">{address.fullName}</p>
                                        <p className="text-slate-600 text-sm">{address.streetAddress}</p>
                                        <p className="text-slate-600 text-sm">{address.city}, {address.state} {address.zipCode}</p>
                                        <p className="text-slate-600 text-sm font-medium mt-2">{address.country}</p>
                                        <p className="text-slate-600 text-sm mt-1">Phone: <span className="font-bold text-slate-900">{address.phoneNumber}</span></p>
                                    </div>
                                    <div className="flex flex-col gap-2 shrink-0">
                                        <button onClick={() => handleEdit(address)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all" title="Edit">
                                            <Edit2 size={18} />
                                        </button>
                                        <button onClick={() => dispatch(deleteAddress(address.id))} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                                            <Trash2 size={18} />
                                        </button>
                                        {!address.isDefault && (
                                            <button onClick={() => dispatch(setDefaultAddress(address.id))} className="text-xs font-bold text-orange-600 hover:underline mt-2">
                                                Set Default
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default Addresses;
