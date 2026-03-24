import { useEffect, useState } from 'react';
import { aiService } from '../../services/index';
import { Calendar, CheckCircle, Clock, FastForward, Film } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AIScheduler() {
    const [statusData, setStatusData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [daysInputs, setDaysInputs] = useState({});

    const fetchStatus = async () => {
        setLoading(true);
        try {
            const res = await aiService.getScheduleStatus();
            setStatusData(res.data.data);
            
            // initialize inputs
            const initDays = {};
            res.data.data.forEach(item => {
                initDays[item.movie._id] = 4; // default 4 days
            });
            setDaysInputs(initDays);
        } catch (error) {
            toast.error(error.message || 'Failed to fetch schedule status');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    const handleSchedule = async (movieId, e) => {
        e?.preventDefault();
        setProcessingId(movieId);
        try {
            const days = daysInputs[movieId] || 4;
            const res = await aiService.executeSchedule({ movieId, days });
            toast.success(res.data.message || 'Shows scheduled successfully!');
            fetchStatus(); // Refresh the grid
        } catch (error) {
            toast.error(error.message || 'Failed to auto-schedule shows');
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="page-container" style={{ paddingTop: 32, paddingBottom: 48 }}>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontWeight: 800, fontSize: 24, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Calendar size={26} color="#e50914" /> AI Auto-Scheduler
                </h1>
                <p style={{ color: 'var(--color-muted)', fontSize: 14, margin: 0 }}>
                    Automatically manage and extend showtimes for your active movies.
                </p>
            </div>

            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                    {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 200, borderRadius: 14 }} />)}
                </div>
            ) : statusData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-muted)' }}>
                    <CheckCircle size={48} color="#22c55e" style={{ opacity: 0.8, marginBottom: 16 }} />
                    <h2 style={{ fontWeight: 700, marginBottom: 8, color: 'var(--color-text)' }}>All Caught Up!</h2>
                    <p>No active movies found that require scheduling. Make sure movies are approved and allow seat bookings.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                    {statusData.map((item) => {
                        const { movie, status, message } = item;
                        const isProcessing = processingId === movie._id;

                        // Identify styling
                        let statusColor = '#3b82f6'; // needs_continuation (blue)
                        let statusIcon = <Clock size={16} />;
                        
                        if (status === 'needs_initial') {
                            statusColor = '#e50914'; // red
                            statusIcon = <FastForward size={16} />;
                        } else if (status === 'scheduled') {
                            statusColor = '#22c55e'; // green
                            statusIcon = <CheckCircle size={16} />;
                        }

                        return (
                            <div key={movie._id} className="glass" style={{ borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                {/* Info */}
                                <div style={{ padding: '16px 20px', flex: 1, display: 'flex', gap: 16 }}>
                                    <div style={{ flexShrink: 0 }}>
                                        {movie.poster ? (
                                            <img src={movie.poster} alt={movie.title} style={{ width: 60, height: 85, borderRadius: 6, objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: 60, height: 85, background: 'var(--color-surface2)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Film size={24} color="var(--color-muted)" />
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ color: 'var(--color-text)', fontWeight: 700, fontSize: 16, margin: '0 0 6px' }}>{movie.title}</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: statusColor, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
                                            {statusIcon} <span style={{ textTransform: 'uppercase' }}>{status.replace('_', ' ')}</span>
                                        </div>
                                        <p style={{ color: 'var(--color-muted)', fontSize: 12, margin: 0, lineHeight: 1.5 }}>
                                            {message}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--color-border)' }}>
                                    {status === 'scheduled' ? (
                                        <button onClick={() => handleSchedule(movie._id)} disabled={isProcessing} className="btn-secondary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: 8, padding: '10px' }}>
                                            {isProcessing ? 'Processing...' : 'Force Add 4 More Days'}
                                        </button>
                                    ) : (
                                        <form onSubmit={(e) => handleSchedule(movie._id, e)} style={{ display: 'flex', gap: 8 }}>
                                            <div style={{ flexShrink: 0, position: 'relative' }}>
                                                <input 
                                                    type="number" 
                                                    min="1" 
                                                    max="30"
                                                    value={daysInputs[movie._id] || 4} 
                                                    onChange={(e) => setDaysInputs({ ...daysInputs, [movie._id]: parseInt(e.target.value) || 4 })}
                                                    className="input-field" 
                                                    style={{ width: 70, padding: '9px 12px', textAlign: 'center' }} 
                                                />
                                            </div>
                                            <button type="submit" disabled={isProcessing} className="btn-primary" style={{ flex: 1, padding: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
                                                {isProcessing ? (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>Scheduling...</span>
                                                ) : (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><FastForward size={16} /> Auto-Schedule</span>
                                                )}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
