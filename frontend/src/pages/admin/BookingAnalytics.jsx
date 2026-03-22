import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/index';
import { formatCurrency, formatDate } from '../../utils/format';
import { Download, Search, Filter, RefreshCw, TrendingUp, Ticket, DollarSign, Users } from 'lucide-react';

const STATUS_COLORS = {
    completed: { bg: 'rgba(34,197,94,0.1)', color: '#22c55e' },
    pending: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
    failed: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
    cancelled: { bg: 'rgba(107,114,128,0.1)', color: '#6b7280' },
};

function StatCard({ label, value, icon: Icon, color }) {
    return (
        <div className="glass" style={{ borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={22} color={color} />
            </div>
            <div>
                <p style={{ color: 'var(--color-muted)', fontSize: 12, margin: '0 0 3px' }}>{label}</p>
                <p style={{ color: 'var(--color-text)', fontWeight: 800, fontSize: 20, margin: 0 }}>{value}</p>
            </div>
        </div>
    );
}

function Spinner() {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <div style={{ width: 40, height: 40, border: '3px solid var(--color-border)', borderTopColor: '#e50914', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
    );
}

export default function BookingAnalytics() {
    const [bookings, setBookings] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const LIMIT = 15;

    const fetchData = useCallback(async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const [bookRes, analyticsRes] = await Promise.all([
                adminService.getBookings({ page, limit: LIMIT, status: statusFilter }),
                adminService.getAnalytics(),
            ]);
            setBookings(bookRes.data.data || []);
            setTotal(bookRes.data.pagination?.total || 0);
            setAnalytics(analyticsRes.data.data || null);
        } catch (err) {
            console.error('Analytics fetch error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [page, statusFilter]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const filtered = search
        ? bookings.filter(b =>
            b.bookingReference?.toLowerCase().includes(search.toLowerCase()) ||
            b.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
            b.showId?.movieId?.title?.toLowerCase().includes(search.toLowerCase())
        )
        : bookings;

    const totalPages = Math.ceil(total / LIMIT);
    const ov = analytics?.overview || {};

    if (loading) return <Spinner />;

    return (
        <div className="page-container" style={{ paddingTop: 32, paddingBottom: 48 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 style={{ fontWeight: 800, fontSize: 26, margin: '0 0 4px' }}>Booking Analytics</h1>
                    <p style={{ color: 'var(--color-muted)', fontSize: 14, margin: 0 }}>Overview of all bookings and revenue</p>
                </div>
                <button
                    onClick={() => fetchData(true)}
                    className="btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', fontSize: 13 }}
                >
                    <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                    Refresh
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
                <StatCard label="Total Bookings" value={ov.totalBookings?.toLocaleString() || 0} icon={Ticket} color="#a855f7" />
                <StatCard label="Total Revenue" value={formatCurrency(ov.totalRevenue)} icon={DollarSign} color="#22c55e" />
                <StatCard label="Active Users" value={ov.totalUsers?.toLocaleString() || 0} icon={Users} color="#3b82f6" />
                <StatCard label="Active Movies" value={ov.totalMovies?.toLocaleString() || 0} icon={TrendingUp} color="#e50914" />
            </div>

            {/* Filters */}
            <div className="glass" style={{ borderRadius: 14, padding: '16px 20px', marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: '1 1 240px' }}>
                    <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
                    <input
                        id="analytics-search"
                        type="text"
                        className="input-field"
                        style={{ paddingLeft: 36, fontSize: 13 }}
                        placeholder="Search by reference, user or movie..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Filter size={14} color="var(--color-muted)" />
                    <select
                        id="status-filter"
                        className="input-field"
                        style={{ width: 'auto', fontSize: 13 }}
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    >
                        <option value="">All Statuses</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
                <span style={{ color: 'var(--color-muted)', fontSize: 13, marginLeft: 'auto' }}>
                    {total} total bookings
                </span>
            </div>

            {/* Bookings Table */}
            <div className="glass" style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'rgba(255,255,255,0.02)' }}>
                                {['Reference', 'User', 'Movie', 'Date', 'Seats', 'Amount', 'Status'].map((h) => (
                                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--color-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--color-muted)' }}>
                                        <div style={{ fontSize: 32, marginBottom: 8 }}>🎟️</div>
                                        <p style={{ margin: 0 }}>No bookings found</p>
                                    </td>
                                </tr>
                            ) : filtered.map((b) => {
                                const sc = STATUS_COLORS[b.paymentStatus] || STATUS_COLORS.pending;
                                return (
                                    <tr key={b._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: 'var(--color-text)', fontSize: 12 }}>
                                            {b.bookingReference || '—'}
                                        </td>
                                        <td style={{ padding: '12px 16px', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>
                                            {b.userId?.name || '—'}
                                        </td>
                                        <td style={{ padding: '12px 16px', color: 'var(--color-text)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {b.showId?.movieId?.title || '—'}
                                        </td>
                                        <td style={{ padding: '12px 16px', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>
                                            {formatDate(b.bookingTime || b.createdAt)}
                                        </td>
                                        <td style={{ padding: '12px 16px', color: 'var(--color-muted)' }}>
                                            {b.seats?.join(', ') || '—'}
                                        </td>
                                        <td style={{ padding: '12px 16px', color: '#22c55e', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                            {formatCurrency(b.totalPrice)}
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <span style={{ background: sc.bg, color: sc.color, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700, textTransform: 'capitalize' }}>
                                                {b.paymentStatus || 'pending'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
                    <button
                        className="btn-secondary"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        style={{ padding: '7px 16px', fontSize: 13 }}
                    >
                        ← Prev
                    </button>
                    <span style={{ color: 'var(--color-muted)', fontSize: 13 }}>
                        Page {page} of {totalPages}
                    </span>
                    <button
                        className="btn-secondary"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        style={{ padding: '7px 16px', fontSize: 13 }}
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
}
