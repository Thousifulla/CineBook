const express = require('express');
const router = express.Router();
const { createPaymentOrder, verifyPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { paymentVerifySchema } = require('../utils/validators');
const { paymentLimiter } = require('../middleware/rateLimiter');

router.use(protect);
router.post('/create-order', paymentLimiter, createPaymentOrder);
router.post('/verify', paymentLimiter, validate(paymentVerifySchema), verifyPayment);

module.exports = router;
