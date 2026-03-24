import { useEffect, useState } from 'react';
import { movieService } from '../../services/index';
import { Plus, Edit, Trash2, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
    title: '', description: '', genre: '', language: '', duration: '', rating: '',
    releaseDate: '', poster: '', trailer: '', isBookingOpen: false,
};

export default function MovieManagement() {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [search, setSearch] = useState('');
    const [saving, setSaving] = useState(false);

    const fetchMovies = () => {
        setLoading(true);
        movieService.getAll({ search, limit: 50 }).then((r) => setMovies(r.data.data)).catch(() => { }).finally(() => setLoading(false));
    };

    useEffect(() => { fetchMovies(); }, [search]);

    const openAdd = () => { setForm(EMPTY_FORM); setEditing(null); setShowForm(true); };
    const openEdit = (m) => {
        setForm({
            title: m.title, description: m.description,
            genre: m.genre?.join(', '), language: m.language?.join(', '),
            duration: m.duration, rating: m.rating, releaseDate: m.releaseDate?.split('T')[0],
            poster: m.poster, trailer: m.trailer, isBookingOpen: m.isBookingOpen || false,
        });
        setEditing(m._id);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const payload = {
            ...form,
            genre: form.genre.split(',').map((g) => g.trim()).filter(Boolean),
            language: form.language.split(',').map((l) => l.trim()).filter(Boolean),
            duration: parseInt(form.duration),
            rating: parseFloat(form.rating) || 0,
            releaseDate: form.releaseDate,
            isBookingOpen: form.isBookingOpen,
        };
        try {
            if (editing) { await movieService.update(editing, payload); toast.success('Movie updated!'); }
            else { await movieService.create(payload); toast.success('Movie added!'); }
            setShowForm(false);
            fetchMovies();
        } catch (err) { toast.error(err.message || 'Save failed'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Remove "${title}" from the platform?`)) return;
        await movieService.delete(id);
        toast.success('Movie removed');
        fetchMovies();
    };

    return (
        <div className="page-container" style={{ paddingTop: 32, paddingBottom: 48 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <h1 style={{ fontWeight: 800, fontSize: 24, margin: 0 }}>Movie Management</h1>
                <button className="btn-primary" onClick={openAdd} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px' }}>
                    <Plus size={16} /> Add Movie
                </button>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: 20, maxWidth: 360 }}>
                <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
                <input className="input-field" style={{ paddingLeft: 36 }} placeholder="Search movies..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            {/* Modal form */}
            {showForm && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                    <div className="glass" style={{ borderRadius: 16, padding: '28px 28px', width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h2 style={{ fontWeight: 800, fontSize: 20, margin: 0 }}>{editing ? 'Edit Movie' : 'Add New Movie'}</h2>
                            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer' }}><X size={22} /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {[
                                { key: 'title', label: 'Title', type: 'text', required: true },
                                { key: 'genre', label: 'Genres (comma-separated)', type: 'text', placeholder: 'Action, Thriller', required: true },
                                { key: 'language', label: 'Languages (comma-separated)', type: 'text', placeholder: 'English, Hindi', required: true },
                                { key: 'duration', label: 'Duration (minutes)', type: 'number', required: true },
                                { key: 'rating', label: 'Rating (0-10)', type: 'number', step: '0.1' },
                                { key: 'releaseDate', label: 'Release Date', type: 'date', required: true },
                                { key: 'poster', label: 'Poster URL', type: 'url' },
                                { key: 'trailer', label: 'Trailer Embed URL', type: 'url' },
                            ].map(({ key, label, ...rest }) => (
                                <div key={key}>
                                    <label style={{ color: 'var(--color-muted)', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>{label}</label>
                                    <input className="input-field" value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} {...rest} />
                                </div>
                            ))}
                            <div>
                                <label style={{ color: 'var(--color-muted)', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Description</label>
                                <textarea className="input-field" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} style={{ resize: 'vertical' }} required />
                            </div>
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                    <input type="checkbox" checked={form.isBookingOpen} onChange={(e) => setForm(f => ({ ...f, isBookingOpen: e.target.checked }))} style={{ width: 16, height: 16, accentColor: '#e50914' }} />
                                    <span style={{ color: 'var(--color-text)', fontSize: 13, fontWeight: 600 }}>Allow Seat Booking (Open to public)</span>
                                </label>
                            </div>
                            <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                                <button type="submit" className="btn-primary" disabled={saving} style={{ flex: 1, padding: '11px' }}>{saving ? 'Saving...' : editing ? 'Update Movie' : 'Add Movie'}</button>
                                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)} style={{ flex: 1, padding: '11px' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Table */}
            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{[1, 2, 3, 4].map((i) => <div key={i} className="skeleton" style={{ height: 72, borderRadius: 10 }} />)}</div>
            ) : (
                <div className="glass" style={{ borderRadius: 16, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'rgba(255,255,255,0.02)' }}>
                                {['Poster', 'Title', 'Genre', 'Language', 'Rating', 'Release', 'Booking', 'Actions'].map((h) => (
                                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', color: 'var(--color-muted)', fontWeight: 600, fontSize: 12 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {movies.map((m) => (
                                <tr key={m._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                    <td style={{ padding: '10px 14px' }}>
                                        {m.poster ? <img src={m.poster} alt={m.title} style={{ width: 36, height: 50, borderRadius: 4, objectFit: 'cover' }} /> : <div style={{ width: 36, height: 50, background: 'var(--color-surface)', borderRadius: 4 }} />}
                                    </td>
                                    <td style={{ padding: '10px 14px', color: 'var(--color-text)', fontWeight: 600, maxWidth: 180 }}>{m.title}</td>
                                    <td style={{ padding: '10px 14px', color: 'var(--color-muted)' }}>{m.genre?.slice(0, 2).join(', ')}</td>
                                    <td style={{ padding: '10px 14px', color: 'var(--color-muted)' }}>{m.language?.join(', ')}</td>
                                    <td style={{ padding: '10px 14px', color: '#f5c518', fontWeight: 700 }}>{m.rating?.toFixed(1)}</td>
                                    <td style={{ padding: '10px 14px', color: 'var(--color-muted)' }}>{m.releaseDate ? new Date(m.releaseDate).toLocaleDateString('en-IN') : '-'}</td>
                                    <td style={{ padding: '10px 14px' }}>
                                        <span style={{ fontSize: 11, background: m.isBookingOpen ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: m.isBookingOpen ? '#22c55e' : '#ef4444', padding: '3px 8px', borderRadius: 4, fontWeight: 600 }}>{m.isBookingOpen ? 'Open' : 'Closed'}</span>
                                    </td>
                                    <td style={{ padding: '10px 14px' }}>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button onClick={() => openEdit(m)} style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 6, padding: '5px 10px', color: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                                                <Edit size={13} /> Edit
                                            </button>
                                            <button onClick={() => handleDelete(m._id, m.title)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, padding: '5px 10px', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                                                <Trash2 size={13} /> Remove
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {movies.length === 0 && <p style={{ textAlign: 'center', color: 'var(--color-muted)', padding: 40 }}>No movies found</p>}
                </div>
            )}
        </div>
    );
}
