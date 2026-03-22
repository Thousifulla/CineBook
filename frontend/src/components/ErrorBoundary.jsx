import React, { Component } from 'react';

export default class ErrorBoundary extends Component {
    state = { hasError: false, error: null };

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error('ErrorBoundary caught:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24 }}>
                    <div style={{ fontSize: 64, marginBottom: 16 }}>🎬</div>
                    <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>Something went wrong</h2>
                    <p style={{ color: 'var(--color-muted)', marginBottom: 24 }}>{this.state.error?.message || 'An unexpected error occurred'}</p>
                    <button className="btn-primary" onClick={() => window.location.href = '/'}>Go to Home</button>
                </div>
            );
        }
        return this.props.children;
    }
}
