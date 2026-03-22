import { CheckCircle, Calendar, Clock, MapPin, Ticket, QrCode } from 'lucide-react';

export default function BookingTicket({ booking }) {
    if (!booking) return null;
    const show = booking.showId;
    const movie = show?.movieId;

    return (
        <div style={{
            background: 'linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface2) 100%)',
            border: '1px solid var(--color-border)',
            borderRadius: 16, overflow: 'hidden', maxWidth: 480, margin: '0 auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #e50914, #b20710)', padding: '20px 24px', textAlign: 'center' }}>
                <CheckCircle size={40} color="white" style={{ marginBottom: 8 }} />
                <h2 style={{ color: 'white', fontWeight: 800, fontSize: 20, margin: 0 }}>Booking Confirmed!</h2>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, margin: '4px 0 0' }}>
                    Ref: {booking.bookingReference}
                </p>
            </div>

            {/* Movie info */}
            <div style={{ padding: '20px 24px', borderBottom: '1px dashed var(--color-border)' }}>
                <div style={{ display: 'flex', gap: 16 }}>
                    {movie?.poster && (
                        <img src={movie.poster} alt={movie.title} style={{ width: 70, height: 100, objectFit: 'cover', borderRadius: 8 }} />
                    )}
                    <div>
                        <h3 style={{ color: 'var(--color-text)', fontWeight: 700, fontSize: 17, margin: '0 0 8px' }}>{movie?.title}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, color: 'var(--color-muted)', fontSize: 13 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Calendar size={13} /> {show?.showTime ? new Date(show.showTime).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Clock size={13} /> {show?.showTime ? new Date(show.showTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-'}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <MapPin size={13} /> {show?.theater?.name}, {show?.theater?.city}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Seats */}
            <div style={{ padding: '16px 24px', borderBottom: '1px dashed var(--color-border)' }}>
                <p style={{ color: 'var(--color-muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Seats</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {booking.seats?.map((seat) => (
                        <span key={seat} style={{ background: 'rgba(229,9,20,0.15)', border: '1px solid rgba(229,9,20,0.4)', borderRadius: 6, padding: '4px 12px', color: '#e50914', fontWeight: 700, fontSize: 14 }}>
                            {seat}
                        </span>
                    ))}
                </div>
            </div>

            {/* Price + QR */}
            <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <p style={{ color: 'var(--color-muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 4px' }}>Total Paid</p>
                    <p style={{ color: 'var(--color-success)', fontWeight: 800, fontSize: 24, margin: 0 }}>₹{booking.totalPrice?.toFixed(2)}</p>
                </div>
                {booking.qrCode ? (
                    <img src={booking.qrCode} alt="QR Code" style={{ width: 90, height: 90, borderRadius: 8, border: '2px solid var(--color-border)' }} />
                ) : (
                    <div style={{ width: 90, height: 90, background: 'var(--color-surface)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-border)' }}>
                        <QrCode size={40} color="var(--color-muted)" />
                    </div>
                )}
            </div>

            {/* Footer */}
            <div style={{ background: 'var(--color-surface)', padding: '12px 24px', textAlign: 'center' }}>
                <p style={{ color: 'var(--color-muted)', fontSize: 11 }}>Please show this ticket at the entrance • CineBook</p>
            </div>
        </div>
    );
}
