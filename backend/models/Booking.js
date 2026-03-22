const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
        },
        showId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Show',
            required: [true, 'Show ID is required'],
        },
        seats: {
            type: [String],
            required: [true, 'At least one seat is required'],
            validate: {
                validator: (seats) => seats.length > 0 && seats.length <= 10,
                message: 'Seat count must be between 1 and 10',
            },
        },
        seatDetails: [
            {
                seatId: String,
                type: { type: String, enum: ['regular', 'premium', 'vip'] },
                price: Number,
                _id: false,
            },
        ],
        totalPrice: {
            type: Number,
            required: [true, 'Total price is required'],
            min: 0,
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'refunded'],
            default: 'pending',
        },
        paymentId: {
            type: String,
            default: null,
        },
        razorpayOrderId: {
            type: String,
            default: null,
        },
        razorpayPaymentId: {
            type: String,
            default: null,
        },
        bookingTime: {
            type: Date,
            default: Date.now,
        },
        qrCode: {
            type: String,
            default: '',
        },
        bookingReference: {
            type: String,
            unique: true,
        },
        status: {
            type: String,
            enum: ['active', 'cancelled', 'used'],
            default: 'active',
        },
    },
    { timestamps: true }
);

// Generate unique booking reference
bookingSchema.pre('save', function (next) {
    if (!this.bookingReference) {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        this.bookingReference = `BMS-${timestamp}-${random}`;
    }
    next();
});

bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ showId: 1 });
bookingSchema.index({ paymentStatus: 1 });


module.exports = mongoose.model('Booking', bookingSchema);
