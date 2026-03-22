import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { showService, bookingService, paymentService } from '../services/index';
import { MapPin, Clock, CreditCard, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BookingSummary() {
    const { showId } = useParams();
    const navigate = useNavigate();
    const { seatDetails, totalPrice } = useSelector((s) => s.booking);
    const { user } = useSelector((s) => s.auth);
    const [show, setShow] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        showService.getById(showId).then((r) => setShow(r.data.data)).catch(() => navigate('/'));
    }, [showId]);

    const convenience = Math.round(totalPrice * 0.02);
    const grandTotal = totalPrice + convenience;
    
    // Derived selected seats list for display/api
    const selectedSeatIds = seatDetails.map(s => s.seatId);

    const handlePayment = async () => {
        if (selectedSeatIds.length === 0) return navigate(`/shows/${showId}/seats`);
        setLoading(true);
        try {
            // Create booking record
            const bookingRes = await bookingService.create({ showId, seats: selectedSeatIds, seatDetails, totalPrice: grandTotal });
            const bookingId = bookingRes.data.data.bookingId;

            // Create payment order
            const orderRes = await paymentService.createOrder({ bookingId, amount: grandTotal });
            const orderData = orderRes.data.data;

            // Launch Razorpay checkout
            const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || orderData.keyId;
            const options = {
                key: razorpayKey,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'CineBook',
                description: `${show?.movieId?.title || 'Movie'} - ${selectedSeatIds.join(', ')}`,
                order_id: orderData.orderId,
                prefill: orderData.prefill,
                theme: { color: '#e50914' },
                modal: {
                    ondismiss: async () => {
                        await bookingService.release(bookingId).catch(() => { });
                        toast.error('Payment cancelled. Seats released.');
                    },
                },
                handler: async (response) => {
                    try {
                        const verifyRes = await paymentService.verify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            bookingId,
                        });
                        toast.success('Payment successful! 🎉');
                        navigate(`/booking-confirmed/${bookingId}`);
                    } catch (err) {
                        toast.error('Payment verification failed. Please contact support.');
                    }
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            toast.error(err.message || 'Failed to initiate payment');
        } finally {
            setLoading(false);
        }
    };

    if (!show) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div style={{ width: 40, height: 40, border: '3px solid var(--color-border)', borderTopColor: '#e50914', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>;

    const movie = show.movieId;

    return (
        <div className="page-container" style={{ paddingTop: 32, paddingBottom: 48, maxWidth: 720 }}>
            <h1 style={{ fontWeight: 800, fontSize: 26, marginBottom: 24 }}>Booking Summary</h1>

            {/* Movie info */}
            <div className="glass" style={{ borderRadius: 14, padding: '20px 24px', marginBottom: 20, display: 'flex', gap: 16 }}>
                {movie?.poster && <img src={movie.poster} alt={movie.title} style={{ width: 64, height: 90, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />}
                <div>
                    <h2 style={{ fontWeight: 800, fontSize: 18, margin: '0 0 8px' }}>{movie?.title}</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, color: 'var(--color-muted)', fontSize: 13 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <MapPin size={13} /> {show.theater?.name}, {show.theater?.screen} · {show.theater?.city}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Clock size={13} /> {new Date(show.showTime).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} · {new Date(show.showTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span style={{ color: '#6b7280', fontSize: 12 }}>{show.format} · {show.language}</span>
                    </div>
                </div>
            </div>

            {/* Seat breakdown */}
            <div className="glass" style={{ borderRadius: 14, padding: '20px 24px', marginBottom: 20 }}>
                <h3 style={{ fontWeight: 700, fontSize: 15, margin: '0 0 16px' }}>Selected Seats</h3>
                {seatDetails.map((seat) => (
                    <div key={seat.seatId} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                        <div>
                            <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>{seat.seatId}</span>
                            <span style={{ color: 'var(--color-muted)', fontSize: 12, marginLeft: 8, textTransform: 'capitalize' }}>({seat.type})</span>
                        </div>
                        <span style={{ color: 'var(--color-text)', fontWeight: 700 }}>₹{seat.price}</span>
                    </div>
                ))}

                <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--color-border)' }}>
                    {[
                        { label: 'Subtotal', value: totalPrice },
                        { label: 'Convenience Fee (2%)', value: convenience },
                    ].map(({ label, value }) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: 'var(--color-muted)', fontSize: 14 }}>
                            <span>{label}</span><span>₹{value}</span>
                        </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px dashed var(--color-border)', color: 'var(--color-text)', fontWeight: 800, fontSize: 18 }}>
                        <span>Total</span><span style={{ color: 'var(--color-success)' }}>₹{grandTotal}</span>
                    </div>
                </div>
            </div>

            {/* Security note */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-muted)', fontSize: 13, marginBottom: 20, background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10, padding: '10px 14px' }}>
                <ShieldCheck size={18} color="#22c55e" />
                <span>Your payment is secured by Razorpay. We do not store card details.</span>
            </div>

            <button className="btn-primary" onClick={handlePayment} disabled={loading}
                style={{ width: '100%', padding: '14px', fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <CreditCard size={20} /> {loading ? 'Initiating Payment...' : `Pay ₹${grandTotal} · ${seatDetails.length} Seat${seatDetails.length > 1 ? 's' : ''}`}
            </button>
        </div>
    );
}
