import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout as logoutAction } from '../redux/slices/authSlice';

/**
 * Custom hook exposing auth state and helper methods.
 */
export default function useAuth() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, token, loading } = useSelector((s) => s.auth);

    const isAuth = !!token;
    const isAdmin = user?.role === 'admin';

    const logout = () => {
        dispatch(logoutAction());
        navigate('/login');
    };

    return { user, token, isAuth, isAdmin, loading, logout };
}
