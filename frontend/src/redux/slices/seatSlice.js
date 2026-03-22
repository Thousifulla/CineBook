import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    selectedSeats: [],         // Seats the current user picked
    lockedSeats: {},           // { seatId: { userId, ttl } } from Redis via socket
    bookedSeats: [],           // Already booked from DB
    hoveredSeats: {},          // Other users hovering - { seatId: userId }
};

const seatSlice = createSlice({
    name: 'seats',
    initialState,
    reducers: {
        toggleSeat: (state, action) => {
            const seatId = action.payload;
            if (state.selectedSeats.includes(seatId)) {
                state.selectedSeats = state.selectedSeats.filter((s) => s !== seatId);
            } else if (state.selectedSeats.length < 10) {
                state.selectedSeats.push(seatId);
            }
        },
        clearSelectedSeats: (state) => { state.selectedSeats = []; },
        setLockedSeats: (state, action) => { state.lockedSeats = action.payload; },
        addLockedSeats: (state, action) => {
            const { seats, userId, ttl } = action.payload;
            seats.forEach((seatId) => {
                state.lockedSeats[seatId] = { userId, ttl };
            });
        },
        removeLockedSeats: (state, action) => {
            action.payload.forEach((seatId) => {
                delete state.lockedSeats[seatId];
            });
        },
        setBookedSeats: (state, action) => { state.bookedSeats = action.payload; },
        setHoveredSeat: (state, action) => {
            const { seatId, userId } = action.payload;
            if (userId) state.hoveredSeats[seatId] = userId;
            else delete state.hoveredSeats[seatId];
        },
        resetSeatState: (state) => {
            state.selectedSeats = [];
            state.lockedSeats = {};
            state.bookedSeats = [];
            state.hoveredSeats = {};
        },
    },
});

export const {
    toggleSeat, clearSelectedSeats, setLockedSeats, addLockedSeats,
    removeLockedSeats, setBookedSeats, setHoveredSeat, resetSeatState,
} = seatSlice.actions;
export default seatSlice.reducer;
