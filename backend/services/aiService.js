const axios = require('axios');
const logger = require('../utils/logger');

const TMDB_BASE = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const TMDB_KEY = process.env.TMDB_API_KEY;
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

const genreMap = {
    28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
    80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
    14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
    9648: 'Mystery', 10749: 'Romance', 878: 'Science Fiction',
    10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
};

/**
 * Fetch upcoming & trending movies from TMDB
 */
const fetchTMDBMovies = async () => {
    const [upcomingRes, trendingRes, topRatedRes] = await Promise.all([
        axios.get(`${TMDB_BASE}/movie/upcoming?api_key=${TMDB_KEY}&language=en-US&page=1`),
        axios.get(`${TMDB_BASE}/trending/movie/week?api_key=${TMDB_KEY}`),
        axios.get(`${TMDB_BASE}/movie/top_rated?api_key=${TMDB_KEY}&language=en-US&page=1`),
    ]);

    const upcoming = upcomingRes.data.results || [];
    const trending = trendingRes.data.results || [];
    const topRated = topRatedRes.data.results || [];

    // Merge and deduplicate by tmdbId
    const movieMap = new Map();
    [...upcoming, ...trending, ...topRated].forEach((movie) => {
        if (!movieMap.has(movie.id)) {
            movieMap.set(movie.id, { ...movie, source: [] });
        }
        const entry = movieMap.get(movie.id);
        if (upcoming.find((m) => m.id === movie.id)) entry.source.push('upcoming');
        if (trending.find((m) => m.id === movie.id)) entry.source.push('trending');
        if (topRated.find((m) => m.id === movie.id)) entry.source.push('topRated');
    });

    return Array.from(movieMap.values());
};

/**
 * Fetch movie details + cast from TMDB
 */
const fetchMovieDetails = async (tmdbId) => {
    const [details, credits, videos] = await Promise.all([
        axios.get(`${TMDB_BASE}/movie/${tmdbId}?api_key=${TMDB_KEY}&language=en-US`),
        axios.get(`${TMDB_BASE}/movie/${tmdbId}/credits?api_key=${TMDB_KEY}`),
        axios.get(`${TMDB_BASE}/movie/${tmdbId}/videos?api_key=${TMDB_KEY}&language=en-US`),
    ]);

    const cast = (credits.data.cast || []).slice(0, 10).map((actor) => ({
        name: actor.name,
        character: actor.character,
        photo: actor.profile_path ? `${TMDB_IMAGE_BASE}${actor.profile_path}` : '',
        tmdbId: actor.id,
    }));

    const trailerVideo = (videos.data.results || []).find(
        (v) => v.type === 'Trailer' && v.site === 'YouTube'
    );

    return {
        cast,
        trailer: trailerVideo ? `https://www.youtube.com/embed/${trailerVideo.key}` : '',
        runtime: details.data.runtime || 0,
        homepage: details.data.homepage || '',
    };
};

/**
 * AI Scoring Algorithm
 * Scores movies based on popularity, rating, recency, and genre demand
 */
const computeAIScore = (movie, source = []) => {
    const now = new Date();
    const releaseDate = new Date(movie.release_date);
    const daysFromNow = Math.abs((releaseDate - now) / (1000 * 60 * 60 * 24));

    // Popularity score (0-40 points) — TMDB popularity is typically 0-1000+
    const popularityScore = Math.min((movie.popularity / 1000) * 40, 40);

    // Rating score (0-30 points) — vote_average is 0-10
    const ratingScore = (movie.vote_average / 10) * 30;

    // Recency/Upcoming score (0-20 points)
    // Future releases within 90 days or recent releases score higher
    let recencyScore = 0;
    if (daysFromNow <= 90) recencyScore = 20;
    else if (daysFromNow <= 180) recencyScore = 15;
    else if (daysFromNow <= 365) recencyScore = 10;
    else recencyScore = 5;

    // Source bonus (0-10 points)
    let genreScore = 0;
    if (source.includes('trending')) genreScore += 5;
    if (source.includes('topRated')) genreScore += 3;
    if (source.includes('upcoming')) genreScore += 2;

    const aiScore = Math.min(
        Math.round(popularityScore + ratingScore + recencyScore + genreScore),
        100
    );

    return {
        aiScore,
        scoreBreakdown: {
            popularityScore: Math.round(popularityScore),
            ratingScore: Math.round(ratingScore),
            recencyScore: Math.round(recencyScore),
            genreScore: Math.round(genreScore),
        },
    };
};

/**
 * Main AI recommendation pipeline
 */
const generateRecommendations = async (existingTmdbIds = []) => {
    try {
        logger.info('Starting AI recommendation pipeline...');
        const movies = await fetchTMDBMovies();

        const recommendations = [];

        for (const movie of movies) {
            // Skip movies already in DB
            if (existingTmdbIds.includes(movie.id)) continue;

            // Filter low quality
            if (movie.vote_count < 10 || !movie.poster_path) continue;

            const { cast, trailer, runtime } = await fetchMovieDetails(movie.id).catch(() => ({
                cast: [], trailer: '', runtime: 0,
            }));

            const { aiScore, scoreBreakdown } = computeAIScore(movie, movie.source || []);

            const genres = (movie.genre_ids || []).map((id) => genreMap[id] || 'Other');

            recommendations.push({
                tmdbId: movie.id,
                title: movie.title,
                overview: movie.overview,
                genre: genres,
                releaseDate: movie.release_date ? new Date(movie.release_date) : null,
                rating: movie.vote_average || 0,
                popularity: movie.popularity || 0,
                poster: movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : '',
                trailer,
                runtime,
                language: movie.original_language || 'en',
                cast,
                aiScore,
                scoreBreakdown,
            });
        }

        // Sort by AI score descending
        recommendations.sort((a, b) => b.aiScore - a.aiScore);

        logger.info(`AI generated ${recommendations.length} recommendations`);
        return recommendations.slice(0, 20); // Return top 20
    } catch (error) {
        logger.error(`AI recommendation failed: ${error.message}`);
        throw error;
    }
};

module.exports = { generateRecommendations, fetchMovieDetails, fetchTMDBMovies };
