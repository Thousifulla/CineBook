import { useEffect, useState } from 'react';
import { aiService } from '../../services/index';
import { Sparkles, ThumbsUp, ThumbsDown, RefreshCw, Star, TrendingUp, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

function ScoreBar({ label, value, color }) {
    return (
        <div style={{ marginBottom: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ color: 'var(--color-muted)', fontSize: 10 }}>{label}</span>
                <span style={{ color: 'var(--color-muted)', fontSize: 10 }}>{value}</span>
            </div>
            <div style={{ height: 4, background: 'var(--color-surface)', borderRadius: 2 }}>
                <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 2, transition: 'width 0.4s ease' }} />
            </div>
        </div>
    );
}

export default function AISuggestions() {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [statusFilter, setStatusFilter] = useState('pending');
    const [acting, setActing] = useState({});

    const fetchSuggestions = async () => {
        setLoading(true);
        try {
            const res = await aiService.getSuggestions({ status: statusFilter });
            setSuggestions(res.data.data);
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { fetchSuggestions(); }, [statusFilter]);

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const res = await aiService.generate();
            toast.success(`Generated ${res.data.data.length} new suggestions!`);
            fetchSuggestions();
        } catch (err) {
            toast.error(err.message || 'Failed to fetch from TMDB');
        } finally { setGenerating(false); }
    };

    const handleApprove = async (id, title) => {
        setActing((a) => ({ ...a, [id]: 'approving' }));
        try {
            await aiService.approve(id);
            toast.success(`✅ "${title}" added to movies!`);
            setSuggestions((s) => s.filter((x) => x._id !== id));
        } catch (err) { toast.error(err.message || 'Failed to approve'); }
        finally { setActing((a) => ({ ...a, [id]: null })); }
    };

    const handleReject = async (id, title) => {
        setActing((a) => ({ ...a, [id]: 'rejecting' }));
        try {
            await aiService.reject(id, { reason: 'Rejected by admin' });
            toast.success(`Rejected "${title}"`);
            setSuggestions((s) => s.filter((x) => x._id !== id));
        } catch (err) { toast.error(err.message || 'Failed to reject'); }
        finally { setActing((a) => ({ ...a, [id]: null })); }
    };

    const handleReapprove = async (id, title) => {
        setActing((a) => ({ ...a, [id]: 'reapproving' }));
        try {
            await aiService.reapprove(id);
            toast.success(`✅ "${title}" restored successfully!`);
        } catch (err) { toast.error(err.message || 'Failed to restore'); }
        finally { setActing((a) => ({ ...a, [id]: null })); }
    };

    return (
        <div className="page-container" style={{ paddingTop: 32, paddingBottom: 48 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <h1 style={{ fontWeight: 800, fontSize: 24, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Sparkles size={26} color="#e50914" /> AI Movie Suggestions
                    </h1>
                    <p style={{ color: 'var(--color-muted)', fontSize: 14, margin: 0 }}>
                        AI-powered recommendations from TMDB — approve to add to your platform
                    </p>
                </div>
                <button onClick={handleGenerate} disabled={generating} className="btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px' }}>
                    <RefreshCw size={15} style={{ animation: generating ? 'spin 1s linear infinite' : 'none' }} />
                    {generating ? 'Fetching from TMDB...' : 'Generate New Suggestions'}
                </button>
            </div>

            {/* Status filter */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                {['pending', 'approved', 'rejected'].map((s) => (
                    <button key={s} onClick={() => setStatusFilter(s)}
                        style={{
                            padding: '7px 18px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
                            background: statusFilter === s ? 'linear-gradient(135deg, #e50914, #b20710)' : 'transparent',
                            color: statusFilter === s ? 'white' : 'var(--color-muted)', border: `1px solid ${statusFilter === s ? 'transparent' : 'var(--color-border)'}`
                        }}>
                        {s}
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                    {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton" style={{ height: 380, borderRadius: 14 }} />)}
                </div>
            ) : suggestions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-muted)' }}>
                    <Sparkles size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                    <h2 style={{ fontWeight: 700, marginBottom: 8 }}>No {statusFilter} suggestions</h2>
                    {statusFilter === 'pending' && <button className="btn-primary" onClick={handleGenerate} style={{ marginTop: 8 }}>Generate Now</button>}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                    {suggestions.map((s) => {
                        const m = s.movieData;
                        const isActing = acting[s._id];
                        return (
                            <div key={s._id} className="glass" style={{ borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                {/* Poster */}
                                <div style={{ position: 'relative', height: 200, overflow: 'hidden', flexShrink: 0 }}>
                                    {m.poster ? (
                                        <img src={m.poster} alt={m.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', background: 'var(--color-surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Sparkles size={40} color="var(--color-muted)" />
                                        </div>
                                    )}
                                    {/* AI Score badge */}
                                    <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.9)', borderRadius: 8, padding: '4px 10px', textAlign: 'center', border: '1px solid rgba(229,9,20,0.4)' }}>
                                        <p style={{ color: '#e50914', fontWeight: 900, fontSize: 18, margin: 0, lineHeight: 1 }}>{s.aiScore}</p>
                                        <p style={{ color: 'var(--color-muted)', fontSize: 9, margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>AI Score</p>
                                    </div>
                                    {/* Genre */}
                                    {m.genre?.[0] && (
                                        <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(229,9,20,0.8)', borderRadius: 4, padding: '2px 8px' }}>
                                            <span style={{ color: 'white', fontSize: 10, fontWeight: 700 }}>{m.genre[0]}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <h3 style={{ color: 'var(--color-text)', fontWeight: 700, fontSize: 15, margin: '0 0 6px', lineHeight: 1.2 }}>{m.title}</h3>
                                    <div style={{ display: 'flex', gap: 10, color: 'var(--color-muted)', fontSize: 12, marginBottom: 10 }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Star size={11} fill="#f5c518" color="#f5c518" /> {m.rating?.toFixed(1)}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={11} /> {m.runtime}m</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><TrendingUp size={11} /> {m.popularity?.toFixed(0)}</span>
                                    </div>

                                    <p style={{ color: 'var(--color-muted)', fontSize: 12, lineHeight: 1.5, flex: 1, margin: '0 0 12px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {m.overview}
                                    </p>

                                    {/* Score breakdown */}
                                    <div style={{ marginBottom: 14 }}>
                                        <ScoreBar label="Popularity" value={s.scoreBreakdown?.popularityScore} color="#e50914" />
                                        <ScoreBar label="Rating" value={s.scoreBreakdown?.ratingScore} color="#f5c518" />
                                        <ScoreBar label="Recency" value={s.scoreBreakdown?.recencyScore} color="#3b82f6" />
                                        <ScoreBar label="Trending" value={s.scoreBreakdown?.genreScore * 10} color="#a855f7" />
                                    </div>

                                    {/* Release date */}
                                    <p style={{ color: 'var(--color-muted)', fontSize: 11, margin: '0 0 14px' }}>
                                        🗓 {m.releaseDate ? new Date(m.releaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'TBA'}
                                    </p>

                                    {/* Actions */}
                                    {statusFilter === 'pending' && (
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button onClick={() => handleApprove(s._id, m.title)} disabled={!!isActing}
                                                style={{ flex: 1, padding: '8px', borderRadius: 8, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', cursor: 'pointer', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                                                <ThumbsUp size={14} /> {isActing === 'approving' ? '...' : 'Approve'}
                                            </button>
                                            <button onClick={() => handleReject(s._id, m.title)} disabled={!!isActing}
                                                style={{ flex: 1, padding: '8px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', cursor: 'pointer', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                                                <ThumbsDown size={14} /> {isActing === 'rejecting' ? '...' : 'Reject'}
                                            </button>
                                        </div>
                                    )}
                                    {statusFilter === 'approved' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            <div style={{ textAlign: 'center', padding: '6px 0', borderRadius: 8, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
                                                <span style={{ color: '#22c55e', fontWeight: 700, fontSize: 13, textTransform: 'capitalize' }}>Approved</span>
                                            </div>
                                            <button onClick={() => handleReapprove(s._id, m.title)} disabled={!!isActing}
                                                style={{ width: '100%', padding: '8px', borderRadius: 8, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', color: '#3b82f6', cursor: 'pointer', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                                                <RefreshCw size={14} style={{ animation: isActing === 'reapproving' ? 'spin 1s linear infinite' : 'none' }} /> {isActing === 'reapproving' ? 'Restoring...' : 'Restore Movie'}
                                            </button>
                                        </div>
                                    )}
                                    {statusFilter === 'rejected' && (
                                        <div style={{ textAlign: 'center', padding: '6px 0', borderRadius: 8, background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                            <span style={{ color: '#6b7280', fontWeight: 700, fontSize: 13, textTransform: 'capitalize' }}>Rejected</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
