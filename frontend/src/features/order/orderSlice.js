import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchOrders = createAsyncThunk(
    'order/fetchOrders',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('quickcart_jwt');
            const response = await fetch('/api/orders', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch orders');
            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const placeOrder = createAsyncThunk(
    'order/placeOrder',
    async (orderData, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('quickcart_jwt');
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderData)
            });
            if (!response.ok) throw new Error('Failed to place order');
            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const validateCoupon = createAsyncThunk(
    'order/validateCoupon',
    async ({ code, amount }, { rejectWithValue }) => {
        try {
            const response = await fetch(`/api/coupons/validate?code=${code}&amount=${amount}`);
            const data = await response.json();
            if (!data.success) throw new Error(data.message);
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const orderSlice = createSlice({
    name: 'order',
    initialState: {
        items: [],
        status: 'idle',
        error: null,
        appliedCoupon: null,
        couponError: null
    },
    reducers: {
        clearCoupon: (state) => {
            state.appliedCoupon = null;
            state.couponError = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchOrders.fulfilled, (state, action) => {
                state.items = action.payload;
                state.status = 'succeeded';
            })
            .addCase(validateCoupon.fulfilled, (state, action) => {
                state.appliedCoupon = action.payload;
                state.couponError = null;
            })
            .addCase(validateCoupon.rejected, (state, action) => {
                state.appliedCoupon = null;
                state.couponError = action.payload;
            });
    }
});

export const { clearCoupon } = orderSlice.actions;
export default orderSlice.reducer;
