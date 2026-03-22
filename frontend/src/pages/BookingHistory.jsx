import { useEffect, useState } from 'react';
import { bookingService } from '../services/index';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, Ticket, ChevronRight } from 'lucide-react';

const STATUS_COLORS = {
    completed: { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)', text: '#22c55e' },
    pending: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', text: '#f59e0b' },
    failed: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', text: '#ef4444' },
    cancelled: { bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.3)', text: '#6b7280' },
};

export default function BookingHistory() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});

    useEffect(() => {
        setLoading(true);
        bookingService.getMyBookings({ page, limit: 10 })
            .then((r) => { setBookings(r.data.data); setPagination(r.data.pagination); })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [page]);

    return (
        <div className="page-container" style={{ paddingTop: 32, paddingBottom: 48 }}>
            <h1 style={{ fontWeight: 800, fontSize: 26, marginBottom: 28 }}>My Bookings</h1>

            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="skeleton" style={{ height: 120, borderRadius: 12 }} />
                    ))}
                </div>
            ) : bookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-muted)' }}>
                    <Ticket size={56} style={{ opacity: 0.3, marginBottom: 16 }} />
                    <h2 style={{ fontWeight: 700, marginBottom: 8 }}>No bookings yet</h2>
                    <p style={{ marginBottom: 24 }}>Book your first movie and it'll appear here!</p>
                    <Link to="/" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block', padding: '10px 24px' }}>Browse Movies</Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {bookings.map((booking) => {
                        const show = booking.showId;
                        const movie = show?.movieId;
                        const statusCfg = STATUS_COLORS[booking.paymentStatus] || STATUS_COLORS.pending;
                        return (
                            <Link key={booking._id} to={`/booking-confirmed/${booking._id}`} style={{ textDecoration: 'none' }}>
                                <div className="glass card-hover" style={{ borderRadius: 14, padding: '16px 20px', display: 'flex', gap: 16, alignItems: 'center' }}>
                                    {movie?.poster && <img src={movie.poster} alt={movie.title} style={{ width: 56, height: 78, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
                                            <h3 style={{ color: 'var(--color-text)', fontWeight: 700, fontSize: 16, margin: 0 }}>{movie?.title || 'Movie'}</h3>
                                            <span style={{ background: statusCfg.bg, border: `1px solid ${statusCfg.border}`, borderRadius: 20, padding: '2px 10px', color: statusCfg.text, fontSize: 11, fontWeight: 700, textTransform: 'capitalize' }}>
                                                {booking.paymentStatus}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, color: 'var(--color-muted)', fontSize: 13 }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} /> {show?.showTime ? new Date(show.showTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {show?.showTime ? new Date(show.showTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {show?.theater?.name}, {show?.theater?.city}</span>
                                            <span><Ticket size={12} style={{ marginRight: 4 }} />{booking.seats?.join(', ')}</span>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        <p style={{ color: 'var(--color-success)', fontWeight: 800, fontSize: 18, margin: '0 0 4px' }}>₹{booking.totalPrice}</p>
                                        <p style={{ color: 'var(--color-muted)', fontSize: 11, margin: 0 }}>Ref: {booking.bookingReference}</p>
                                        <ChevronRight size={18} color="var(--color-muted)" style={{ marginTop: 4 }} />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

            {pagination.pages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 32 }}>
                    <button className="btn-secondary" disabled={page === 1} onClick={() => setPage((p) => p - 1)} style={{ padding: '8px 18px' }}>← Prev</button>
                    <span style={{ lineHeight: '36px', color: 'var(--color-muted)', fontSize: 14 }}>Page {page} of {pagination.pages}</span>
                    <button className="btn-secondary" disabled={page === pagination.pages} onClick={() => setPage((p) => p + 1)} style={{ padding: '8px 18px' }}>Next →</button>
                </div>
            )}
        </div>
    );
}
