const Show = require('../models/Show');
const Movie = require('../models/Movie');
const { getAllLockedSeats } = require('../services/seatLockService');
const { recommendSeats } = require('../utils/seatRecommendation');
const generateSeatLayout = require('../utils/generateSeatLayout');
const logger = require('../utils/logger');


// @desc    Get shows for a movie
// @route   GET /api/shows/movie/:movieId
const getShowsByMovie = async (req, res, next) => {
    try {

        const { city, date } = req.query;

        const query = {
            movieId: req.params.movieId,
            isActive: true
        };

        if (city) {
            query['theater.city'] = { $regex: city, $options: 'i' };
        }

        if (date) {
            // Parse the YYYY-MM-DD date and build a UTC range that covers the
            // full local calendar day (handles IST +5:30 offset and others)
            const start = new Date(date);
            start.setUTCHours(0, 0, 0, 0);

            const end = new Date(start);
            end.setUTCDate(end.getUTCDate() + 1); // next midnight UTC

            query.showTime = { $gte: start, $lt: end };

        } else {
            // No date filter: return all upcoming shows from now
            query.showTime = { $gte: new Date() };
        }


        const shows = await Show.find(query)
            .populate('movieId', 'title poster duration')
            .sort('showTime');

        res.status(200).json({
            success: true,
            data: shows
        });

    } catch (error) {
        next(error);
    }
};



// @desc    Get single show with seat layout + redis lock info
// @route   GET /api/shows/:id
const getShow = async (req, res, next) => {

    try {

        const show = await Show.findById(req.params.id)
            .populate('movieId');

        if (!show) {
            return res.status(404).json({
                success: false,
                message: 'Show not found'
            });
        }

        const lockedSeats = await getAllLockedSeats(show._id.toString());

        res.status(200).json({
            success: true,
            data: {
                ...show.toObject(),
                lockedSeats
            }
        });

    } catch (error) {
        next(error);
    }

};



// @desc    Recommend best seats
// @route   GET /api/shows/recommend-seats
const getRecommendedSeats = async (req, res, next) => {

    try {

        const { showId, seats } = req.query;

        const show = await Show.findById(showId);

        if (!show) {
            return res.status(404).json({
                success: false,
                message: "Show not found"
            });
        }

        const seatMap = show.seatLayout;

        const recommended = recommendSeats(seatMap, parseInt(seats));

        res.status(200).json({
            success: true,
            data: recommended
        });

    } catch (error) {
        next(error);
    }

};



// @desc    Create show (Admin)
// @route   POST /api/shows
const createShow = async (req, res, next) => {

    try {

        const movie = await Movie.findById(req.body.movieId);

        if (!movie) {
            return res.status(404).json({
                success: false,
                message: "Movie not found"
            });
        }

        const seatLayout = generateSeatLayout();

        const show = await Show.create({
            ...req.body,
            seatLayout,
            totalSeats: seatLayout.length,
            availableSeats: seatLayout.length
        });

        logger.info(`Show created for movie: ${movie.title} at ${show.showTime}`);

        res.status(201).json({
            success: true,
            message: "Show created",
            data: show
        });

    } catch (error) {
        next(error);
    }

};



// @desc    Update show (Admin)
// @route   PUT /api/shows/:id
const updateShow = async (req, res, next) => {

    try {

        const show = await Show.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!show) {
            return res.status(404).json({
                success: false,
                message: 'Show not found'
            });
        }

        res.status(200).json({
            success: true,
            data: show
        });

    } catch (error) {
        next(error);
    }

};



// @desc    Delete show (Admin)
// @route   DELETE /api/shows/:id
const deleteShow = async (req, res, next) => {

    try {

        await Show.findByIdAndUpdate(req.params.id, {
            isActive: false
        });

        res.status(200).json({
            success: true,
            message: 'Show removed'
        });

    } catch (error) {
        next(error);
    }

};



// @desc    Get all shows (Admin)
// @route   GET /api/shows
const getAllShows = async (req, res, next) => {

    try {

        const { page = 1, limit = 20 } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [shows, total] = await Promise.all([

            Show.find({})
                .populate('movieId', 'title poster')
                .sort('-showTime')
                .skip(skip)
                .limit(parseInt(limit)),

            Show.countDocuments({})

        ]);

        res.status(200).json({
            success: true,
            data: shows,
            pagination: {
                page: parseInt(page),
                total
            }
        });

    } catch (error) {
        next(error);
    }

};



module.exports = {
    getShowsByMovie,
    getShow,
    getRecommendedSeats,
    createShow,
    updateShow,
    deleteShow,
    getAllShows
};