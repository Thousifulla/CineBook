import api from './api';

export const authService = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data),
    changePassword: (data) => api.put('/auth/change-password', data),
};

export const movieService = {
    getAll: (params) => api.get('/movies', { params }),
    getById: (id) => api.get(`/movies/${id}`),
    getTrending: () => api.get('/movies/trending'),
    search: (q) => api.get('/movies/search', { params: { q } }),
    create: (data) => api.post('/movies', data),
    update: (id, data) => api.put(`/movies/${id}`, data),
    delete: (id) => api.delete(`/movies/${id}`),
};

export const showService = {
    getByMovie: (movieId, params) => api.get(`/shows/movie/${movieId}`, { params }),
    getById: (id) => api.get(`/shows/${id}`),
    getAll: (params) => api.get('/shows', { params }),
    create: (data) => api.post('/shows', data),
    update: (id, data) => api.put(`/shows/${id}`, data),
    delete: (id) => api.delete(`/shows/${id}`),
};

export const bookingService = {
    lockSeats: (data) => api.post('/bookings/lock', data),
    create: (data) => api.post('/bookings', data),
    getMyBookings: (params) => api.get('/bookings/my', { params }),
    getById: (id) => api.get(`/bookings/${id}`),
    confirm: (id, data) => api.put(`/bookings/${id}/confirm`, data),
    release: (id) => api.put(`/bookings/${id}/release`),
    cancelBooking: (id) => api.put(`/bookings/${id}/cancel`),
};

export const paymentService = {
    createOrder: (data) => api.post('/payment/create-order', data),
    verify: (data) => api.post('/payment/verify', data),
};

export const adminService = {
    getAnalytics: () => api.get('/admin/analytics'),
    getUsers: (params) => api.get('/admin/users', { params }),
    toggleUser: (id) => api.put(`/admin/users/${id}/toggle`),
    getBookings: (params) => api.get('/admin/bookings', { params }),
};

export const aiService = {
    generate: () => api.post('/ai/generate'),
    getSuggestions: (params) => api.get('/ai/suggestions', { params }),
    approve: (id) => api.put(`/ai/suggestions/${id}/approve`),
    reject: (id, data) => api.put(`/ai/suggestions/${id}/reject`, data),
    reapprove: (id) => api.put(`/ai/suggestions/${id}/reapprove`),
    getScheduleStatus: () => api.get('/ai/schedule-status'),
    executeSchedule: (data) => api.post('/ai/schedule', data),
};
