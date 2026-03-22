const QRCode = require('qrcode');
const logger = require('./logger');

/**
 * Generate a QR code as a base64 data URL for a booking ticket
 * @param {Object} bookingData - The booking data to encode
 * @returns {Promise<string>} Base64 QR code data URL
 */
const generateBookingQR = async (bookingData) => {
    try {
        const payload = JSON.stringify({
            bookingId: bookingData._id,
            userId: bookingData.userId,
            showId: bookingData.showId,
            seats: bookingData.seats,
            totalPrice: bookingData.totalPrice,
            bookingTime: bookingData.bookingTime,
        });

        const qrDataURL = await QRCode.toDataURL(payload, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            quality: 0.95,
            margin: 1,
            color: { dark: '#1a1a2e', light: '#ffffff' },
            width: 256,
        });

        return qrDataURL;
    } catch (error) {
        logger.error(`QR Code generation failed: ${error.message}`);
        throw new Error('Failed to generate QR code');
    }
};

module.exports = { generateBookingQR };
