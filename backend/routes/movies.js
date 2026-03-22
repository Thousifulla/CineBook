const express = require('express');
const router = express.Router();
const {
    getMovies, getMovie, createMovie, updateMovie, deleteMovie, getTrendingMovies, searchMovies
} = require('../controllers/movieController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminAuth');
const validate = require('../middleware/validate');
const { movieSchema } = require('../utils/validators');

router.get('/', getMovies);
router.get('/trending', getTrendingMovies);
router.get('/search', searchMovies);
router.get('/:id', getMovie);
router.post('/', protect, adminOnly, validate(movieSchema), createMovie);
router.put('/:id', protect, adminOnly, updateMovie);
router.delete('/:id', protect, adminOnly, deleteMovie);

module.exports = router;
