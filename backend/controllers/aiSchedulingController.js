const Movie = require('../models/Movie');
const Show = require('../models/Show');
const generateSeatLayout = require('../utils/generateSeatLayout');
const logger = require('../utils/logger');

const getSchedulingStatus = async (req, res, next) => {
    try {
        const activeMovies = await Movie.find({ isActive: true, isBookingOpen: true }).lean();
        const suggestions = [];
        const now = new Date();
        const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

        for (const movie of activeMovies) {
            const lastShow = await Show.findOne({ movieId: movie._id }).sort('-showTime').lean();
            if (!lastShow) {
                suggestions.push({ movie, status: 'needs_initial', message: 'No shows scheduled yet. AI can auto-schedule 4 days of shows.' });
            } else if (new Date(lastShow.showTime) < twoDaysFromNow) {
                suggestions.push({ movie, lastShow, status: 'needs_continuation', message: `Last show is on ${new Date(lastShow.showTime).toLocaleDateString()}. Continue scheduling?` });
            } else {
                suggestions.push({ movie, lastShow, status: 'scheduled', message: `Scheduled up to ${new Date(lastShow.showTime).toLocaleDateString()}`});
            }
        }

        res.status(200).json({ success: true, data: suggestions });
    } catch (error) {
        next(error);
    }
};

const executeScheduling = async (req, res, next) => {
    try {
        const { movieId, days } = req.body;
        const numDays = parseInt(days) || 4;
        
        const movie = await Movie.findById(movieId);
        if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });

        const lastShow = await Show.findOne({ movieId }).sort('-showTime').lean();
        
        let startDate = new Date();
        startDate.setUTCHours(0,0,0,0);
        // Start scheduling from TODAY explicitly if no previous shows exist.

        let theater = { name: 'CineBook Main Screen', location: 'City Center', city: 'Metropolis', screen: 'Screen 1' };
        let seatPricing = { regular: 150, premium: 250, vip: 400 };
        let format = '2D';
        let language = movie.language?.[0] || 'English';

        if (lastShow) {
            const lsDate = new Date(lastShow.showTime);
            lsDate.setUTCHours(0,0,0,0);
            
            // Start from the day after the last show's calendar date
            startDate = new Date(lsDate.getTime() + 24 * 60 * 60 * 1000);
            // Quick safety check to avoid scheduling in the past if the last show was a month ago
            if (startDate < new Date()) {
                startDate = new Date();
                startDate.setUTCHours(0,0,0,0);
                startDate.setUTCDate(startDate.getUTCDate() + 1);
            }
            
            theater = lastShow.theater;
            seatPricing = lastShow.seatPricing || seatPricing;
            format = lastShow.format || format;
            language = lastShow.language || language;
        }

        // Times offsets: 10:00, 13:30, 17:00, 21:00 (approximate hours added to UTC midnight)
        const showTimeOffsets = [
            10 * 60 * 60 * 1000, 
            (13 * 60 + 30) * 60 * 1000, 
            17 * 60 * 60 * 1000, 
            21 * 60 * 60 * 1000
        ];

        const newShows = [];
        const seatLayoutTemplate = generateSeatLayout(); // Helper util

        for (let d = 0; d < numDays; d++) {
            const currentDayBase = new Date(startDate.getTime() + d * 24 * 60 * 60 * 1000);
            for (const offset of showTimeOffsets) {
                const showTime = new Date(currentDayBase.getTime() + offset);
                newShows.push({
                    movieId: movie._id,
                    theater,
                    showTime,
                    seatLayout: seatLayoutTemplate, // We can reuse the JSON template in memory since mongoose auto-adds _ids later or we can JSON.parse/stringify
                    seatPricing,
                    totalSeats: seatLayoutTemplate.length,
                    availableSeats: seatLayoutTemplate.length,
                    isActive: true,
                    language,
                    format
                });
            }
        }

        // Since mongoose alters subdocument _ids, it's safer to clone the layout
        for (const ns of newShows) {
            ns.seatLayout = JSON.parse(JSON.stringify(seatLayoutTemplate));
        }

        await Show.insertMany(newShows);
        logger.info(`AI auto-scheduled ${newShows.length} shows for ${movie.title} across ${numDays} days`);

        res.status(200).json({ success: true, message: `Successfully auto-scheduled ${newShows.length} shows over ${numDays} days!`, data: newShows });
    } catch (error) {
        next(error);
    }
};

module.exports = { getSchedulingStatus, executeScheduling };
