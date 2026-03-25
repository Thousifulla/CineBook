import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../redux/slices/authSlice';
import { authService } from '../services/index';
import { Eye, EyeOff, Film, Lock, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { loading } = useSelector((s) => s.auth);
    const [showPassword, setShowPassword] = useState(false);
    const from = location.state?.from?.pathname || '/';

    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (data) => {
        dispatch(loginStart());
        try {
            const res = await authService.login(data);
            dispatch(loginSuccess(res.data));
            toast.success(`Welcome back, ${res.data.user.name}!`);
            navigate(res.data.user.role === 'admin' ? '/admin' : from, { replace: true });
        } catch (err) {
            dispatch(loginFailure(err.message));
            toast.error(err.message || 'Invalid credentials');
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'radial-gradient(ellipse at center, rgba(229,9,20,0.06) 0%, var(--color-bg) 70%)' }}>
            <div className="glass p-6 md:p-9 w-full max-w-[420px]" style={{ borderRadius: 20 }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ background: 'linear-gradient(135deg, #e50914, #ff6b35)', borderRadius: 12, padding: 12, display: 'inline-flex', marginBottom: 12 }}>
                        <Film size={28} color="white" />
                    </div>
                    <h1 style={{ fontWeight: 800, fontSize: 26, margin: 0, marginBottom: 4 }} className="gradient-text">Welcome Back</h1>
                    <p style={{ color: 'var(--color-muted)', fontSize: 14, margin: 0 }}>Sign in to continue to CineBook</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div>
                        <label style={{ color: 'var(--color-muted)', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
                            <input
                                id="login-email"
                                type="email"
                                className="input-field"
                                style={{ paddingLeft: 38 }}
                                placeholder="you@example.com"
                                {...register('email', { required: 'Email is required' })}
                            />
                        </div>
                        {errors.email && <p style={{ color: 'var(--color-error)', fontSize: 12, margin: '4px 0 0' }}>{errors.email.message}</p>}
                    </div>

                    <div>
                        <label style={{ color: 'var(--color-muted)', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
                            <input
                                id="login-password"
                                type={showPassword ? 'text' : 'password'}
                                className="input-field"
                                style={{ paddingLeft: 38, paddingRight: 40 }}
                                placeholder="••••••••"
                                {...register('password', { required: 'Password is required' })}
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer' }}>
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {errors.password && <p style={{ color: 'var(--color-error)', fontSize: 12, margin: '4px 0 0' }}>{errors.password.message}</p>}
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}
                        style={{ padding: '12px', fontSize: 15, fontWeight: 700, marginTop: 4 }}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', color: 'var(--color-muted)', fontSize: 14, marginTop: 24 }}>
                    Don't have an account?{' '}
                    <Link to="/register" style={{ color: '#e50914', fontWeight: 700, textDecoration: 'none' }}>Sign up free</Link>
                </p>
            </div>
        </div>
    );
}
