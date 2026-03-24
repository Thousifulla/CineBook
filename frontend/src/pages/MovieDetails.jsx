import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Clock, Calendar, Globe, Play, ChevronDown, MapPin } from 'lucide-react';
import { movieService, showService } from '../services/index';
import { useDispatch } from 'react-redux';
import { setSelectedShow } from '../redux/slices/bookingSlice';
import toast from 'react-hot-toast';

function ShowCard({ show, onSelect }) {
    return (
        <button onClick={() => onSelect(show)}
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '14px 18px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', width: '100%' }}
            onMouseOver={e => { e.currentTarget.style.borderColor = '#e50914'; e.currentTarget.style.background = 'rgba(229,9,20,0.05)'; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'var(--color-surface)'; }}>
            <p style={{ color: 'var(--color-text)', fontWeight: 700, fontSize: 16, margin: '0 0 4px' }}>
                {new Date(show.showTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p style={{ color: 'var(--color-muted)', fontSize: 12, margin: '0 0 8px' }}>{show.format} · {show.language}</p>
            <div style={{ display: 'flex', gap: 10, fontSize: 12 }}>
                <span style={{ color: '#f5c518' }}>VIP ₹{show.seatPricing?.vip}</span>
                <span style={{ color: '#a855f7' }}>Premium ₹{show.seatPricing?.premium}</span>
                <span style={{ color: '#3b82f6' }}>Regular ₹{show.seatPricing?.regular}</span>
            </div>
            <p style={{ color: 'var(--color-success)', fontSize: 12, margin: '6px 0 0' }}>
                {show.availableSeats} seats available
            </p>
        </button>
    );
}

export default function MovieDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [movie, setMovie] = useState(null);
    const [shows, setShows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTrailer, setShowTrailer] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedCity, setSelectedCity] = useState('');

    useEffect(() => {
        movieService.getById(id).then((r) => setMovie(r.data.data)).catch(() => toast.error('Movie not found')).finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        if (!id) return;
        showService.getByMovie(id, { date: selectedDate, city: selectedCity })
            .then((r) => setShows(r.data.data))
            .catch(() => { });
    }, [id, selectedDate, selectedCity]);

    const handleSelectShow = (show) => {
        dispatch(setSelectedShow(show));
        navigate(`/shows/${show._id}/seats`);
    };

    if (loading) {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: 'var(--color-muted)' }}>
                    <div style={{ width: 48, height: 48, border: '4px solid var(--color-border)', borderTopColor: '#e50914', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                    <p>Loading movie...</p>
                </div>
            </div>
        );
    }

    if (!movie) return <div style={{ textAlign: 'center', padding: 80, color: 'var(--color-muted)' }}>Movie not found</div>;

    const trailerId = movie.trailer?.includes('embed') ? movie.trailer.split('/').pop() : null;

    return (
        <div>
            {/* Backdrop + hero */}
            <div style={{ position: 'relative', height: 420, overflow: 'hidden', backgroundImage: `url(${movie.poster})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10,10,15,0.98) 0%, rgba(10,10,15,0.7) 50%, rgba(10,10,15,0.3) 100%)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--color-bg) 0%, transparent 40%)' }} />
            </div>

            <div className="page-container" style={{ marginTop: -260, position: 'relative', zIndex: 1, paddingBottom: 48 }}>
                <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginBottom: 40 }}>
                    {/* Poster */}
                    <div style={{ flexShrink: 0 }}>
                        <img src={movie.poster} alt={movie.title}
                            style={{ width: 180, borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.6)', border: '2px solid var(--color-border)', display: 'block' }}
                            onError={(e) => { e.target.style.display = 'none'; }} />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 280 }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                            {movie.genre?.map((g) => (
                                <span key={g} style={{ background: 'rgba(229,9,20,0.15)', border: '1px solid rgba(229,9,20,0.3)', borderRadius: 20, padding: '3px 12px', color: '#ff6b35', fontSize: 12, fontWeight: 600 }}>{g}</span>
                            ))}
                        </div>
                        <h1 style={{ fontSize: 'clamp(24px, 3.5vw, 40px)', fontWeight: 900, color: 'white', margin: '0 0 12px', lineHeight: 1.1 }}>{movie.title}</h1>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, color: 'var(--color-muted)', fontSize: 14, marginBottom: 16 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Star size={15} fill="#f5c518" color="#f5c518" /><span style={{ color: '#f5c518', fontWeight: 700 }}>{movie.rating?.toFixed(1)}</span>
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={14} /> {movie.duration} min</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={14} /> {movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Globe size={14} /> {movie.language?.join(', ')}</span>
                        </div>

                        <p style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, fontSize: 15, marginBottom: 20, maxWidth: 600 }}>{movie.description}</p>

                        {movie.trailer && (
                            <button onClick={() => setShowTrailer(!showTrailer)} className="btn-secondary"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 20px', fontSize: 14 }}>
                                <Play size={16} fill="currentColor" /> {showTrailer ? 'Hide Trailer' : 'Watch Trailer'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Trailer embed */}
                {showTrailer && movie.trailer && (
                    <div style={{ marginBottom: 40, borderRadius: 14, overflow: 'hidden', maxWidth: 700, aspectRatio: '16/9', border: '1px solid var(--color-border)' }}>
                        <iframe src={movie.trailer} width="100%" height="100%" frameBorder="0" allowFullScreen title="Trailer"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" style={{ display: 'block' }} />
                    </div>
                )}

                {/* Cast */}
                {movie.cast?.length > 0 && (
                    <div style={{ marginBottom: 40 }}>
                        <h2 className="section-title">Cast</h2>
                        <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>
                            {movie.cast.slice(0, 8).map((actor, i) => (
                                <div key={i} style={{ flexShrink: 0, textAlign: 'center', width: 80 }}>
                                    <div style={{ width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 6px', border: '2px solid var(--color-border)', background: 'var(--color-surface)' }}>
                                        {actor.photo ? <img src={actor.photo} alt={actor.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                                            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'var(--color-muted)' }}>{actor.name?.[0]}</div>}
                                    </div>
                                    <p style={{ color: 'var(--color-text)', fontSize: 11, fontWeight: 600, margin: 0 }}>{actor.name}</p>
                                    <p style={{ color: 'var(--color-muted)', fontSize: 10, margin: 0 }}>{actor.character}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Show timings */}
                <div>
                    <h2 className="section-title">Book Tickets</h2>
                    {movie.isBookingOpen ? (
                        <>
                            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                                <input type="date" className="input-field" style={{ width: 'auto' }} value={selectedDate} min={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => setSelectedDate(e.target.value)} />
                                <input type="text" className="input-field" style={{ width: 'auto' }} placeholder="Filter by city..." value={selectedCity}
                                    onChange={(e) => setSelectedCity(e.target.value)} />
                            </div>

                            {shows.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-muted)', background: 'var(--color-surface)', borderRadius: 12, border: '1px solid var(--color-border)' }}>
                                    <Calendar size={36} style={{ marginBottom: 12, opacity: 0.5 }} />
                                    <p>No shows available for this date. Try a different date.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                                    {shows.map((show) => <ShowCard key={show._id} show={show} onSelect={handleSelectShow} />)}
                                </div>
                            )}
                        </>
                    ) : (
                        <div style={{ padding: '40px 0', textAlign: 'center', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12 }}>
                            <Calendar size={36} color="var(--color-muted)" style={{ marginBottom: 12, opacity: 0.6 }} />
                            <h3 style={{ margin: '0 0 8px', color: 'var(--color-text)', fontSize: 18 }}>Bookings Not Yet Open</h3>
                            <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: 14 }}>Seat booking for this movie is currently closed. Please check back later.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
