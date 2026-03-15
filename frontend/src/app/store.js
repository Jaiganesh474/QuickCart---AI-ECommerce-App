import { configureStore } from '@reduxjs/toolkit';
import cartReducer from '../features/cart/cartSlice';
import reviewsReducer from '../features/reviews/reviewsSlice';
import wishlistReducer from '../features/wishlist/wishlistSlice';
import addressReducer from '../features/address/addressSlice';
import orderReducer from '../features/order/orderSlice';
import userReducer from '../features/user/userSlice';
import notificationReducer from '../features/notification/notificationSlice';

export const store = configureStore({
    reducer: {
        cart: cartReducer,
        reviews: reviewsReducer,
        wishlist: wishlistReducer,
        address: addressReducer,
        order: orderReducer,
        user: userReducer,
        notifications: notificationReducer,
    },
});
