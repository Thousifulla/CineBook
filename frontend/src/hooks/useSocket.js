import { useEffect, useRef } from 'react';
import { socket } from '../socket';

/**
 * Custom hook to manage socket.io connection for a specific show room.
 * Handles join/leave automatically on mount/unmount.
 *
 * @param {string} showId - The show ID to join/leave
 * @param {Object} handlers - Event handlers: { onSeatsLocked, onSeatLocked, onSeatsReleased, onSeatUnlocked }
 */
export default function useSocket(showId, handlers = {}) {
    const socketRef = useRef(socket);

    useEffect(() => {
        if (!showId) return;
        const s = socketRef.current;

        s.emit('join_show', showId);

        if (handlers.onSeatsLocked) s.on('seats_locked', handlers.onSeatsLocked);
        if (handlers.onSeatLocked) s.on('seat_locked', handlers.onSeatLocked);
        if (handlers.onSeatsReleased) s.on('seats_released', handlers.onSeatsReleased);
        if (handlers.onSeatUnlocked) s.on('seat_unlocked', handlers.onSeatUnlocked);

        return () => {
            s.emit('leave_show', showId);
            s.off('seats_locked');
            s.off('seat_locked');
            s.off('seats_released');
            s.off('seat_unlocked');
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showId]);

    return socketRef.current;
}
