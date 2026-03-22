const mongoose = require('mongoose');

const seatAnalyticsSchema = new mongoose.Schema({

    showId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Show',
        required: true
    },

    seatId: {
        type: String,
        required: true
    },

    bookingCount: {
        type: Number,
        default: 0
    }

});

module.exports = mongoose.model('SeatAnalytics', seatAnalyticsSchema);