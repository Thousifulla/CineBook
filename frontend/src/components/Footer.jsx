import { Link, useLocation } from 'react-router-dom';
import { Film, Github, Twitter, Instagram } from 'lucide-react';

const LINKS = [
    { label: 'Home', to: '/' },
    { label: 'My Bookings', to: '/bookings' },
    { label: 'Dashboard', to: '/dashboard' },
];

export default function Footer() {
    const location = useLocation();
    // Hide footer on admin pages
    if (location.pathname.startsWith('/admin')) return null;

    return (
        <footer style={{
            borderTop: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            marginTop: 'auto',
            padding: '40px 0 24px',
        }}>
            <div className="page-container">
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 40,
                    marginBottom: 40,
                }}>
                    {/* Brand */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: 10,
                                background: 'linear-gradient(135deg, #e50914, #b20710)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Film size={18} color="white" />
                            </div>
                            <span style={{ fontWeight: 900, fontSize: 20, color: 'var(--color-text)' }}>CineBook</span>
                        </div>
                        <p style={{ color: 'var(--color-muted)', fontSize: 13, lineHeight: 1.7, maxWidth: 220 }}>
                            Book movie tickets effortlessly. Real-time seat selection, instant confirmation, QR tickets.
                        </p>
                    </div>

                    {/* Quick links */}
                    <div>
                        <h4 style={{ color: 'var(--color-text)', fontWeight: 700, fontSize: 14, marginBottom: 14, marginTop: 0 }}>
                            Quick Links
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {LINKS.map(({ label, to }) => (
                                <Link key={to} to={to} style={{
                                    color: 'var(--color-muted)', textDecoration: 'none', fontSize: 14,
                                    transition: 'color 0.2s',
                                }}
                                    onMouseEnter={e => e.target.style.color = 'var(--color-text)'}
                                    onMouseLeave={e => e.target.style.color = 'var(--color-muted)'}
                                >
                                    {label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Social */}
                    <div>
                        <h4 style={{ color: 'var(--color-text)', fontWeight: 700, fontSize: 14, marginBottom: 14, marginTop: 0 }}>
                            Follow Us
                        </h4>
                        <div style={{ display: 'flex', gap: 12 }}>
                            {[
                                { Icon: Github, href: '#', label: 'GitHub' },
                                { Icon: Twitter, href: '#', label: 'Twitter' },
                                { Icon: Instagram, href: '#', label: 'Instagram' },
                            ].map(({ Icon, href, label }) => (
                                <a key={label} href={href} aria-label={label} style={{
                                    width: 38, height: 38, borderRadius: 10,
                                    background: 'var(--color-surface2)',
                                    border: '1px solid var(--color-border)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'var(--color-muted)', transition: 'all 0.2s',
                                }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.color = 'var(--color-text)';
                                        e.currentTarget.style.borderColor = 'var(--color-muted)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.color = 'var(--color-muted)';
                                        e.currentTarget.style.borderColor = 'var(--color-border)';
                                    }}
                                >
                                    <Icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div style={{
                    borderTop: '1px solid var(--color-border)',
                    paddingTop: 20,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12,
                }}>
                    <p style={{ color: 'var(--color-muted)', fontSize: 13, margin: 0 }}>
                        © {new Date().getFullYear()} CineBook. All rights reserved.
                    </p>
                    <div style={{ display: 'flex', gap: 20 }}>
                        {['Privacy Policy', 'Terms of Service'].map(t => (
                            <a key={t} href="#" style={{ color: 'var(--color-muted)', textDecoration: 'none', fontSize: 12 }}>
                                {t}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
