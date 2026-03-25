import { useEffect, useState } from 'react';
import { adminService } from '../../services/index';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Users, Film, Ticket, DollarSign, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

function StatCard({ label, value, icon: Icon, color }) {
    return (
        <div className="glass" style={{ borderRadius: 14, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={24} color={color} />
            </div>
            <div>
                <p style={{ color: 'var(--color-muted)', fontSize: 13, margin: '0 0 4px' }}>{label}</p>
                <p style={{ color: 'var(--color-text)', fontWeight: 800, fontSize: 22, margin: 0 }}>{value}</p>
            </div>
        </div>
    );
}

export default function AdminDashboard() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminService.getAnalytics().then((r) => setAnalytics(r.data.data)).catch(() => { }).finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <div style={{ width: 40, height: 40, border: '3px solid var(--color-border)', borderTopColor: '#e50914', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
    );

    const ov = analytics?.overview || {};
    const monthlyData = analytics?.monthlyRevenue?.map((m) => ({
        name: `${m._id.month}/${m._id.year.toString().slice(-2)}`, revenue: m.revenue, bookings: m.bookings,
    })) || [];

    return (
        <div className="page-container" style={{ paddingTop: 32, paddingBottom: 48 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
                <h1 style={{ fontWeight: 800, fontSize: 26, margin: 0 }}>Admin Dashboard</h1>
                <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                    <Link to="/admin/movies" className="btn-primary" style={{ textDecoration: 'none', padding: '8px 18px', fontSize: 13 }}>Manage Movies</Link>
                    <Link to="/admin/shows" className="btn-secondary" style={{ textDecoration: 'none', padding: '8px 18px', fontSize: 13 }}>Shows</Link>
                    <Link to="/admin/analytics" className="btn-secondary" style={{ textDecoration: 'none', padding: '8px 18px', fontSize: 13 }}>📊 Analytics</Link>
                    <Link to="/admin/ai" className="btn-secondary" style={{ textDecoration: 'none', padding: '8px 18px', fontSize: 13 }}>🤖 AI Movies</Link>
                    <Link to="/admin/ai-scheduler" className="btn-secondary" style={{ textDecoration: 'none', padding: '8px 18px', fontSize: 13 }}>🗓 AI Scheduler</Link>
                </div>

            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
                <StatCard label="Total Users" value={ov.totalUsers?.toLocaleString() || 0} icon={Users} color="#3b82f6" />
                <StatCard label="Active Movies" value={ov.totalMovies?.toLocaleString() || 0} icon={Film} color="#e50914" />
                <StatCard label="Total Bookings" value={ov.totalBookings?.toLocaleString() || 0} icon={Ticket} color="#a855f7" />
                <StatCard label="Revenue" value={`₹${(ov.totalRevenue || 0).toLocaleString('en-IN')}`} icon={DollarSign} color="#22c55e" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24, marginBottom: 32 }}>
                {/* Revenue chart */}
                <div className="glass" style={{ borderRadius: 16, padding: '20px 16px' }}>
                    <h3 style={{ fontWeight: 700, fontSize: 15, margin: '0 0 20px', paddingLeft: 8 }}>Monthly Revenue</h3>
                    {monthlyData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" stroke="#6b7280" fontSize={11} />
                                <YAxis stroke="#6b7280" fontSize={11} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                                <Tooltip contentStyle={{ background: 'var(--color-surface2)', border: '1px solid var(--color-border)', borderRadius: 8 }} labelStyle={{ color: 'white' }} />
                                <Bar dataKey="revenue" fill="#e50914" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <p style={{ color: 'var(--color-muted)', textAlign: 'center', padding: 40 }}>No revenue data yet</p>}
                </div>

                {/* Popular movies */}
                <div className="glass" style={{ borderRadius: 16, padding: '20px 22px' }}>
                    <h3 style={{ fontWeight: 700, fontSize: 15, margin: '0 0 20px' }}>Top Movies</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {analytics?.popularMovies?.length > 0 ? analytics.popularMovies.slice(0, 5).map((m, i) => (
                            <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <span style={{ color: '#e50914', fontWeight: 800, fontSize: 16, width: 20 }}>#{i + 1}</span>
                                {m.poster && <img src={m.poster} alt={m.title} style={{ width: 36, height: 50, borderRadius: 4, objectFit: 'cover' }} />}
                                <div style={{ flex: 1 }}>
                                    <p style={{ color: 'var(--color-text)', fontWeight: 600, fontSize: 14, margin: 0 }}>{m.title}</p>
                                    <p style={{ color: 'var(--color-muted)', fontSize: 12, margin: '2px 0 0' }}>{m.bookings} bookings · ₹{m.revenue?.toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                        )) : <p style={{ color: 'var(--color-muted)', textAlign: 'center', padding: 20 }}>No booking data yet</p>}
                    </div>
                </div>
            </div>

            {/* Recent bookings */}
            <div className="glass" style={{ borderRadius: 16, padding: '20px 22px' }}>
                <h3 style={{ fontWeight: 700, fontSize: 15, margin: '0 0 16px' }}>Recent Bookings</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 600 }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                                {['Reference', 'User', 'Movie', 'Seats', 'Amount', 'Status'].map((h) => (
                                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--color-muted)', fontWeight: 600 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {analytics?.recentBookings?.map((b) => (
                                <tr key={b._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                    <td style={{ padding: '10px 12px', color: 'var(--color-text)', fontFamily: 'monospace' }}>{b.bookingReference}</td>
                                    <td style={{ padding: '10px 12px', color: 'var(--color-muted)' }}>{b.userId?.name}</td>
                                    <td style={{ padding: '10px 12px', color: 'var(--color-muted)' }}>{b.showId?.movieId?.title}</td>
                                    <td style={{ padding: '10px 12px', color: 'var(--color-muted)' }}>{b.seats?.join(', ')}</td>
                                    <td style={{ padding: '10px 12px', color: '#22c55e', fontWeight: 700 }}>₹{b.totalPrice}</td>
                                    <td style={{ padding: '10px 12px' }}>
                                        <span style={{ background: b.paymentStatus === 'completed' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', color: b.paymentStatus === 'completed' ? '#22c55e' : '#f59e0b', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>
                                            {b.paymentStatus}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {!analytics?.recentBookings?.length && <p style={{ color: 'var(--color-muted)', textAlign: 'center', padding: 30 }}>No bookings yet</p>}
                </div>
            </div>
        </div>
    );
}
