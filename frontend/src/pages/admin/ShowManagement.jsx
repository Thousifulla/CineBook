import { useEffect, useState } from 'react';
import { showService, movieService } from '../../services/index';
import { Plus, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY = {
    movieId: '', theater: { name: '', location: '', city: '', screen: '' },
    showTime: '', seatPricing: { regular: 150, premium: 250, vip: 400 },
    language: 'English', format: '2D',
};

export default function ShowManagement() {
    const [shows, setShows] = useState([]);
    const [movies, setMovies] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(EMPTY);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        Promise.all([
            showService.getAll({ limit: 50 }).then((r) => setShows(r.data.data)),
            movieService.getAll({ limit: 100 }).then((r) => setMovies(r.data.data)),
        ]).finally(() => setLoading(false));
    }, []);

    const refresh = () => showService.getAll({ limit: 50 }).then((r) => setShows(r.data.data)).catch(() => { });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await showService.create({
                ...form,
                seatPricing: {
                    regular: parseInt(form.seatPricing.regular),
                    premium: parseInt(form.seatPricing.premium),
                    vip: parseInt(form.seatPricing.vip),
                },
            });
            toast.success('Show created!');
            setShowForm(false);
            setForm(EMPTY);
            refresh();
        } catch (err) { toast.error(err.message || 'Failed to create show'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this show?')) return;
        await showService.delete(id);
        toast.success('Show deleted');
        refresh();
    };

    const setField = (field, value) => setForm((f) => ({ ...f, [field]: value }));
    const setTheater = (field, value) => setForm((f) => ({ ...f, theater: { ...f.theater, [field]: value } }));
    const setPricing = (field, value) => setForm((f) => ({ ...f, seatPricing: { ...f.seatPricing, [field]: value } }));

    return (
        <div className="page-container" style={{ paddingTop: 32, paddingBottom: 48 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <h1 style={{ fontWeight: 800, fontSize: 24, margin: 0 }}>Show Management</h1>
                <button className="btn-primary" onClick={() => setShowForm(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px' }}>
                    <Plus size={16} /> Add Show
                </button>
            </div>

            {/* Add Show Modal */}
            {showForm && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                    <div className="glass" style={{ borderRadius: 16, padding: '28px', width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                            <h2 style={{ fontWeight: 800, fontSize: 20, margin: 0 }}>Add New Show</h2>
                            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer' }}><X size={22} /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div>
                                <label style={{ color: 'var(--color-muted)', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Movie *</label>
                                <select className="input-field" value={form.movieId} onChange={(e) => setField('movieId', e.target.value)} required>
                                    <option value="">Select movie...</option>
                                    {movies.map((m) => <option key={m._id} value={m._id}>{m.title}</option>)}
                                </select>
                            </div>
                            {[
                                { label: 'Theater Name *', field: 'name', type: 'text' },
                                { label: 'Location/Address *', field: 'location', type: 'text' },
                                { label: 'City *', field: 'city', type: 'text' },
                                { label: 'Screen', field: 'screen', type: 'text' },
                            ].map(({ label, field, type }) => (
                                <div key={field}>
                                    <label style={{ color: 'var(--color-muted)', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>{label}</label>
                                    <input className="input-field" type={type} value={form.theater[field]} onChange={(e) => setTheater(field, e.target.value)} required={label.includes('*')} />
                                </div>
                            ))}
                            <div>
                                <label style={{ color: 'var(--color-muted)', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Show Date & Time *</label>
                                <input className="input-field" type="datetime-local" value={form.showTime} onChange={(e) => setField('showTime', e.target.value)} required />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label style={{ color: 'var(--color-muted)', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Language</label>
                                    <select className="input-field" value={form.language} onChange={(e) => setField('language', e.target.value)}>
                                        {['English', 'Hindi', 'Tamil', 'Telugu', 'Malayalam', 'Kannada'].map((l) => <option key={l}>{l}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ color: 'var(--color-muted)', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Format</label>
                                    <select className="input-field" value={form.format} onChange={(e) => setField('format', e.target.value)}>
                                        {['2D', '3D', 'IMAX', '4DX'].map((f) => <option key={f}>{f}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {['regular', 'premium', 'vip'].map((type) => (
                                    <div key={type}>
                                        <label style={{ color: 'var(--color-muted)', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5, textTransform: 'capitalize' }}>{type} Price (₹)</label>
                                        <input className="input-field" type="number" value={form.seatPricing[type]} onChange={(e) => setPricing(type, e.target.value)} />
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button type="submit" className="btn-primary" disabled={saving} style={{ flex: 1, padding: '11px' }}>{saving ? 'Creating...' : 'Create Show'}</button>
                                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)} style={{ flex: 1, padding: '11px' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Shows table */}
            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 72, borderRadius: 10 }} />)}</div>
            ) : (
                <div className="glass overflow-x-auto w-full" style={{ borderRadius: 16 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 800 }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'rgba(255,255,255,0.02)' }}>
                                {['Movie', 'Theater', 'City', 'Date & Time', 'Format', 'VIP/Prem/Reg', 'Available', 'Action'].map((h) => (
                                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', color: 'var(--color-muted)', fontWeight: 600, fontSize: 11 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {shows.map((show) => (
                                <tr key={show._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                    <td style={{ padding: '10px 14px', color: 'var(--color-text)', fontWeight: 600 }}>{show.movieId?.title || 'N/A'}</td>
                                    <td style={{ padding: '10px 14px', color: 'var(--color-muted)' }}>{show.theater?.name}</td>
                                    <td style={{ padding: '10px 14px', color: 'var(--color-muted)' }}>{show.theater?.city}</td>
                                    <td style={{ padding: '10px 14px', color: 'var(--color-muted)' }}>{new Date(show.showTime).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                                    <td style={{ padding: '10px 14px', color: 'var(--color-muted)' }}>{show.format}</td>
                                    <td style={{ padding: '10px 14px', color: 'var(--color-muted)', fontSize: 12 }}>₹{show.seatPricing?.vip} / ₹{show.seatPricing?.premium} / ₹{show.seatPricing?.regular}</td>
                                    <td style={{ padding: '10px 14px' }}>
                                        <span style={{ color: show.availableSeats > 10 ? '#22c55e' : '#f59e0b', fontWeight: 700 }}>{show.availableSeats}/{show.totalSeats}</span>
                                    </td>
                                    <td style={{ padding: '10px 14px' }}>
                                        <button onClick={() => handleDelete(show._id)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, padding: '5px 10px', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                                            <Trash2 size={13} /> Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {shows.length === 0 && <p style={{ textAlign: 'center', color: 'var(--color-muted)', padding: 40 }}>No shows scheduled yet</p>}
                </div>
            )}
        </div>
    );
}
