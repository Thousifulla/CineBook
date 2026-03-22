import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../redux/slices/authSlice';
import { authService } from '../services/index';
import { Eye, EyeOff, Film, User, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, watch, formState: { errors } } = useForm();

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const res = await authService.register({ name: data.name, email: data.email, password: data.password });
            dispatch(loginSuccess(res.data));
            toast.success('Account created! Welcome to CineBook 🎬');
            navigate('/');
        } catch (err) {
            toast.error(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'radial-gradient(ellipse at center, rgba(229,9,20,0.06) 0%, var(--color-bg) 70%)' }}>
            <div className="glass" style={{ borderRadius: 20, padding: '40px 36px', width: '100%', maxWidth: 440 }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ background: 'linear-gradient(135deg, #e50914, #ff6b35)', borderRadius: 12, padding: 12, display: 'inline-flex', marginBottom: 12 }}>
                        <Film size={28} color="white" />
                    </div>
                    <h1 style={{ fontWeight: 800, fontSize: 26, margin: 0, marginBottom: 4 }} className="gradient-text">Create Account</h1>
                    <p style={{ color: 'var(--color-muted)', fontSize: 14, margin: 0 }}>Join CineBook and start booking movies</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={{ color: 'var(--color-muted)', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Full Name</label>
                        <div style={{ position: 'relative' }}>
                            <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
                            <input id="reg-name" type="text" className="input-field" style={{ paddingLeft: 38 }} placeholder="John Doe"
                                {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })} />
                        </div>
                        {errors.name && <p style={{ color: 'var(--color-error)', fontSize: 12, margin: '4px 0 0' }}>{errors.name.message}</p>}
                    </div>

                    <div>
                        <label style={{ color: 'var(--color-muted)', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
                            <input id="reg-email" type="email" className="input-field" style={{ paddingLeft: 38 }} placeholder="you@example.com"
                                {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })} />
                        </div>
                        {errors.email && <p style={{ color: 'var(--color-error)', fontSize: 12, margin: '4px 0 0' }}>{errors.email.message}</p>}
                    </div>

                    <div>
                        <label style={{ color: 'var(--color-muted)', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
                            <input id="reg-password" type={showPassword ? 'text' : 'password'} className="input-field" style={{ paddingLeft: 38, paddingRight: 40 }} placeholder="Min 8 chars, with symbols"
                                {...register('password', { required: 'Password required', minLength: { value: 8, message: 'Min 8 characters' }, pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, message: 'Must include uppercase, number, symbol' } })} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer' }}>
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {errors.password && <p style={{ color: 'var(--color-error)', fontSize: 12, margin: '4px 0 0' }}>{errors.password.message}</p>}
                    </div>

                    <div>
                        <label style={{ color: 'var(--color-muted)', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Confirm Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
                            <input id="reg-confirm" type={showPassword ? 'text' : 'password'} className="input-field" style={{ paddingLeft: 38 }} placeholder="Repeat password"
                                {...register('confirmPassword', { required: 'Please confirm', validate: (val) => val === watch('password') || 'Passwords do not match' })} />
                        </div>
                        {errors.confirmPassword && <p style={{ color: 'var(--color-error)', fontSize: 12, margin: '4px 0 0' }}>{errors.confirmPassword.message}</p>}
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '12px', fontSize: 15, fontWeight: 700, marginTop: 4 }}>
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', color: 'var(--color-muted)', fontSize: 14, marginTop: 24 }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: '#e50914', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
                </p>
            </div>
        </div>
    );
}
