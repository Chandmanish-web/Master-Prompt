import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../api/axios';

export const getCalendarEvents = createAsyncThunk('calendar/getEvents', async ({ start, end }, { rejectWithValue }) => {
  try {
    const response = await api.get('/calendar', { params: { start: start.toISOString(), end: end.toISOString() } });
    return response.data.events;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to fetch calendar events');
  }
});

const calendarSlice = createSlice({
  name: 'calendar',
  initialState: { events: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getCalendarEvents.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(getCalendarEvents.fulfilled, (state, action) => { state.loading = false; state.events = action.payload; })
      .addCase(getCalendarEvents.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export default calendarSlice.reducer;
