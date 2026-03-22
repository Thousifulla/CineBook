import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { socket } from '../socket';

import { showService, bookingService } from '../services/index';
import { setLockedSeats, addLockedSeats, removeLockedSeats, resetSeatState } from '../redux/slices/seatSlice';
import { setCheckoutData } from '../redux/slices/bookingSlice';

import SeatMap from '../components/SeatMap';

import { MapPin, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SeatSelection() {

    const { showId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { selectedSeats } = useSelector((s) => s.seats);
    const { user } = useSelector((s) => s.auth);

    const [show, setShow] = useState(null);
    const [loading, setLoading] = useState(true);
    const [locking, setLocking] = useState(false);
    const [lockTimer, setLockTimer] = useState(null);

    const socketRef = useRef(socket);

    useEffect(() => {

        dispatch(resetSeatState());

        // Fetch show
        showService.getById(showId)
            .then((r) => {

                setShow(r.data.data);
                dispatch(setLockedSeats(r.data.data.lockedSeats || {}));

            })
            .catch(() => toast.error('Show not found'))
            .finally(() => setLoading(false));


        // Join show socket room
        socketRef.current.emit('join_show', showId);


        // Batch seat lock event
        socketRef.current.on('seats_locked', ({ seats, userId, expiresIn }) => {

            dispatch(addLockedSeats({
                seats,
                userId,
                ttl: expiresIn
            }));

            if (userId !== user?._id) {
                toast(`Seats ${seats.join(',')} locked by another user`, { icon: '🔒' });
            }

        });


        // Single seat lock event
        socketRef.current.on('seat_locked', ({ seatId, userId, expiresIn }) => {

            dispatch(addLockedSeats({
                seats: [seatId],
                userId,
                ttl: expiresIn
            }));

        });


        // Batch release event
        socketRef.current.on('seats_released', ({ seats }) => {

            dispatch(removeLockedSeats(seats));

        });


        // Single release event
        socketRef.current.on('seat_unlocked', ({ seatId }) => {

            dispatch(removeLockedSeats([seatId]));

        });


        return () => {

            socketRef.current.emit('leave_show', showId);

            socketRef.current.off('seats_locked');
            socketRef.current.off('seat_locked');
            socketRef.current.off('seats_released');
            socketRef.current.off('seat_unlocked');

            dispatch(resetSeatState());

        };

    }, [showId, dispatch, user?._id]);


    // Countdown timer
    useEffect(() => {

        if (!lockTimer) return;

        const interval = setInterval(() => {

            setLockTimer((prev) => {

                if (prev <= 1) {

                    clearInterval(interval);
                    toast.error("Seat lock expired");
                    return null;

                }

                return prev - 1;

            });

        }, 1000);

        return () => clearInterval(interval);

    }, [lockTimer]);


    const totalPrice = () => {

        if (!show) return 0;

        return selectedSeats.reduce((sum, seatId) => {

            const seat = show.seatLayout?.find((s) => s.seatId === seatId);

            if (!seat) return sum;

            return sum + (show.seatPricing?.[seat.type] || 0);

        }, 0);

    };


    const handleConfirmSeats = async () => {

        if (selectedSeats.length === 0) {
            return toast.error('Please select at least one seat');
        }

        setLocking(true);

        try {

            const res = await bookingService.lockSeats({
                showId,
                seats: selectedSeats
            });

            dispatch(
                setCheckoutData({
                    seatDetails: res.data.data.seatDetails,
                    totalPrice: res.data.data.totalPrice,
                    bookingId: null,
                    razorpayOrderId: null,
                })
            );

            const ttl = res.data.data.lockTTL || 120;
            setLockTimer(ttl);

            toast.success(`Seats locked! You have ${ttl} seconds.`);

            navigate(`/booking-summary/${showId}`);

        } catch (err) {

            toast.error(err.message || 'Failed to lock seats');

        } finally {

            setLocking(false);

        }

    };


    if (loading) {

        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <div style={{
                    width: 40,
                    height: 40,
                    border: '3px solid var(--color-border)',
                    borderTopColor: '#e50914',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }} />
            </div>
        );

    }


    if (!show) return null;

    const movie = show.movieId;


    return (

        <div className="page-container" style={{ paddingTop: 32, paddingBottom: 48 }}>

            {/* Show Info Header */}
            <div className="glass" style={{
                borderRadius: 14,
                padding: '16px 24px',
                marginBottom: 28,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 16,
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>

                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>

                    {movie?.poster && (
                        <img
                            src={movie.poster}
                            alt={movie.title}
                            style={{
                                width: 48,
                                height: 68,
                                borderRadius: 6,
                                objectFit: 'cover'
                            }}
                        />
                    )}

                    <div>

                        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>
                            {movie?.title}
                        </h2>

                        <div style={{ display: 'flex', gap: 12, fontSize: 13 }}>

                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <MapPin size={13} />
                                {show.theater?.name}, {show.theater?.city}
                            </span>

                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Clock size={13} />
                                {new Date(show.showTime).toLocaleDateString('en-IN')} ·
                                {new Date(show.showTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </span>

                        </div>

                    </div>

                </div>

            </div>


            {/* Seat Map */}
            <div className="glass" style={{ borderRadius: 16, padding: '28px 16px', marginBottom: 20 }}>
                <SeatMap show={show} />
            </div>


            {/* Booking Bar */}
            <div className="glass" style={{
                borderRadius: 14,
                padding: '16px 24px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 16,
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>

                <div>

                    {selectedSeats.length === 0 ? (
                        <p>Select seats to continue</p>
                    ) : (
                        <>
                            <p style={{ fontWeight: 700 }}>
                                {selectedSeats.length} seat selected: {selectedSeats.join(', ')}
                            </p>

                            <p style={{ fontWeight: 800 }}>
                                Total: ₹{totalPrice()}
                            </p>
                        </>
                    )}

                    {lockTimer && (
                        <p style={{ color: 'orange', fontWeight: 600 }}>
                            Seat lock expires in {lockTimer}s
                        </p>
                    )}

                </div>


                <button
                    className="btn-primary"
                    onClick={handleConfirmSeats}
                    disabled={selectedSeats.length === 0 || locking}
                >
                    {locking ? 'Locking seats...' : `Proceed to Pay · ₹${totalPrice()}`}
                </button>

            </div>


            {selectedSeats.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 13 }}>
                    <AlertCircle size={14} />
                    <span>
                        Seats will be locked temporarily. Complete payment to confirm booking.
                    </span>
                </div>
            )}

        </div>
    );
}