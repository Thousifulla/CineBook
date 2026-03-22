import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import movieReducer from './slices/movieSlice';
import bookingReducer from './slices/bookingSlice';
import seatReducer from './slices/seatSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        movies: movieReducer,
        booking: bookingReducer,
        seats: seatReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ serializableCheck: false }),
});

export default store;
