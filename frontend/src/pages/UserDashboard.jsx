import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Mail, Calendar, Ticket, DollarSign, Film, ChevronRight, Star, Edit2, Check, X, Phone, Lock } from 'lucide-react';
import { bookingService, authService } from '../services/index';
import { formatCurrency, formatDate, formatTime } from '../utils/format';
import toast from 'react-hot-toast';
import { updateUser } from '../redux/slices/authSlice';

function StatCard({ icon: Icon, label, value, color }) {
    return (
        <div className="glass" style={{ borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={22} color={color} />
            </div>
            <div>
                <p style={{ color: 'var(--color-muted)', fontSize: 12, margin: '0 0 2px' }}>{label}</p>
                <p style={{ color: 'var(--color-text)', fontWeight: 800, fontSize: 20, margin: 0 }}>{value}</p>
            </div>
        </div>
    );
}

export default function UserDashboard() {
    const { user } = useSelector((s) => s.auth);
    const dispatch = useDispatch();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    // Profile edit state
    const [editMode, setEditMode] = useState(false);
    const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
    const [saving, setSaving] = useState(false);
    
    // Password change state
    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [changingPassword, setChangingPassword] = useState(false);

    useEffect(() => {
        bookingService.getMyBookings({ page: 1, limit: 5 })
            .then((r) => setBookings(r.data.data || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const completed = bookings.filter(b => b.paymentStatus === 'completed');
    const totalSpent = completed.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    const handleProfileSave = async () => {
        if (!profileForm.name.trim()) return toast.error('Name cannot be empty');
        setSaving(true);
        try {
            const res = await authService.updateProfile({ name: profileForm.name.trim(), phone: profileForm.phone.trim() });
            dispatch(updateUser(res.data.user));
            toast.success('Profile updated!');
            setEditMode(false);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            return toast.error("New passwords do not match");
        }
        if (passwordForm.newPassword.length < 6) {
            return toast.error("New password must be at least 6 characters");
        }
        
        setChangingPassword(true);
        try {
            await authService.changePassword({ 
                currentPassword: passwordForm.currentPassword, 
                newPassword: passwordForm.newPassword 
            });
            toast.success("Password updated successfully! 🔒");
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setShowPasswordSection(false);
        } catch(err) {
            toast.error(err?.response?.data?.message || "Failed to update password");
        } finally {
            setChangingPassword(false);
        }
    };

    return (
        <div className="page-container" style={{ paddingTop: 40, paddingBottom: 60 }}>
            <h1 style={{ fontWeight: 800, fontSize: 26, marginBottom: 28 }}>My Dashboard</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 32 }}>
                {/* Profile card */}
                <div className="glass" style={{ borderRadius: 16, padding: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #e50914, #ff6b35)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 8px 24px rgba(229,9,20,0.3)' }}>
                                <span style={{ color: 'white', fontWeight: 800, fontSize: 20 }}>{user?.name?.[0]?.toUpperCase()}</span>
                            </div>
                            <div>
                                <h2 style={{ fontWeight: 700, fontSize: 16, margin: '0 0 4px' }}>{user?.name}</h2>
                                <span style={{ background: user?.role === 'admin' ? 'rgba(245,197,24,0.15)' : 'rgba(59,130,246,0.15)', color: user?.role === 'admin' ? '#f5c518' : '#3b82f6', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>
                                    {user?.role === 'admin' ? '⭐ Admin' : '🎬 Member'}
                                </span>
                            </div>
                        </div>

                        {/* Edit / Save / Cancel buttons */}
                        {!editMode ? (
                            <button
                                onClick={() => { setEditMode(true); setProfileForm({ name: user?.name || '', phone: user?.phone || '' }); }}
                                title="Edit Profile"
                                style={{ background: 'var(--color-surface2)', border: '1px solid var(--color-border)', borderRadius: 8, padding: 7, cursor: 'pointer', color: 'var(--color-muted)', display: 'flex', transition: 'color 0.2s' }}
                                onMouseOver={e => e.currentTarget.style.color = 'var(--color-text)'}
                                onMouseOut={e => e.currentTarget.style.color = 'var(--color-muted)'}
                            >
                                <Edit2 size={15} />
                            </button>
                        ) : (
                            <div style={{ display: 'flex', gap: 6 }}>
                                <button onClick={handleProfileSave} disabled={saving}
                                    style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, padding: 7, cursor: 'pointer', color: '#22c55e', display: 'flex' }}>
                                    <Check size={15} />
                                </button>
                                <button onClick={() => setEditMode(false)}
                                    style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: 7, cursor: 'pointer', color: '#ef4444', display: 'flex' }}>
                                    <X size={15} />
                                </button>
                            </div>
                        )}
                    </div>

                    {editMode ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <div>
                                <label style={{ color: 'var(--color-muted)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Full Name</label>
                                <input
                                    className="input-field"
                                    style={{ marginTop: 4 }}
                                    value={profileForm.name}
                                    onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder="Your name"
                                />
                            </div>
                            <div>
                                <label style={{ color: 'var(--color-muted)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Phone</label>
                                <input
                                    className="input-field"
                                    style={{ marginTop: 4 }}
                                    value={profileForm.phone}
                                    onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                                    placeholder="+91 9876543210"
                                    type="tel"
                                />
                            </div>
                            <button className="btn-primary" onClick={handleProfileSave} disabled={saving} style={{ marginTop: 4 }}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-muted)', fontSize: 14 }}>
                                <Mail size={14} /> {user?.email}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-muted)', fontSize: 14 }}>
                                <Phone size={14} />{user?.phone || <span style={{ fontStyle: 'italic', fontSize: 12 }}>No phone added</span>}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-muted)', fontSize: 14 }}>
                                <Calendar size={14} /> Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'Recently'}
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick actions */}
                <div className="glass" style={{ borderRadius: 16, padding: 24 }}>
                    <h3 style={{ fontWeight: 700, fontSize: 14, margin: '0 0 14px', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Quick Actions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {[
                            { to: '/', icon: Film, label: 'Browse Movies', desc: 'Explore now showing' },
                            { to: '/bookings', icon: Ticket, label: 'All My Bookings', desc: 'Full booking history' },
                            ...(user?.role === 'admin' ? [{ to: '/admin', icon: Star, label: 'Admin Dashboard', desc: 'Manage movies & shows' }] : []),
                        ].map((item) => (
                            <Link key={item.to} to={item.to} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--color-surface)', borderRadius: 10, padding: '10px 14px', border: '1px solid var(--color-border)', transition: 'border-color 0.2s' }}
                                onMouseOver={e => e.currentTarget.style.borderColor = '#e50914'}
                                onMouseOut={e => e.currentTarget.style.borderColor = 'var(--color-border)'}>
                                <item.icon size={16} color="var(--color-muted)" />
                                <div style={{ flex: 1 }}>
                                    <p style={{ color: 'var(--color-text)', fontWeight: 600, fontSize: 14, margin: 0 }}>{item.label}</p>
                                    <p style={{ color: 'var(--color-muted)', fontSize: 12, margin: 0 }}>{item.desc}</p>
                                </div>
                                <ChevronRight size={14} color="var(--color-muted)" />
                            </Link>
                        ))}
                        
                        {/* Security Toggle */}
                        <div 
                            onClick={() => setShowPasswordSection(!showPasswordSection)} 
                            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--color-surface)', borderRadius: 10, padding: '10px 14px', border: '1px solid var(--color-border)', transition: 'border-color 0.2s' }}
                            onMouseOver={e => e.currentTarget.style.borderColor = '#e50914'}
                            onMouseOut={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
                        >
                            <Lock size={16} color="var(--color-muted)" />
                            <div style={{ flex: 1 }}>
                                <p style={{ color: 'var(--color-text)', fontWeight: 600, fontSize: 14, margin: 0 }}>Security</p>
                                <p style={{ color: 'var(--color-muted)', fontSize: 12, margin: 0 }}>Change your password</p>
                            </div>
                            {showPasswordSection ? <X size={14} color="var(--color-muted)" /> : <ChevronRight size={14} color="var(--color-muted)" />}
                        </div>
                    </div>

                    {/* Password Change Form */}
                    {showPasswordSection && (
                        <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--color-border)', animation: 'fadeIn 0.3s ease-in-out' }}>
                            <h4 style={{ fontWeight: 600, fontSize: 14, margin: '0 0 16px', color: 'var(--color-text)' }}>Update Password</h4>
                            <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <input
                                    type="password"
                                    className="input-field"
                                    placeholder="Current Password"
                                    required
                                    value={passwordForm.currentPassword}
                                    onChange={e => setPasswordForm(f => ({ ...f, currentPassword: e.target.value }))}
                                />
                                <input
                                    type="password"
                                    className="input-field"
                                    placeholder="New Password (min 6 chars)"
                                    required
                                    minLength={6}
                                    value={passwordForm.newPassword}
                                    onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))}
                                />
                                <input
                                    type="password"
                                    className="input-field"
                                    placeholder="Confirm New Password"
                                    required
                                    minLength={6}
                                    value={passwordForm.confirmPassword}
                                    onChange={e => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))}
                                />
                                <button type="submit" className="btn-primary" disabled={changingPassword} style={{ marginTop: 4 }}>
                                    {changingPassword ? 'Updating...' : 'Update Password'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats */}
            {!loading && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
                    <StatCard icon={Ticket} label="Total Bookings" value={bookings.length} color="#a855f7" />
                    <StatCard icon={Film} label="Movies Watched" value={completed.length} color="#e50914" />
                    <StatCard icon={DollarSign} label="Total Spent" value={formatCurrency(totalSpent)} color="#22c55e" />
                </div>
            )}

            {/* Recent bookings */}
            <div className="glass" style={{ borderRadius: 16, padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h3 style={{ fontWeight: 700, fontSize: 16, margin: 0 }}>Recent Bookings</h3>
                    <Link to="/bookings" style={{ color: '#e50914', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                        View All →
                    </Link>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 64, borderRadius: 10 }} />)}
                    </div>
                ) : bookings.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-muted)' }}>
                        <Ticket size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
                        <p style={{ margin: '0 0 16px' }}>No bookings yet. Go watch a movie!</p>
                        <Link to="/" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block', padding: '8px 20px', fontSize: 14 }}>
                            Browse Movies
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {bookings.slice(0, 5).map((booking) => {
                            const show = booking.showId;
                            const movie = show?.movieId;
                            const isConfirmed = booking.paymentStatus === 'completed';
                            return (
                                <Link key={booking._id} to={`/booking-confirmed/${booking._id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--color-surface)', borderRadius: 10, padding: '12px 14px', border: '1px solid var(--color-border)', transition: 'border-color 0.2s' }}
                                    onMouseOver={e => e.currentTarget.style.borderColor = 'var(--color-muted)'}
                                    onMouseOut={e => e.currentTarget.style.borderColor = 'var(--color-border)'}>
                                    {movie?.poster && (
                                        <img src={movie.poster} alt={movie.title} style={{ width: 40, height: 56, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                                    )}
                                    <div style={{ flex: 1 }}>
                                        <p style={{ color: 'var(--color-text)', fontWeight: 600, fontSize: 14, margin: '0 0 2px' }}>{movie?.title || 'Movie'}</p>
                                        <p style={{ color: 'var(--color-muted)', fontSize: 12, margin: 0 }}>
                                            {formatDate(show?.showTime)} · {formatTime(show?.showTime)} · {booking.seats?.join(', ')}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        <p style={{ color: isConfirmed ? '#22c55e' : '#f59e0b', fontWeight: 700, fontSize: 14, margin: '0 0 2px' }}>
                                            {formatCurrency(booking.totalPrice)}
                                        </p>
                                        <span style={{ background: isConfirmed ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', color: isConfirmed ? '#22c55e' : '#f59e0b', borderRadius: 10, padding: '1px 8px', fontSize: 11, fontWeight: 700 }}>
                                            {booking.paymentStatus}
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
