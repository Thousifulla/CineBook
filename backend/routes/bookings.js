const express = require('express');
const router = express.Router();
const {
    lockAndInitiate, createBooking, confirmBooking, releaseBooking, cancelBooking, getMyBookings, getBooking,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { bookingSchema } = require('../utils/validators');

router.use(protect); // All booking routes require auth

router.post('/lock', validate(bookingSchema), lockAndInitiate);
router.post('/', createBooking);
router.get('/my', getMyBookings);
router.get('/:id', getBooking);
router.put('/:id/confirm', confirmBooking);
router.put('/:id/release', releaseBooking);
router.put('/:id/cancel', cancelBooking);

module.exports = router;
