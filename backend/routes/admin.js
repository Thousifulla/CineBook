const express = require('express');
const router = express.Router();
const { getAnalytics, getAllUsers, getAllBookings, toggleUserStatus } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminAuth');

router.use(protect, adminOnly); // All admin routes require auth + admin role

router.get('/analytics', getAnalytics);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle', toggleUserStatus);
router.get('/bookings', getAllBookings);

module.exports = router;
