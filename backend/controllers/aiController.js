const AISuggestion = require('../models/AISuggestion');
const Movie = require('../models/Movie');
const { generateRecommendations } = require('../services/aiService');
const logger = require('../utils/logger');

// @desc    Fetch and store AI movie recommendations from TMDB
// @route   POST /api/ai/generate
const generateSuggestions = async (req, res, next) => {
    try {
        // Get existing TMDB IDs to avoid duplicates
        const [existingMovies, existingSuggestions] = await Promise.all([
            Movie.find({}, 'tmdbId').lean(),
            AISuggestion.find({}, 'movieData.tmdbId').lean(),
        ]);
        const existingIds = [
            ...existingMovies.filter((m) => m.tmdbId).map((m) => m.tmdbId),
            ...existingSuggestions.map((s) => s.movieData.tmdbId),
        ];

        const recommendations = await generateRecommendations(existingIds);

        if (recommendations.length === 0) {
            return res.status(200).json({ success: true, message: 'No new recommendations found', data: [] });
        }

        // Bulk insert AI suggestions
        const docs = recommendations.map((rec) => ({
            movieData: {
                tmdbId: rec.tmdbId,
                title: rec.title,
                overview: rec.overview,
                genre: rec.genre,
                releaseDate: rec.releaseDate,
                rating: rec.rating,
                popularity: rec.popularity,
                poster: rec.poster,
                trailer: rec.trailer,
                runtime: rec.runtime,
                language: rec.language,
                cast: rec.cast,
            },
            aiScore: rec.aiScore,
            scoreBreakdown: rec.scoreBreakdown,
            status: 'pending',
        }));

        const created = await AISuggestion.insertMany(docs, { ordered: false }).catch((e) => {
            // Ignore duplicate key errors (tmdbId already exists)
            logger.warn(`Some suggestions skipped (duplicates): ${e.message}`);
            return [];
        });

        logger.info(`AI generated ${created.length || recommendations.length} new suggestions`);
        const all = await AISuggestion.find({ status: 'pending' }).sort('-aiScore');
        res.status(200).json({ success: true, message: `Generated ${all.length} pending suggestions`, data: all });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all AI suggestions
// @route   GET /api/ai/suggestions
const getSuggestions = async (req, res, next) => {
    try {
        const { status = 'pending', page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [suggestions, total] = await Promise.all([
            AISuggestion.find({ status }).sort('-aiScore').skip(skip).limit(parseInt(limit)),
            AISuggestion.countDocuments({ status }),
        ]);
        res.status(200).json({ success: true, data: suggestions, pagination: { page: parseInt(page), total } });
    } catch (error) {
        next(error);
    }
};

// @desc    Approve a suggestion → add to Movies collection
// @route   PUT /api/ai/suggestions/:id/approve
const approveSuggestion = async (req, res, next) => {
    try {
        const suggestion = await AISuggestion.findById(req.params.id);
        if (!suggestion) return res.status(404).json({ success: false, message: 'Suggestion not found' });
        if (suggestion.status !== 'pending') {
            return res.status(400).json({ success: false, message: `Suggestion already ${suggestion.status}` });
        }

        const { movieData } = suggestion;

        // Create the movie
        const movie = await Movie.create({
            title: movieData.title,
            description: movieData.overview,
            genre: movieData.genre,
            language: [movieData.language === 'en' ? 'English' : movieData.language],
            duration: movieData.runtime || 120,
            poster: movieData.poster,
            trailer: movieData.trailer,
            rating: movieData.rating,
            releaseDate: movieData.releaseDate || new Date(),
            cast: movieData.cast,
            tmdbId: movieData.tmdbId,
            popularity: movieData.popularity,
            isUpcoming: movieData.releaseDate ? new Date(movieData.releaseDate) > new Date() : false,
        });

        suggestion.status = 'approved';
        suggestion.reviewedBy = req.user._id;
        suggestion.reviewedAt = new Date();
        await suggestion.save();

        logger.info(`AI suggestion approved: ${movieData.title} → Movie ID: ${movie._id}`);
        res.status(200).json({ success: true, message: `"${movieData.title}" approved and added to movies!`, data: movie });
    } catch (error) {
        next(error);
    }
};

// @desc    Reject a suggestion
// @route   PUT /api/ai/suggestions/:id/reject
const rejectSuggestion = async (req, res, next) => {
    try {
        const { reason } = req.body;
        const suggestion = await AISuggestion.findByIdAndUpdate(
            req.params.id,
            { status: 'rejected', reviewedBy: req.user._id, reviewedAt: new Date(), rejectionReason: reason || '' },
            { new: true }
        );
        if (!suggestion) return res.status(404).json({ success: false, message: 'Suggestion not found' });
        res.status(200).json({ success: true, message: 'Suggestion rejected', data: suggestion });
    } catch (error) {
        next(error);
    }
};

module.exports = { generateSuggestions, getSuggestions, approveSuggestion, rejectSuggestion };
