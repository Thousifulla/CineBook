import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    currentBooking: null,
    bookings: [],
    loading: false,
    error: null,
    pagination: {},
    // Checkout data flow
    selectedShow: null,
    seatDetails: [],
    totalPrice: 0,
    razorpayOrderId: null,
};

const bookingSlice = createSlice({
    name: 'booking',
    initialState,
    reducers: {
        setSelectedShow: (state, action) => { state.selectedShow = action.payload; },
        setCheckoutData: (state, action) => {
            state.seatDetails = action.payload.seatDetails;
            state.totalPrice = action.payload.totalPrice;
            state.currentBooking = action.payload.bookingId;
            state.razorpayOrderId = action.payload.razorpayOrderId;
        },
        setBookings: (state, action) => {
            state.bookings = action.payload.data;
            state.pagination = action.payload.pagination;
        },
        setCurrentBooking: (state, action) => { state.currentBooking = action.payload; },
        setLoading: (state, action) => { state.loading = action.payload; },
        setError: (state, action) => { state.error = action.payload; },
        clearBookingFlow: (state) => {
            state.selectedShow = null;
            state.seatDetails = [];
            state.totalPrice = 0;
            state.currentBooking = null;
            state.razorpayOrderId = null;
        },
    },
});

export const {
    setSelectedShow, setCheckoutData, setBookings,
    setCurrentBooking, setLoading, setError, clearBookingFlow,
} = bookingSlice.actions;
export default bookingSlice.reducer;
