const { getRedis } = require('../config/redis');
const { getIO } = require('../config/socket');
const logger = require('../utils/logger');

const SEAT_LOCK_TTL = parseInt(process.env.SEAT_LOCK_TTL) || 300; // 5 minutes


/**
 * Lock seats in Redis for a user
 */
const lockSeats = async (showId, seats, userId) => {

    const redis = getRedis();
    const io = getIO();

    const lockedSeats = [];
    const failedSeats = [];

    for (const seatId of seats) {

        const key = `seat_lock:${showId}:${seatId}`;
        const existingLock = await redis.get(key);

        if (existingLock && existingLock !== userId.toString()) {
            failedSeats.push(seatId);
            continue;
        }

        // Atomic set if not exists
        const result = await redis.set(
            key,
            userId.toString(),
            'EX',
            SEAT_LOCK_TTL,
            'NX'
        );

        if (result === 'OK' || existingLock === userId.toString()) {

            // refresh TTL if same user already owns lock
            if (existingLock === userId.toString()) {
                await redis.expire(key, SEAT_LOCK_TTL);
            }

            lockedSeats.push(seatId);

        } else {
            failedSeats.push(seatId);
        }

    }


    if (lockedSeats.length > 0) {

        // Batch event
        io.to(`show_${showId}`).emit('seats_locked', {
            showId,
            seats: lockedSeats,
            userId,
            expiresIn: SEAT_LOCK_TTL,
        });

        // Individual seat events
        lockedSeats.forEach((seatId) => {
            io.to(`show_${showId}`).emit('seat_locked', {
                showId,
                seatId,
                userId,
                expiresIn: SEAT_LOCK_TTL
            });
        });

        logger.info(
            `Seats locked: ${lockedSeats.join(',')} for show ${showId} by user ${userId}`
        );
    }

    return { lockedSeats, failedSeats };

};



/**
 * Release seat locks after payment failure or cancellation
 */
const releaseSeats = async (showId, seats, userId) => {

    const redis = getRedis();
    const io = getIO();

    const releasedSeats = [];

    for (const seatId of seats) {

        const key = `seat_lock:${showId}:${seatId}`;
        const existingLock = await redis.get(key);

        // Only release if lock belongs to this user
        if (existingLock === userId.toString()) {

            await redis.del(key);
            releasedSeats.push(seatId);

        }

    }


    if (releasedSeats.length > 0) {

        // Batch release event
        io.to(`show_${showId}`).emit('seats_released', {
            showId,
            seats: releasedSeats,
        });

        // Individual seat unlock events
        releasedSeats.forEach((seatId) => {
            io.to(`show_${showId}`).emit('seat_unlocked', {
                showId,
                seatId
            });
        });

        logger.info(
            `Seats released: ${releasedSeats.join(',')} for show ${showId}`
        );
    }

    return releasedSeats;

};



/**
 * Check if specific seats are locked
 */
const checkSeatsLocked = async (showId, seats) => {

    const redis = getRedis();
    const lockedInfo = {};

    for (const seatId of seats) {

        const key = `seat_lock:${showId}:${seatId}`;
        const lockedBy = await redis.get(key);
        const ttl = await redis.ttl(key);

        if (lockedBy) {
            lockedInfo[seatId] = {
                lockedBy,
                ttl
            };
        }

    }

    return lockedInfo;

};



/**
 * Get all locked seats for a show
 */
const getAllLockedSeats = async (showId) => {

    const redis = getRedis();
    const pattern = `seat_lock:${showId}:*`;

    const keys = await redis.keys(pattern);

    const lockedSeats = {};

    for (const key of keys) {

        const seatId = key.split(':')[2];

        const userId = await redis.get(key);
        const ttl = await redis.ttl(key);

        lockedSeats[seatId] = {
            userId,
            ttl
        };

    }

    return lockedSeats;

};



/**
 * Force release all locks (Admin)
 */
const releaseAllShowLocks = async (showId) => {

    const redis = getRedis();
    const pattern = `seat_lock:${showId}:*`;

    const keys = await redis.keys(pattern);

    if (keys.length > 0) {
        await redis.del(...keys);
    }

    return keys.length;

};



module.exports = {
    lockSeats,
    releaseSeats,
    checkSeatsLocked,
    getAllLockedSeats,
    releaseAllShowLocks,
};