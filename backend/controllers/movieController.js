const Movie = require('../models/Movie');
const logger = require('../utils/logger');

// @desc    Get all movies (with filtering and search)
// @route   GET /api/movies
// @access  Public
const getMovies = async (req, res, next) => {
    try {
        const { search, genre, language, page = 1, limit = 12, sort = '-releaseDate', upcoming } = req.query;

        const query = { isActive: true };

        if (search) {
            query.$text = { $search: search };
        }
        if (genre) {
            query.genre = { $in: Array.isArray(genre) ? genre : [genre] };
        }
        if (language) {
            query.language = { $in: Array.isArray(language) ? language : [language] };
        }
        if (upcoming === 'true') {
            query.releaseDate = { $gt: new Date() };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [movies, total] = await Promise.all([
            Movie.find(query).sort(sort).skip(skip).limit(parseInt(limit)).lean(),
            Movie.countDocuments(query),
        ]);

        res.status(200).json({
            success: true,
            data: movies,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single movie
// @route   GET /api/movies/:id
// @access  Public
const getMovie = async (req, res, next) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            return res.status(404).json({ success: false, message: 'Movie not found' });
        }
        res.status(200).json({ success: true, data: movie });
    } catch (error) {
        next(error);
    }
};

// @desc    Create movie (Admin)
// @route   POST /api/movies
// @access  Admin
const createMovie = async (req, res, next) => {
    try {
        const movie = await Movie.create(req.body);
        logger.info(`Movie created: ${movie.title}`);
        res.status(201).json({ success: true, message: 'Movie created successfully', data: movie });
    } catch (error) {
        next(error);
    }
};

// @desc    Update movie (Admin)
// @route   PUT /api/movies/:id
// @access  Admin
const updateMovie = async (req, res, next) => {
    try {
        const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!movie) {
            return res.status(404).json({ success: false, message: 'Movie not found' });
        }
        logger.info(`Movie updated: ${movie.title}`);
        res.status(200).json({ success: true, message: 'Movie updated', data: movie });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete movie (Admin)
// @route   DELETE /api/movies/:id
// @access  Admin
const deleteMovie = async (req, res, next) => {
    try {
        const movie = await Movie.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!movie) {
            return res.status(404).json({ success: false, message: 'Movie not found' });
        }
        logger.info(`Movie soft-deleted: ${movie.title}`);
        res.status(200).json({ success: true, message: 'Movie removed successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc    Get trending movies
// @route   GET /api/movies/trending
// @access  Public
const getTrendingMovies = async (req, res, next) => {
    try {
        const movies = await Movie.find({ isActive: true })
            .sort({ rating: -1, popularity: -1 })
            .limit(10)
            .lean();
        res.status(200).json({ success: true, data: movies });
    } catch (error) {
        next(error);
    }
};

// @desc    Search movies for navbar autocomplete
// @route   GET /api/movies/search?q=query
// @access  Public
const searchMovies = async (req, res, next) => {
    try {
        const { q } = req.query;
        if (!q || q.length < 2) {
            return res.status(200).json({ success: true, data: [] });
        }

        const movies = await Movie.find({
            isActive: true,
            title: { $regex: q, $options: 'i' }
        })
            .select('title poster genre language releaseDate')
            .limit(5)
            .lean();

        res.status(200).json({ success: true, data: movies });
    } catch (error) {
        next(error);
    }
};

module.exports = { getMovies, getMovie, createMovie, updateMovie, deleteMovie, getTrendingMovies, searchMovies };
