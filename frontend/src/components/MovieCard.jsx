import { Star, Clock, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MovieCard({ movie, loading }) {
    if (loading) {
        return (
            <div className="skeleton" style={{ borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ height: 300 }} className="skeleton" />
                <div style={{ padding: '12px 0' }}>
                    <div className="skeleton" style={{ height: 18, marginBottom: 8, borderRadius: 4 }} />
                    <div className="skeleton" style={{ height: 14, width: '60%', borderRadius: 4 }} />
                </div>
            </div>
        );
    }

    const poster = movie?.poster
        ? movie.poster
        : `https://via.placeholder.com/300x450/1a1a2e/e50914?text=${encodeURIComponent(movie?.title || 'Movie')}`;

    return (
        <Link to={`/movies/${movie._id}`} style={{ textDecoration: 'none', display: 'block' }}>
            <div className="card-hover" style={{ borderRadius: 12, overflow: 'hidden', background: 'var(--color-surface)', border: '1px solid var(--color-border)', cursor: 'pointer' }}>
                {/* Poster */}
                <div style={{ position: 'relative', paddingTop: '150%', overflow: 'hidden' }}>
                    <img
                        src={poster}
                        alt={movie.title}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                        onError={(e) => { e.target.src = `https://via.placeholder.com/300x450/1a1a2e/e50914?text=No+Image`; }}
                    />
                    {/* Rating badge */}
                    <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.8)', borderRadius: 6, padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Star size={12} fill="#f5c518" color="#f5c518" />
                        <span style={{ color: '#f5c518', fontSize: 12, fontWeight: 700 }}>{movie.rating?.toFixed(1) || 'N/A'}</span>
                    </div>
                    {/* Genre tag */}
                    {movie.genre?.[0] && (
                        <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(229,9,20,0.85)', borderRadius: 4, padding: '2px 8px' }}>
                            <span style={{ color: 'white', fontSize: 11, fontWeight: 600 }}>{movie.genre[0]}</span>
                        </div>
                    )}
                    {/* Upcoming tag */}
                    {movie.isUpcoming && (
                        <div style={{ position: 'absolute', top: 10, left: 10, background: 'linear-gradient(135deg,#f59e0b,#d97706)', borderRadius: 4, padding: '2px 8px' }}>
                            <span style={{ color: 'white', fontSize: 11, fontWeight: 700 }}>Upcoming</span>
                        </div>
                    )}
                </div>

                {/* Info */}
                <div style={{ padding: '12px 14px 14px' }}>
                    <h3 style={{ color: 'var(--color-text)', fontWeight: 700, fontSize: 15, margin: 0, marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {movie.title}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--color-muted)', fontSize: 12 }}>
                        {movie.duration && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Clock size={11} /> {movie.duration}m
                            </span>
                        )}
                        {movie.releaseDate && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Calendar size={11} /> {new Date(movie.releaseDate).getFullYear()}
                            </span>
                        )}
                    </div>
                    <div style={{ marginTop: 10 }}>
                        <button className="btn-primary" style={{ width: '100%', padding: '8px', fontSize: 13 }}>
                            Book Now
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
}
