const mongoose = require('mongoose');

const aiSuggestionSchema = new mongoose.Schema(
    {
        movieData: {
            tmdbId: { type: Number, required: true, unique: true },
            title: { type: String, required: true },
            overview: { type: String, default: '' },
            genre: { type: [String], default: [] },
            releaseDate: { type: Date },
            rating: { type: Number, default: 0 },
            popularity: { type: Number, default: 0 },
            poster: { type: String, default: '' },
            trailer: { type: String, default: '' },
            runtime: { type: Number, default: 0 },
            language: { type: String, default: 'en' },
            cast: [
                {
                    name: String,
                    character: String,
                    photo: String,
                    tmdbId: Number,
                    _id: false,
                },
            ],
        },
        aiScore: {
            type: Number,
            default: 0,
            comment: 'AI-computed recommendation score (0-100)',
        },
        scoreBreakdown: {
            popularityScore: { type: Number, default: 0 },
            ratingScore: { type: Number, default: 0 },
            recencyScore: { type: Number, default: 0 },
            genreScore: { type: Number, default: 0 },
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        reviewedAt: {
            type: Date,
            default: null,
        },
        rejectionReason: {
            type: String,
            default: '',
        },
    },
    { timestamps: true }
);

aiSuggestionSchema.index({ status: 1, aiScore: -1 });

module.exports = mongoose.model('AISuggestion', aiSuggestionSchema);
