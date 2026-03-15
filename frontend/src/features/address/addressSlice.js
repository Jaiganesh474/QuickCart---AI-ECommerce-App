import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchAddresses = createAsyncThunk(
    'address/fetchAddresses',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('quickcart_jwt');
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            const response = await fetch('/api/addresses', {
                headers: headers
            });
            if (!response.ok) throw new Error('Failed to fetch addresses');
            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const addAddress = createAsyncThunk(
    'address/addAddress',
    async (addressData, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('quickcart_jwt');
            const headers = {
                'Content-Type': 'application/json'
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            const response = await fetch('/api/addresses', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(addressData)
            });
            if (!response.ok) throw new Error('Failed to add address');
            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateAddress = createAsyncThunk(
    'address/updateAddress',
    async ({ id, addressData }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('quickcart_jwt');
            const headers = {
                'Content-Type': 'application/json'
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            const response = await fetch(`/api/addresses/${id}`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify(addressData)
            });
            if (!response.ok) throw new Error('Failed to update address');
            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteAddress = createAsyncThunk(
    'address/deleteAddress',
    async (id, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('quickcart_jwt');
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            const response = await fetch(`/api/addresses/${id}`, {
                method: 'DELETE',
                headers: headers
            });
            if (!response.ok) throw new Error('Failed to delete address');
            return id;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const setDefaultAddress = createAsyncThunk(
    'address/setDefaultAddress',
    async (id, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('quickcart_jwt');
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            const response = await fetch(`/api/addresses/${id}/set-default`, {
                method: 'POST',
                headers: headers
            });
            if (!response.ok) throw new Error('Failed to set default address');
            return id;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const addressSlice = createSlice({
    name: 'address',
    initialState: {
        items: [],
        status: 'idle',
        error: null,
        selectedAddress: null
    },
    reducers: {
        setSelectedAddress: (state, action) => {
            state.selectedAddress = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAddresses.fulfilled, (state, action) => {
                state.items = action.payload;
                state.status = 'succeeded';
                const defaultAddr = action.payload.find(a => a.isDefault);
                if (defaultAddr && !state.selectedAddress) {
                    state.selectedAddress = defaultAddr;
                }
            })
            .addCase(addAddress.fulfilled, (state, action) => {
                state.items.push(action.payload);
                if (action.payload.isDefault) {
                    state.items.forEach(a => {
                        if (a.id !== action.payload.id) a.isDefault = false;
                    });
                    state.selectedAddress = action.payload;
                }
            })
            .addCase(updateAddress.fulfilled, (state, action) => {
                const index = state.items.findIndex(a => a.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                    if (action.payload.isDefault) {
                        state.items.forEach(a => {
                            if (a.id !== action.payload.id) a.isDefault = false;
                        });
                        state.selectedAddress = action.payload;
                    }
                }
            })
            .addCase(deleteAddress.fulfilled, (state, action) => {
                state.items = state.items.filter(a => a.id !== action.payload);
                if (state.selectedAddress?.id === action.payload) {
                    state.selectedAddress = state.items.find(a => a.isDefault) || state.items[0] || null;
                }
            })
            .addCase(setDefaultAddress.fulfilled, (state, action) => {
                state.items.forEach(a => {
                    a.isDefault = (a.id === action.payload);
                });
                state.selectedAddress = state.items.find(a => a.id === action.payload);
            });
    }
});

export const { setSelectedAddress } = addressSlice.actions;
export default addressSlice.reducer;
