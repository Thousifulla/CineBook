const Booking = require('../models/Booking');
const Show = require('../models/Show');
const SeatAnalytics = require('../models/SeatAnalytics');
const { lockSeats, releaseSeats, checkSeatsLocked } = require('../services/seatLockService');
const { generateBookingQR } = require('../utils/generateQR');
const logger = require('../utils/logger');


// @desc    Lock seats and initiate booking
// @route   POST /api/bookings/lock
const lockAndInitiate = async (req, res, next) => {
    try {

        const { showId, seats } = req.body;

        const show = await Show.findById(showId).populate('movieId', 'title');

        if (!show) {
            return res.status(404).json({
                success: false,
                message: 'Show not found'
            });
        }

        // Check seats exist and not booked in DB
        const seatIds = seats;

        const showSeats = show.seatLayout.filter((s) =>
            seatIds.includes(s.seatId)
        );

        const alreadyBooked = showSeats.filter((s) => s.isBooked);

        if (alreadyBooked.length > 0) {
            return res.status(409).json({
                success: false,
                message: `Seats already booked: ${alreadyBooked.map((s) => s.seatId).join(', ')}`,
            });
        }

        // Try to lock in Redis
        const { lockedSeats, failedSeats } = await lockSeats(
            showId,
            seats,
            req.user._id
        );

        if (failedSeats.length > 0) {

            if (lockedSeats.length > 0) {
                await releaseSeats(showId, lockedSeats, req.user._id);
            }

            return res.status(409).json({
                success: false,
                message: `Seats are temporarily locked by another user: ${failedSeats.join(', ')}`,
                failedSeats,
            });

        }

        // Calculate seat price
        const seatDetails = showSeats.map((seat) => ({
            seatId: seat.seatId,
            type: seat.type,
            price: show.seatPricing[seat.type],
        }));

        const totalPrice = seatDetails.reduce(
            (sum, s) => sum + s.price,
            0
        );

        res.status(200).json({
            success: true,
            message: 'Seats locked successfully. You have 5 minutes to complete payment.',
            data: {
                showId,
                seats: lockedSeats,
                seatDetails,
                totalPrice,
                lockTTL: 300
            }
        });

    } catch (error) {
        next(error);
    }
};



// @desc    Create booking after payment
// @route   POST /api/bookings
const createBooking = async (req, res, next) => {

    try {

        const {
            showId,
            seats,
            seatDetails,
            totalPrice,
            razorpayOrderId
        } = req.body;

        const show = await Show.findById(showId);

        if (!show) {
            return res.status(404).json({
                success: false,
                message: 'Show not found'
            });
        }

        const booking = await Booking.create({
            userId: req.user._id,
            showId,
            seats,
            seatDetails,
            totalPrice,
            razorpayOrderId,
            paymentStatus: 'pending'
        });

        // Generate QR code
        const qrCode = await generateBookingQR(booking);

        booking.qrCode = qrCode;

        await booking.save({ validateBeforeSave: false });

        res.status(201).json({
            success: true,
            message: 'Booking created. Proceed to payment.',
            data: {
                bookingId: booking._id,
                bookingReference: booking.bookingReference,
                totalPrice
            }
        });

    } catch (error) {
        next(error);
    }

};



// @desc    Confirm booking after successful payment
// @route   PUT /api/bookings/:id/confirm
const confirmBooking = async (req, res, next) => {

    try {

        const { razorpayPaymentId, razorpayOrderId } = req.body;

        const booking = await Booking.findById(req.params.id).populate({
            path: 'showId',
            populate: {
                path: 'movieId',
                select: 'title poster duration'
            }
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (booking.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        // Mark seats as booked in DB
        const show = await Show.findById(booking.showId);

        booking.seats.forEach((seatId) => {

            const seat = show.seatLayout.find(
                (s) => s.seatId === seatId
            );

            if (seat) {
                seat.isBooked = true;
            }

        });

        show.availableSeats = Math.max(
            0,
            show.availableSeats - booking.seats.length
        );

        await show.save({ validateBeforeSave: false });


        // 🔥 Seat Heatmap Analytics
        for (const seatId of booking.seats) {

            await SeatAnalytics.updateOne(
                {
                    showId: booking.showId,
                    seatId
                },
                {
                    $inc: { bookingCount: 1 }
                },
                {
                    upsert: true
                }
            );

        }


        // Update booking
        booking.paymentStatus = 'completed';

        booking.razorpayPaymentId = razorpayPaymentId;

        booking.status = 'active';

        await booking.save({ validateBeforeSave: false });

        logger.info(`Booking confirmed: ${booking.bookingReference}`);

        res.status(200).json({
            success: true,
            message: 'Booking confirmed!',
            data: booking
        });

    } catch (error) {
        next(error);
    }

};



// @desc    Release booking on payment failure
// @route   PUT /api/bookings/:id/release
const releaseBooking = async (req, res, next) => {

    try {

        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        booking.paymentStatus = 'failed';
        booking.status = 'cancelled';

        await booking.save({ validateBeforeSave: false });

        await releaseSeats(
            booking.showId.toString(),
            booking.seats,
            req.user._id
        );

        res.status(200).json({
            success: true,
            message: 'Booking cancelled and seats released.'
        });

    } catch (error) {
        next(error);
    }

};



// @desc    Get user's booking history
// @route   GET /api/bookings/my
const getMyBookings = async (req, res, next) => {

    try {

        const { page = 1, limit = 10 } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [bookings, total] = await Promise.all([

            Booking.find({ userId: req.user._id })
                .populate({
                    path: 'showId',
                    populate: {
                        path: 'movieId',
                        select: 'title poster duration genre'
                    }
                })
                .sort('-bookingTime')
                .skip(skip)
                .limit(parseInt(limit)),

            Booking.countDocuments({
                userId: req.user._id
            })

        ]);

        res.status(200).json({
            success: true,
            data: bookings,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        next(error);
    }

};



// @desc    Get single booking with ticket
// @route   GET /api/bookings/:id
const getBooking = async (req, res, next) => {

    try {

        const booking = await Booking.findById(req.params.id).populate({
            path: 'showId',
            populate: {
                path: 'movieId'
            }
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (
            booking.userId.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        res.status(200).json({
            success: true,
            data: booking
        });

    } catch (error) {
        next(error);
    }

};


// @desc    Cancel an existing booking (either pending or completed)
// @route   PUT /api/bookings/:id/cancel
const cancelBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // Verify ownership or admin
        if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Unauthorized to cancel this booking' });
        }

        if (booking.status === 'cancelled') {
            return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
        }

        if (booking.paymentStatus === 'completed') {
            const show = await Show.findById(booking.showId);
            if (show) {
                // Unmark seats in Show DB
                booking.seats.forEach((seatId) => {
                    const seat = show.seatLayout.find((s) => s.seatId === seatId);
                    if (seat) seat.isBooked = false;
                });
                
                show.availableSeats = Math.min(show.totalSeats || Infinity, show.availableSeats + booking.seats.length);
                await show.save({ validateBeforeSave: false });

                // Decrement SeatAnalytics
                for (const seatId of booking.seats) {
                    await SeatAnalytics.updateOne(
                        { showId: booking.showId, seatId },
                        { $inc: { bookingCount: -1 } }
                    );
                }
            }
        } else if (booking.paymentStatus === 'pending') {
            // It might still have locks in Redis
            await releaseSeats(booking.showId.toString(), booking.seats, booking.userId);
        }

        booking.paymentStatus = 'cancelled';
        booking.status = 'cancelled';
        await booking.save({ validateBeforeSave: false });

        logger.info(`Booking cancelled: ${booking.bookingReference || booking._id} by user ${req.user._id}`);

        res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully'
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    lockAndInitiate,
    createBooking,
    confirmBooking,
    releaseBooking,
    cancelBooking,
    getMyBookings,
    getBooking
};