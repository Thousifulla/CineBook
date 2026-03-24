require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const Redis = require('ioredis');

const clearDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
        
        const models = ['Movie', 'Show', 'Booking', 'AISuggestion', 'SeatAnalytics'];
        for (const modelName of models) {
            try {
                const Model = require('./models/' + modelName);
                await Model.deleteMany({});
                console.log(`Cleared ${modelName} collection`);
            } catch (err) {
                console.log(`Failed to clear ${modelName}:`, err.message);
            }
        }
        
        // Using ioredis since it's in package.json dependencies and redis url is in .env
        if (process.env.REDIS_URL) {
            const redis = new Redis(process.env.REDIS_URL);
            await redis.flushall();
            console.log('Redis Cache Cleared');
            redis.quit();
        }

        console.log('Database clearance complete (Users intact).');
        process.exit(0);
    } catch (error) {
        console.error('Error clearing DB:', error);
        process.exit(1);
    }
}
clearDB();
