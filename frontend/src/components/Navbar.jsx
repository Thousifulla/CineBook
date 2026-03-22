import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { Film, LogOut, Search, X } from 'lucide-react';
import { movieService } from '../services';

export default function Navbar() {
    const { isAuthenticated, user } = useSelector((s) => s.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef(null);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const navLinkStyle = (path) => ({
        color: location.pathname === path ? 'var(--color-text)' : 'var(--color-muted)',
        textDecoration: 'none',
        fontSize: 14,
        fontWeight: 500,
        paddingBottom: 4,
        borderBottom: location.pathname === path ? '2px solid #e50914' : '2px solid transparent',
        transition: 'color 0.2s, border-color 0.2s',
    });

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Search effect with debounce
    useEffect(() => {
        if (searchQuery.trim().length < 2) {
            setSearchResults([]);
            return;
        }

        const timeoutId = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await movieService.search(searchQuery);
                setSearchResults(res.data.data || []);
                setShowDropdown(true);
            } catch (err) {
                console.error("Search failed:", err);
            } finally {
                setIsSearching(false);
            }
        }, 400); // 400ms debounce

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);


    return (
        <nav style={{ background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, zIndex: 100 }}>
            <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
                
                {/* Left Section: Logo & Links */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                    {/* Logo */}
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                        <div style={{ background: 'linear-gradient(135deg, #e50914, #ff6b35)', borderRadius: 8, padding: 6, display: 'flex' }}>
                            <Film size={22} color="white" />
                        </div>
                        <span style={{ fontWeight: 800, fontSize: 20, background: 'linear-gradient(135deg, #e50914, #ff6b35)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            CineBook
                        </span>
                    </Link>

                    {/* Desktop links */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24, paddingLeft: 12 }}>
                        <Link to="/" style={navLinkStyle('/')}>Movies</Link>
                        {isAuthenticated && (
                            <>
                                <Link to="/bookings" style={navLinkStyle('/bookings')}>My Bookings</Link>
                                <Link to="/dashboard" style={navLinkStyle('/dashboard')}>Dashboard</Link>
                                {user?.role === 'admin' && (
                                    <Link to="/admin" style={{
                                        ...navLinkStyle('/admin'),
                                        color: location.pathname.startsWith('/admin') ? '#f5c518' : 'var(--color-gold)',
                                        borderBottomColor: location.pathname.startsWith('/admin') ? '#f5c518' : 'transparent',
                                        fontWeight: 600,
                                    }}>
                                        ⭐ Admin
                                    </Link>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Right Section: Search & Auth */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    
                    {/* Search Bar */}
                    <div ref={searchRef} style={{ position: 'relative' }}>
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            background: 'rgba(255,255,255,0.05)', 
                            border: '1px solid var(--color-border)', 
                            borderRadius: '20px', 
                            padding: '6px 14px',
                            minWidth: '220px',
                            transition: 'all 0.2s',
                            ...(searchQuery ? { borderColor: '#e50914', background: 'rgba(229,9,20,0.05)' } : {})
                        }}>
                            <Search size={16} color="var(--color-muted)" style={{ marginRight: 8 }} />
                            <input
                                type="text"
                                placeholder="Search movies..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    if(e.target.value.length >= 2) setShowDropdown(true);
                                }}
                                onFocus={() => { if(searchResults.length > 0) setShowDropdown(true); }}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--color-text)',
                                    fontSize: 13,
                                    outline: 'none',
                                    width: '100%',
                                }}
                            />
                            {searchQuery && (
                                <X 
                                    size={14} 
                                    color="var(--color-muted)" 
                                    style={{ cursor: 'pointer', marginLeft: 6 }} 
                                    onClick={() => { setSearchQuery(''); setSearchResults([]); setShowDropdown(false); }}
                                />
                            )}
                        </div>

                        {/* Search Dropdown */}
                        {showDropdown && searchQuery.length >= 2 && (
                            <div style={{
                                position: 'absolute',
                                top: 'calc(100% + 8px)',
                                right: 0,
                                width: '300px',
                                background: '#13131a',
                                border: '1px solid var(--color-border)',
                                borderRadius: 12,
                                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                overflow: 'hidden',
                                zIndex: 1000,
                            }}>
                                {isSearching ? (
                                    <div style={{ padding: 16, textAlign: 'center', color: 'var(--color-muted)', fontSize: 13 }}>
                                        Searching...
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                                        {searchResults.map((movie) => (
                                            <div 
                                                key={movie._id} 
                                                onClick={() => {
                                                    navigate(`/movies/${movie._id}`);
                                                    setSearchQuery('');
                                                    setShowDropdown(false);
                                                }}
                                                style={{ 
                                                    display: 'flex', 
                                                    gap: 12, 
                                                    padding: '12px 16px', 
                                                    cursor: 'pointer',
                                                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                                                    transition: 'background 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                            >
                                                {movie.poster ? (
                                                    <img src={movie.poster} alt={movie.title} style={{ width: 40, height: 56, borderRadius: 4, objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: 40, height: 56, borderRadius: 4, background: '#2a2a3e' }} />
                                                )}
                                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 4 }}>{movie.title}</span>
                                                    <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>
                                                        {movie.language?.join(', ')} • {new Date(movie.releaseDate).getFullYear()}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ padding: 16, textAlign: 'center', color: 'var(--color-muted)', fontSize: 13 }}>
                                        No movies found for "{searchQuery}"
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Auth buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {isAuthenticated ? (
                            <>
                                <Link to="/dashboard" title={user?.name} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #e50914, #ff6b35)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 2px rgba(229,9,20,0.3)' }}>
                                        <span style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>{user?.name?.[0]?.toUpperCase()}</span>
                                    </div>
                                </Link>
                                <button onClick={handleLogout} className="btn-secondary" style={{ padding: '6px 14px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <LogOut size={15} /> Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn-secondary" style={{ padding: '7px 16px', fontSize: 14, textDecoration: 'none' }}>Login</Link>
                                <Link to="/register" className="btn-primary" style={{ padding: '7px 16px', fontSize: 14, textDecoration: 'none' }}>Sign Up</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
