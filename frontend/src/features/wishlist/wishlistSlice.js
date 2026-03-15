import { createSlice } from '@reduxjs/toolkit';

const loadFromLocalStorage = () => {
    try {
        const serializedState = localStorage.getItem('quickcart_wishlist');
        if (serializedState === null) {
            return { items: [] };
        }
        return JSON.parse(serializedState);
    } catch (err) {
        return { items: [] };
    }
};

const saveToLocalStorage = (state) => {
    try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem('quickcart_wishlist', serializedState);
    } catch (err) {
        // Ignore write errors
    }
};

const initialState = loadFromLocalStorage();

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        addToWishlist: (state, action) => {
            const existingItem = state.items.find(item => item.id === action.payload.id);
            if (!existingItem) {
                state.items.push(action.payload);
                saveToLocalStorage(state);
            }
        },
        removeFromWishlist: (state, action) => {
            state.items = state.items.filter(item => item.id !== action.payload.id);
            saveToLocalStorage(state);
        },
    },
});

export const { addToWishlist, removeFromWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
