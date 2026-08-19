import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../api/axios';
import { getSocket } from '../socket/socket';

const initialState = {
  myTasks: [],
  teamTasks: [],
  teamMembers: [],
  loading: false,
  error: null,
};

export const createTask = createAsyncThunk('tasks/createTask', async (taskData, { rejectWithValue }) => {
  try {
    const response = await api.post('/tasks', taskData);
    const task = response.data.task;
    getSocket()?.emit('task:created', task);
    return task;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to create task');
  }
});

export const getMyTasks = createAsyncThunk('tasks/getMyTasks', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/tasks/mine');
    return response.data.tasks;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to fetch tasks');
  }
});

export const getTeamTasks = createAsyncThunk('tasks/getTeamTasks', async (status, { rejectWithValue }) => {
  try {
    const params = status ? `?status=${encodeURIComponent(status)}` : '';
    const response = await api.get(`/tasks/team${params}`);
    return response.data.tasks;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to fetch team tasks');
  }
});

export const getTeamMembers = createAsyncThunk('tasks/getTeamMembers', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/auth/team');
    return response.data.members;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to fetch team members');
  }
});

export const startTask = createAsyncThunk('tasks/startTask', async (taskId, { rejectWithValue }) => {
  try {
    const response = await api.put(`/tasks/${taskId}/start`);
    const task = response.data.task;
    getSocket()?.emit('task:statusChanged', { taskId: task._id, status: task.status, assignedTo: task.assignedTo?._id || task.assignedTo });
    return task;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to start task');
  }
});

export const submitTask = createAsyncThunk('tasks/submitTask', async ({ taskId, text, fileUrl }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/tasks/${taskId}/submit`, { text, fileUrl });
    const task = response.data.task;
    getSocket()?.emit('task:updated', task);
    getSocket()?.emit('task:statusChanged', { taskId: task._id, status: task.status, assignedTo: task.assignedTo?._id || task.assignedTo });
    return task;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to submit task');
  }
});

export const reviewTask = createAsyncThunk('tasks/reviewTask', async ({ taskId, decision, rating, feedback }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/tasks/${taskId}/review`, { decision, rating, feedback });
    const task = response.data.task;
    getSocket()?.emit('task:updated', task);
    getSocket()?.emit('task:statusChanged', { taskId: task._id, status: task.status, assignedTo: task.assignedTo?._id || task.assignedTo });
    return task;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to review task');
  }
});

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearTaskError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.teamTasks = [action.payload, ...state.teamTasks];
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getMyTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.myTasks = action.payload;
      })
      .addCase(getMyTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getTeamTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTeamTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.teamTasks = action.payload;
      })
      .addCase(getTeamTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getTeamMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTeamMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.teamMembers = action.payload;
      })
      .addCase(getTeamMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(startTask.fulfilled, (state, action) => {
        state.myTasks = state.myTasks.map((task) => (task._id === action.payload._id ? action.payload : task));
        state.teamTasks = state.teamTasks.map((task) => (task._id === action.payload._id ? action.payload : task));
      })
      .addCase(submitTask.fulfilled, (state, action) => {
        state.myTasks = state.myTasks.map((task) => (task._id === action.payload._id ? action.payload : task));
        state.teamTasks = state.teamTasks.map((task) => (task._id === action.payload._id ? action.payload : task));
      })
      .addCase(reviewTask.fulfilled, (state, action) => {
        state.teamTasks = state.teamTasks.map((task) => (task._id === action.payload._id ? action.payload : task));
      });
  },
});

export const { clearTaskError } = taskSlice.actions;
export default taskSlice.reducer;
