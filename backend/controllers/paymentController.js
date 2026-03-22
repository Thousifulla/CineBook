const { createOrder, verifySignature } = require('../services/paymentService');
const Booking = require('../models/Booking');
const logger = require('../utils/logger');

// @desc    Create Razorpay order
// @route   POST /api/payment/create-order
const createPaymentOrder = async (req, res, next) => {
    try {
        const { bookingId, amount } = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
        if (booking.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        const order = await createOrder({
            amount: booking.totalPrice,
            currency: 'INR',
            receipt: booking.bookingReference,
            notes: { bookingId: booking._id.toString(), userId: req.user._id.toString() },
        });

        booking.razorpayOrderId = order.id;
        await booking.save({ validateBeforeSave: false });

        res.status(200).json({
            success: true,
            data: {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                keyId: process.env.RAZORPAY_KEY_ID,
                bookingId,
                bookingReference: booking.bookingReference,
                prefill: {
                    name: req.user.name,
                    email: req.user.email,
                    contact: req.user.phone || '',
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Verify payment signature and confirm booking
// @route   POST /api/payment/verify
const verifyPayment = async (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

        const isValid = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
        if (!isValid) {
            logger.warn(`Invalid payment signature for booking ${bookingId}`);
            return res.status(400).json({ success: false, message: 'Payment verification failed. Invalid signature.' });
        }

        const booking = await Booking.findById(bookingId).populate({
            path: 'showId',
            populate: { path: 'movieId', select: 'title poster' },
        });

        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        // Update booking payment status
        const Show = require('../models/Show');
        const show = await Show.findById(booking.showId);

        booking.seats.forEach((seatId) => {
            const seat = show.seatLayout.find((s) => s.seatId === seatId);
            if (seat) seat.isBooked = true;
        });
        show.availableSeats = Math.max(0, show.availableSeats - booking.seats.length);
        await show.save({ validateBeforeSave: false });

        booking.paymentStatus = 'completed';
        booking.razorpayPaymentId = razorpay_payment_id;
        booking.status = 'active';
        await booking.save({ validateBeforeSave: false });

        logger.info(`Payment verified and booking confirmed: ${booking.bookingReference}`);

        res.status(200).json({
            success: true,
            message: 'Payment successful! Your booking is confirmed.',
            data: {
                bookingId: booking._id,
                bookingReference: booking.bookingReference,
                qrCode: booking.qrCode,
                seats: booking.seats,
                totalPrice: booking.totalPrice,
                movie: booking.showId?.movieId,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { createPaymentOrder, verifyPayment };
