import { createSlice } from '@reduxjs/toolkit';

const loadFromLocalStorage = () => {
    try {
        const serializedState = localStorage.getItem('quickcart_cart');
        if (serializedState === null) {
            return {
                items: [],
                totalQuantity: 0,
                totalAmount: 0,
            };
        }
        return JSON.parse(serializedState);
    } catch (err) {
        return {
            items: [],
            totalQuantity: 0,
            totalAmount: 0,
        };
    }
};

const saveToLocalStorage = (state) => {
    try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem('quickcart_cart', serializedState);
    } catch (err) {
        // Ignore write errors
    }
};

const initialState = loadFromLocalStorage();

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart(state, action) {
            const newItem = action.payload;
            const existingItem = state.items.find(item => item.id === newItem.id);
            state.totalQuantity += newItem.quantity;
            state.totalAmount += newItem.price * newItem.quantity;
            if (!existingItem) {
                state.items.push({
                    id: newItem.id,
                    name: newItem.name,
                    price: newItem.price,
                    originalPrice: newItem.originalPrice || newItem.price,
                    offerPercentage: newItem.offerPercentage || 0,
                    isDailyOffer: newItem.isDailyOffer || false,
                    imageUrl: newItem.imageUrl,
                    quantity: newItem.quantity,
                    stock: newItem.stock
                });
            } else {
                existingItem.quantity += newItem.quantity;
            }
            saveToLocalStorage(state);
        },
        removeFromCart(state, action) {
            const id = action.payload;
            const existingItem = state.items.find(item => item.id === id);
            if (existingItem) {
                state.totalQuantity -= existingItem.quantity;
                state.totalAmount -= existingItem.price * existingItem.quantity;
                state.items = state.items.filter(item => item.id !== id);
                saveToLocalStorage(state);
            }
        },
        updateQuantity(state, action) {
            const { id, quantity } = action.payload;
            const existingItem = state.items.find(item => item.id === id);
            if (existingItem && quantity > 0 && (!existingItem.stock || quantity <= existingItem.stock)) {
                const quantityDifference = quantity - existingItem.quantity;
                state.totalQuantity += quantityDifference;
                state.totalAmount += existingItem.price * quantityDifference;
                existingItem.quantity = quantity;
                saveToLocalStorage(state);
            }
        },
        clearCart(state) {
            state.items = [];
            state.totalQuantity = 0;
            state.totalAmount = 0;
            saveToLocalStorage(state);
        }
    }
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
