const Razorpay = require('razorpay');
const crypto = require('crypto');
const logger = require('../utils/logger');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create a Razorpay order
 */
const createOrder = async ({ amount, currency = 'INR', receipt, notes = {} }) => {
    try {
        const order = await razorpay.orders.create({
            amount: Math.round(amount * 100), // Convert to paise
            currency,
            receipt,
            notes,
        });
        logger.info(`Razorpay order created: ${order.id}`);
        return order;
    } catch (error) {
        logger.error(`Razorpay order creation failed: ${error.message}`);
        throw new Error(`Payment order creation failed: ${error.description || error.message}`);
    }
};

/**
 * Verify Razorpay payment signature
 */
const verifySignature = (orderId, paymentId, signature) => {
    const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

    return generatedSignature === signature;
};

/**
 * Fetch payment details from Razorpay
 */
const fetchPayment = async (paymentId) => {
    try {
        return await razorpay.payments.fetch(paymentId);
    } catch (error) {
        logger.error(`Failed to fetch payment ${paymentId}: ${error.message}`);
        throw error;
    }
};

/**
 * Initiate refund for a payment
 */
const initiateRefund = async (paymentId, amount) => {
    try {
        const refund = await razorpay.payments.refund(paymentId, {
            amount: Math.round(amount * 100),
        });
        logger.info(`Refund initiated: ${refund.id} for payment ${paymentId}`);
        return refund;
    } catch (error) {
        logger.error(`Refund failed for payment ${paymentId}: ${error.message}`);
        throw error;
    }
};

module.exports = { createOrder, verifySignature, fetchPayment, initiateRefund };
