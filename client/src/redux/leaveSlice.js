import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../api/axios';

export const applyLeave = createAsyncThunk('leave/applyLeave', async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post('/leaves', payload);
    return response.data.leave;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to apply for leave');
  }
});

export const getMyLeaves = createAsyncThunk('leave/getMyLeaves', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/leaves/my');
    return response.data.leaves;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch leaves');
  }
});

export const getPendingLeaves = createAsyncThunk('leave/getPendingLeaves', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/leaves/pending');
    return response.data.leaves;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending leaves');
  }
});

export const updateLeaveStatus = createAsyncThunk('leave/updateLeaveStatus', async ({ leaveId, status }, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/leaves/${leaveId}/status`, { status });
    return response.data.leave;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update leave status');
  }
});

const initialState = {
  myLeaves: [],
  pendingLeaves: [],
  leaveBalance: 0,
  loading: false,
  error: null,
};

const leaveSlice = createSlice({
  name: 'leave',
  initialState,
  reducers: {
    setLeaveBalance: (state, action) => {
      state.leaveBalance = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(applyLeave.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyLeave.fulfilled, (state, action) => {
        state.loading = false;
        state.myLeaves.unshift(action.payload);
      })
      .addCase(applyLeave.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getMyLeaves.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyLeaves.fulfilled, (state, action) => {
        state.loading = false;
        state.myLeaves = action.payload;
      })
      .addCase(getMyLeaves.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getPendingLeaves.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPendingLeaves.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingLeaves = action.payload;
      })
      .addCase(getPendingLeaves.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateLeaveStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLeaveStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updatedLeave = action.payload;
        state.pendingLeaves = state.pendingLeaves.filter((leave) => leave._id !== updatedLeave._id);
        state.myLeaves = state.myLeaves.map((leave) => (leave._id === updatedLeave._id ? updatedLeave : leave));
      })
      .addCase(updateLeaveStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setLeaveBalance } = leaveSlice.actions;
export default leaveSlice.reducer;
