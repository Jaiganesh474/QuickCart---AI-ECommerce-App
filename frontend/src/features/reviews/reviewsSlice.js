import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    // Keyed by product ID: { [productId]: [ { id, user, rating, comment, date } ] }
    productReviews: {},
};

export const reviewsSlice = createSlice({
    name: 'reviews',
    initialState,
    reducers: {
        addReview: (state, action) => {
            const { productId, user, rating, comment } = action.payload;
            if (!state.productReviews[productId]) {
                state.productReviews[productId] = [];
            }

            const newReview = {
                id: Date.now().toString(),
                user: user || 'Anonymous User',
                rating: Number(rating),
                comment,
                date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
            };

            state.productReviews[productId].push(newReview);
        },
        // We can add mock initial reviews for a product if it doesn't have any
        initializeReviewsIfEmpty: (state, action) => {
            const { productId } = action.payload;
            if (!state.productReviews[productId] || state.productReviews[productId].length === 0) {
                state.productReviews[productId] = [
                    {
                        id: 'mock-1-' + productId,
                        user: 'Verified Amazon Customer',
                        rating: 5,
                        comment: 'Absolutely love this product. It exceeded all my expectations and works perfectly!',
                        date: 'March 1, 2026'
                    },
                    {
                        id: 'mock-2-' + productId,
                        user: 'Tech Enthusiast',
                        rating: 4,
                        comment: 'Very solid build quality. The only minor issue is the setup took a bit longer than expected.',
                        date: 'February 15, 2026'
                    }
                ];
            }
        }
    }
});

export const { addReview, initializeReviewsIfEmpty } = reviewsSlice.actions;
export default reviewsSlice.reducer;
