const User = require('../models/User');
const Movie = require('../models/Movie');
const Show = require('../models/Show');
const Booking = require('../models/Booking');
const logger = require('../utils/logger');

// @desc    Get admin dashboard analytics
// @route   GET /api/admin/analytics
const getAnalytics = async (req, res, next) => {
    try {
        const [
            totalUsers, totalMovies, totalShows, totalBookings,
            revenueResult, recentBookings, popularMovies,
        ] = await Promise.all([
            User.countDocuments({ role: 'user' }),
            Movie.countDocuments({ isActive: true }),
            Show.countDocuments({ isActive: true }),
            Booking.countDocuments({ paymentStatus: 'completed' }),
            Booking.aggregate([
                { $match: { paymentStatus: 'completed' } },
                { $group: { _id: null, total: { $sum: '$totalPrice' } } },
            ]),
            Booking.find({ paymentStatus: 'completed' })
                .sort('-bookingTime')
                .limit(10)
                .populate('userId', 'name email')
                .populate({ path: 'showId', populate: { path: 'movieId', select: 'title' } }),
            Booking.aggregate([
                { $match: { paymentStatus: 'completed' } },
                { $lookup: { from: 'shows', localField: 'showId', foreignField: '_id', as: 'show' } },
                { $unwind: '$show' },
                { $lookup: { from: 'movies', localField: 'show.movieId', foreignField: '_id', as: 'movie' } },
                { $unwind: '$movie' },
                { $group: { _id: '$movie._id', title: { $first: '$movie.title' }, poster: { $first: '$movie.poster' }, bookings: { $sum: 1 }, revenue: { $sum: '$totalPrice' } } },
                { $sort: { bookings: -1 } },
                { $limit: 5 },
            ]),
        ]);

        const totalRevenue = revenueResult[0]?.total || 0;

        // Revenue by month (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const monthlyRevenue = await Booking.aggregate([
            { $match: { paymentStatus: 'completed', createdAt: { $gte: sixMonthsAgo } } },
            { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$totalPrice' }, bookings: { $sum: 1 } } },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);

        res.status(200).json({
            success: true,
            data: {
                overview: { totalUsers, totalMovies, totalShows, totalBookings, totalRevenue },
                recentBookings,
                popularMovies,
                monthlyRevenue,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all users (Admin)
// @route   GET /api/admin/users
const getAllUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [users, total] = await Promise.all([
            User.find({}).sort('-createdAt').skip(skip).limit(parseInt(limit)),
            User.countDocuments({}),
        ]);
        res.status(200).json({ success: true, data: users, pagination: { page: parseInt(page), total } });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/admin/bookings
const getAllBookings = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const query = {};
        if (status) query.paymentStatus = status;

        const [bookings, total] = await Promise.all([
            Booking.find(query)
                .populate('userId', 'name email')
                .populate({ path: 'showId', populate: { path: 'movieId', select: 'title poster' } })
                .sort('-bookingTime')
                .skip(skip)
                .limit(parseInt(limit)),
            Booking.countDocuments(query),
        ]);

        res.status(200).json({ success: true, data: bookings, pagination: { page: parseInt(page), total } });
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle user active status (Admin)
// @route   PUT /api/admin/users/:id/toggle
const toggleUserStatus = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        user.isActive = !user.isActive;
        await user.save({ validateBeforeSave: false });
        res.status(200).json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, data: user });
    } catch (error) {
        next(error);
    }
};

module.exports = { getAnalytics, getAllUsers, getAllBookings, toggleUserStatus };
