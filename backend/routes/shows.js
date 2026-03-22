const express = require('express');
const router = express.Router();

const {
    getShowsByMovie,
    getShow,
    getRecommendedSeats,
    createShow,
    updateShow,
    deleteShow,
    getAllShows
} = require('../controllers/showController');

const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminAuth');
const validate = require('../middleware/validate');
const { showSchema } = require('../utils/validators');


/*
--------------------------------
 ADMIN ROUTES
--------------------------------
*/

// Get all shows (Admin)
router.get('/', protect, adminOnly, getAllShows);

// Create show (Admin)
router.post('/', protect, adminOnly, validate(showSchema), createShow);

// Update show (Admin)
router.put('/:id', protect, adminOnly, updateShow);

// Delete show (Admin)
router.delete('/:id', protect, adminOnly, deleteShow);


/*
--------------------------------
 PUBLIC ROUTES
--------------------------------
*/

// Get shows for a movie
router.get('/movie/:movieId', getShowsByMovie);

// Seat recommendation
router.get('/recommend-seats', getRecommendedSeats);

// Get single show with seat layout
router.get('/:id', getShow);


module.exports = router;