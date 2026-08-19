import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../api/axios';
import { getSocket } from '../socket/socket';

const initialState = {
  today: null,
  report: [],
  loading: false,
  error: null,
};

export const checkIn = createAsyncThunk('attendance/checkIn', async (_, { rejectWithValue, getState }) => {
  try {
    const response = await api.post('/attendance/check-in');
    
    // Emit real-time event
    const socket = getSocket();
    const user = getState().auth.user;
    if (socket) {
      socket.emit('attendance:checkin', {
        userId: user?.id,
        userName: user?.name,
        checkInTime: response.data.attendance.checkIn,
        status: response.data.attendance.status,
      });
    }
    
    return response.data.attendance;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to check in');
  }
});

export const checkOut = createAsyncThunk('attendance/checkOut', async (_, { rejectWithValue, getState }) => {
  try {
    const response = await api.post('/attendance/check-out');
    
    // Emit real-time event
    const socket = getSocket();
    const user = getState().auth.user;
    if (socket) {
      socket.emit('attendance:checkout', {
        userId: user?.id,
        userName: user?.name,
        checkOutTime: response.data.attendance.checkOut,
      });
    }
    
    return response.data.attendance;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to check out');
  }
});

export const getTodayAttendance = createAsyncThunk('attendance/getToday', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/attendance/today');
    return response.data.attendance;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to fetch attendance');
  }
});

export const getAttendanceReport = createAsyncThunk('attendance/getReport', async ({ userId, month }, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (month) params.append('month', month);
    const response = await api.get(`/attendance/report?${params.toString()}`);
    return response.data.records;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to fetch report');
  }
});

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(checkIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkIn.fulfilled, (state, action) => {
        state.loading = false;
        state.today = action.payload;
      })
      .addCase(checkIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(checkOut.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkOut.fulfilled, (state, action) => {
        state.loading = false;
        state.today = action.payload;
      })
      .addCase(checkOut.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getTodayAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTodayAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.today = action.payload;
      })
      .addCase(getTodayAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAttendanceReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAttendanceReport.fulfilled, (state, action) => {
        state.loading = false;
        state.report = action.payload;
      })
      .addCase(getAttendanceReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default attendanceSlice.reducer;
