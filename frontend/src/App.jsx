import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './redux/store';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';

// User pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MovieDetails from './pages/MovieDetails';
import SeatSelection from './pages/SeatSelection';
import BookingSummary from './pages/BookingSummary';
import BookingConfirmed from './pages/BookingConfirmed';
import BookingHistory from './pages/BookingHistory';
import UserDashboard from './pages/UserDashboard';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import MovieManagement from './pages/admin/MovieManagement';
import ShowManagement from './pages/admin/ShowManagement';
import AISuggestions from './pages/admin/AISuggestions';
import AIScheduler from './pages/admin/AIScheduler';
import BookingAnalytics from './pages/admin/BookingAnalytics';

import './index.css';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <ErrorBoundary>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--color-bg)' }}>
            <Navbar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 80px)' }}>
              <Routes>
                {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/movies/:id" element={<MovieDetails />} />

              {/* Protected user routes */}
              <Route path="/shows/:showId/seats" element={<ProtectedRoute><SeatSelection /></ProtectedRoute>} />
              <Route path="/booking-summary/:showId" element={<ProtectedRoute><BookingSummary /></ProtectedRoute>} />
              <Route path="/booking-confirmed/:id" element={<ProtectedRoute><BookingConfirmed /></ProtectedRoute>} />
              <Route path="/bookings" element={<ProtectedRoute><BookingHistory /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />

              {/* Admin routes */}
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/movies" element={<AdminRoute><MovieManagement /></AdminRoute>} />
              <Route path="/admin/shows" element={<AdminRoute><ShowManagement /></AdminRoute>} />
              <Route path="/admin/ai" element={<AdminRoute><AISuggestions /></AdminRoute>} />
              <Route path="/admin/ai-scheduler" element={<AdminRoute><AIScheduler /></AdminRoute>} />
              <Route path="/admin/analytics" element={<AdminRoute><BookingAnalytics /></AdminRoute>} />

              {/* 404 */}
              <Route path="*" element={
                <div style={{ textAlign: 'center', padding: '120px 0', color: 'var(--color-muted)' }}>
                  <div style={{ fontSize: 72, marginBottom: 16 }}>🎬</div>
                  <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>404 - Scene Not Found</h1>
                  <p>This page doesn't exist. Go back to the main show!</p>
                  <a href="/" className="btn-primary" style={{ display: 'inline-block', marginTop: 24, textDecoration: 'none', padding: '10px 24px' }}>Go Home</a>
                </div>
              } />
            </Routes>
            </div>
            <Footer />
          </div>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1a1a2e',
                color: '#e8e8f0',
                border: '1px solid #2a2a3e',
                borderRadius: '10px',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#22c55e', secondary: '#1a1a2e' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#1a1a2e' } },
            }}
          />
        </ErrorBoundary>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
