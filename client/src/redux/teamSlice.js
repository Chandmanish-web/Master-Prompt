import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../api/axios';

export const getTeams = createAsyncThunk('teams/getTeams', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/teams');
    return response.data.teams;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to fetch teams');
  }
});

const teamSlice = createSlice({
  name: 'teams',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getTeams.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(getTeams.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(getTeams.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export default teamSlice.reducer;
