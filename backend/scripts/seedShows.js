/**
 * Seed script — creates test shows for all active movies.
 * Run with: node backend/scripts/seedShows.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const Show = require('../models/Show');

const THEATERS = [
    { name: 'PVR Cinemas', location: 'Phoenix Mall', city: 'Chennai', screen: 'Audi 1' },
    { name: 'INOX Multiplex', location: 'Express Mall', city: 'Chennai', screen: 'Screen 3' },
    { name: 'Cinepolis', location: 'Forum Mall', city: 'Bangalore', screen: 'Hall A' },
    { name: 'SPI Cinemas', location: 'Villivakkam', city: 'Chennai', screen: 'Audi 2' },
];

const FORMATS = ['2D', '3D', 'IMAX'];
const LANGUAGES = ['Tamil', 'English', 'Hindi'];

function daysFromNow(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
}

function showAt(baseDate, hours, minutes = 0) {
    const d = new Date(baseDate);
    d.setHours(hours, minutes, 0, 0);
    return d;
}

async function seed() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const movies = await Movie.find({ isActive: true }).limit(5).lean();
    if (!movies.length) {
        console.log('❌ No active movies found. Add movies first via the admin panel (or TMDB fetch).');
        process.exit(1);
    }

    console.log(`🎬 Found ${movies.length} active movies. Creating shows...`);

    let created = 0;
    for (const movie of movies) {
        const theater = THEATERS[Math.floor(Math.random() * THEATERS.length)];
        const format = FORMATS[Math.floor(Math.random() * FORMATS.length)];
        const language = LANGUAGES[Math.floor(Math.random() * LANGUAGES.length)];

        // Create 3 shows per movie — today, tomorrow, day after
        for (let day = 0; day <= 2; day++) {
            const base = daysFromNow(day);
            const showTimes = [10, 14, 18, 21]; // 10am, 2pm, 6pm, 9pm
            for (const hour of showTimes.slice(0, 2)) { // 2 shows per day
                const exists = await Show.findOne({
                    movieId: movie._id,
                    'theater.name': theater.name,
                    showTime: showAt(base, hour),
                });
                if (exists) continue;

                await Show.create({
                    movieId: movie._id,
                    theater,
                    showTime: showAt(base, hour),
                    format,
                    language,
                    seatPricing: { vip: 400, premium: 300, regular: 200 },
                    isActive: true,
                });
                created++;
            }
        }
    }

    console.log(`✅ Created ${created} shows successfully!`);
    process.exit(0);
}

seed().catch((err) => {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
});
