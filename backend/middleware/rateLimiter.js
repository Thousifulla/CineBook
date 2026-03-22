const rateLimit = require('express-rate-limit');

// Auth-specific stricter limiter
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: {
        success: false,
        message: 'Too many authentication attempts. Please try again in 15 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
});

// Payment-specific limiter
const paymentLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20,
    message: {
        success: false,
        message: 'Too many payment requests. Please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// AI suggestion limiter
const aiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: {
        success: false,
        message: 'AI suggestion requests are rate limited. Please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { authLimiter, paymentLimiter, aiLimiter };
