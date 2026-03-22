import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    movies: [],
    trendingMovies: [],
    currentMovie: null,
    loading: false,
    trendingLoading: false,
    error: null,
    pagination: { page: 1, limit: 12, total: 0, pages: 0 },
    filters: { search: '', genre: '', language: '' },
};

const movieSlice = createSlice({
    name: 'movies',
    initialState,
    reducers: {
        fetchMoviesStart: (state) => { state.loading = true; state.error = null; },
        fetchMoviesSuccess: (state, action) => {
            state.loading = false;
            state.movies = action.payload.data;
            state.pagination = action.payload.pagination;
        },
        fetchMoviesFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        fetchTrendingStart: (state) => { state.trendingLoading = true; },
        fetchTrendingSuccess: (state, action) => {
            state.trendingLoading = false;
            state.trendingMovies = action.payload;
        },
        setCurrentMovie: (state, action) => { state.currentMovie = action.payload; },
        setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
        clearFilters: (state) => { state.filters = { search: '', genre: '', language: '' }; },
    },
});

export const {
    fetchMoviesStart, fetchMoviesSuccess, fetchMoviesFailure,
    fetchTrendingStart, fetchTrendingSuccess,
    setCurrentMovie, setFilters, clearFilters,
} = movieSlice.actions;
export default movieSlice.reducer;
