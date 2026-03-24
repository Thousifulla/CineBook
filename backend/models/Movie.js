const mongoose = require('mongoose');

const castSchema = new mongoose.Schema({
    name: { type: String, required: true },
    character: { type: String, default: '' },
    photo: { type: String, default: '' },
    tmdbId: { type: Number },
}, { _id: false });

const movieSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Movie title is required'],
            trim: true,
            maxlength: [200, 'Title cannot exceed 200 characters'],
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            maxlength: [2000, 'Description cannot exceed 2000 characters'],
        },
        genre: {
            type: [String],
            required: [true, 'At least one genre is required'],
        },
        language: {
            type: [String],
            required: [true, 'At least one language is required'],
        },
        duration: {
            type: Number,
            required: [true, 'Duration is required'],
            min: [1, 'Duration must be positive'],
        },
        poster: {
            type: String,
            default: '',
        },
        trailer: {
            type: String,
            default: '',
        },
        rating: {
            type: Number,
            min: 0,
            max: 10,
            default: 0,
        },
        releaseDate: {
            type: Date,
            required: [true, 'Release date is required'],
        },
        cast: [castSchema],
        tmdbId: {
            type: Number,
            unique: true,
            sparse: true,
        },
        popularity: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isUpcoming: {
            type: Boolean,
            default: false,
        },
        isBookingOpen: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
    }
);

// Text index for search
movieSchema.index({ title: 'text', description: 'text' }, { language_override: 'dummy_lang' });
movieSchema.index({ genre: 1 });
movieSchema.index({ language: 1 });
movieSchema.index({ releaseDate: -1 });
movieSchema.index({ rating: -1 });
movieSchema.index({ isActive: 1 });

module.exports = mongoose.model('Movie', movieSchema);
