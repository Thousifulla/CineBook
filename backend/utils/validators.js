const Joi = require('joi');

// ===== AUTH VALIDATORS =====
const registerSchema = Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
        'string.empty': 'Name is required',
        'string.min': 'Name must be at least 2 characters',
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Please enter a valid email',
        'string.empty': 'Email is required',
    }),
    password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
        .required()
        .messages({
            'string.min': 'Password must be at least 8 characters',
            'string.pattern.base': 'Password must contain uppercase, lowercase, number, and special character',
        }),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

// ===== MOVIE VALIDATORS =====
const movieSchema = Joi.object({
    title: Joi.string().min(1).max(200).required(),
    description: Joi.string().min(10).max(2000).required(),
    genre: Joi.array().items(Joi.string()).min(1).required(),
    language: Joi.array().items(Joi.string()).min(1).required(),
    duration: Joi.number().min(1).max(600).required(),
    rating: Joi.number().min(0).max(10).optional(),
    releaseDate: Joi.date().required(),
    poster: Joi.string().uri().optional(),
    trailer: Joi.string().optional(),
    cast: Joi.array().items(Joi.object({
        name: Joi.string().required(),
        character: Joi.string().optional(),
        photo: Joi.string().uri().optional(),
    })).optional(),
    tmdbId: Joi.number().optional(),
});

// ===== SHOW VALIDATORS =====
const showSchema = Joi.object({
    movieId: Joi.string().hex().length(24).required(),
    theater: Joi.object({
        name: Joi.string().required(),
        location: Joi.string().required(),
        city: Joi.string().required(),
        screen: Joi.string().required(),
    }).required(),
    showTime: Joi.date().greater('now').required(),
    seatPricing: Joi.object({
        regular: Joi.number().min(0).required(),
        premium: Joi.number().min(0).required(),
        vip: Joi.number().min(0).required(),
    }).required(),
    totalSeats: Joi.number().min(10).max(500).optional(),
});

// ===== BOOKING VALIDATORS =====
const bookingSchema = Joi.object({
    showId: Joi.string().hex().length(24).required(),
    seats: Joi.array().items(Joi.string()).min(1).max(10).required().messages({
        'array.min': 'Select at least one seat',
        'array.max': 'Cannot book more than 10 seats at once',
    }),
});

// ===== PAYMENT VALIDATORS =====
const paymentVerifySchema = Joi.object({
    razorpay_order_id: Joi.string().required(),
    razorpay_payment_id: Joi.string().required(),
    razorpay_signature: Joi.string().required(),
    bookingId: Joi.string().hex().length(24).required(),
});

module.exports = {
    registerSchema,
    loginSchema,
    movieSchema,
    showSchema,
    bookingSchema,
    paymentVerifySchema,
};
