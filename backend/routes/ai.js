const express = require('express');
const router = express.Router();
const { generateSuggestions, getSuggestions, approveSuggestion, rejectSuggestion, reapproveSuggestion } = require('../controllers/aiController');
const { getSchedulingStatus, executeScheduling } = require('../controllers/aiSchedulingController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminAuth');
const { aiLimiter } = require('../middleware/rateLimiter');

router.use(protect, adminOnly); // All AI routes are admin-only

router.post('/generate', aiLimiter, generateSuggestions);
router.get('/suggestions', getSuggestions);
router.put('/suggestions/:id/approve', approveSuggestion);
router.put('/suggestions/:id/reject', rejectSuggestion);
router.put('/suggestions/:id/reapprove', reapproveSuggestion);

router.get('/schedule-status', getSchedulingStatus);
router.post('/schedule', executeScheduling);

module.exports = router;
