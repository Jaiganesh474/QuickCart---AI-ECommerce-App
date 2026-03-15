import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchNotifications = createAsyncThunk(
    'notifications/fetchNotifications',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('quickcart_jwt');
            const res = await fetch('/api/notifications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) return data;
            return rejectWithValue(data);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const markAsRead = createAsyncThunk(
    'notifications/markAsRead',
    async (id, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('quickcart_jwt');
            const res = await fetch(`/api/notifications/${id}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) return id;
            return rejectWithValue("Failed to mark as read");
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

const notificationSlice = createSlice({
    name: 'notifications',
    initialState: {
        items: [],
        status: 'idle',
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.items = action.payload;
                state.status = 'succeeded';
            })
            .addCase(markAsRead.fulfilled, (state, action) => {
                const item = state.items.find(n => n.id === action.payload);
                if (item) item.read = true;
            });
    }
});

export default notificationSlice.reducer;
