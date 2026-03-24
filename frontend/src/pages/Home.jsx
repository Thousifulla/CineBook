import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { movieService } from '../services/index';
import { fetchMoviesStart, fetchMoviesSuccess, fetchMoviesFailure, fetchTrendingSuccess, setFilters } from '../redux/slices/movieSlice';
import MovieCard from '../components/MovieCard';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

const GENRES = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Thriller', 'Sci-Fi', 'Animation', 'Adventure'];
const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu', 'Malayalam', 'Kannada'];

export default function Home() {
    const dispatch = useDispatch();
    const { movies, trendingMovies, loading, pagination, filters } = useSelector((s) => s.movies);
    const [page, setPage] = useState(1);
    const [localSearch, setLocalSearch] = useState('');

    // Fetch trending
    useEffect(() => {
        movieService.getTrending().then((r) => dispatch(fetchTrendingSuccess(r.data.data))).catch(() => { });
    }, []);

    // Fetch movies with filters
    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(fetchMoviesStart());
            movieService.getAll({ ...filters, page, limit: 12 })
                .then((r) => dispatch(fetchMoviesSuccess(r.data)))
                .catch((e) => dispatch(fetchMoviesFailure(e.message)));
        }, 300);
        return () => clearTimeout(timer);
    }, [filters, page]);

    const handleSearch = (e) => {
        setLocalSearch(e.target.value);
        setPage(1);
        dispatch(setFilters({ search: e.target.value }));
    };

    const handleGenre = (genre) => {
        const current = filters.genre === genre ? '' : genre;
        dispatch(setFilters({ genre: current }));
        setPage(1);
    };

    const handleLanguage = (e) => {
        dispatch(setFilters({ language: e.target.value }));
        setPage(1);
    };

    return (
        <div>
            {/* Hero Banner */}
            {trendingMovies && trendingMovies[0] && (
                <div style={{
                    position: 'relative', height: 480, overflow: 'hidden',
                    backgroundImage: `url(${trendingMovies[0].poster})`,
                    backgroundSize: 'cover', backgroundPosition: 'center top',
                }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10,10,15,0.95) 0%, rgba(10,10,15,0.5) 60%, transparent 100%)' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--color-bg) 0%, transparent 40%)' }} />
                    <div className="page-container" style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
                        <div style={{ maxWidth: 520 }}>
                            <div style={{ background: 'rgba(229,9,20,0.2)', border: '1px solid rgba(229,9,20,0.4)', borderRadius: 20, padding: '4px 12px', display: 'inline-flex', marginBottom: 12 }}>
                                <span style={{ color: '#e50914', fontSize: 12, fontWeight: 700 }}>🔥 Trending Now</span>
                            </div>
                            <h1 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: 14 }}>
                                {trendingMovies[0].title}
                            </h1>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, lineHeight: 1.6, marginBottom: 20, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {trendingMovies[0].description}
                            </p>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <a href={`/movies/${trendingMovies[0]._id}`} className="btn-primary" style={{ textDecoration: 'none', fontSize: 15, padding: '10px 24px' }}>Book Now</a>
                                <a href={`/movies/${trendingMovies[0]._id}`} className="btn-secondary" style={{ textDecoration: 'none', fontSize: 15, padding: '10px 24px' }}>More Info</a>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="page-container" style={{ paddingTop: 32, paddingBottom: 48 }}>
                {/* Search + Filters */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 28, alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: '1 1 280px' }}>
                        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
                        <input
                            id="movie-search"
                            type="text"
                            className="input-field"
                            style={{ paddingLeft: 38 }}
                            placeholder="Search movies..."
                            value={localSearch}
                            onChange={handleSearch}
                        />
                    </div>
                    <select id="language-filter" className="input-field" style={{ width: 'auto', flex: '0 0 160px' }} value={filters.language} onChange={handleLanguage}>
                        <option value="">All Languages</option>
                        {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                </div>

                {/* Genre pills */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
                    {GENRES.map((g) => (
                        <button key={g} onClick={() => handleGenre(g)}
                            style={{
                                padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                background: filters.genre === g ? 'linear-gradient(135deg, #e50914, #b20710)' : 'transparent',
                                color: filters.genre === g ? 'white' : 'var(--color-muted)',
                                border: `1px solid ${filters.genre === g ? 'transparent' : 'var(--color-border)'}`,
                                transition: 'all 0.2s',
                            }}>
                            {g}
                        </button>
                    ))}
                </div>

                {/* Trending row */}
                {trendingMovies && trendingMovies.length > 0 && !filters.search && !filters.genre && (
                    <div style={{ marginBottom: 40 }}>
                        <h2 className="section-title">🔥 Trending Movies</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
                            {trendingMovies.slice(0, 5).map((movie) => <MovieCard key={movie._id} movie={movie} />)}
                        </div>
                    </div>
                )}

                {/* All movies */}
                <h2 className="section-title">{filters.search || filters.genre ? 'Search Results' : '🎬 Now Showing'}</h2>
                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
                        {Array(12).fill(0).map((_, i) => <MovieCard key={i} loading />)}
                    </div>
                ) : !movies || movies.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-muted)' }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>🎭</div>
                        <p style={{ fontSize: 16 }}>No movies found. Try a different search.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
                        {movies.map((movie) => <MovieCard key={movie._id} movie={movie} />)}
                    </div>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 40 }}>
                        <button className="btn-secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <ChevronLeft size={16} /> Prev
                        </button>
                        <span style={{ color: 'var(--color-muted)', fontSize: 14 }}>Page {page} of {pagination.pages}</span>
                        <button className="btn-secondary" onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 4 }}>
                            Next <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
