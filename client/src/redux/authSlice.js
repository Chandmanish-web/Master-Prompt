import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../api/axios';

const readStoredAuth = () => {
  try {
    const storedAuth = localStorage.getItem('worktrack-auth');
    if (!storedAuth) return null;
    return JSON.parse(storedAuth);
  } catch (error) {
    return null;
  }
};

const storedAuth = readStoredAuth();

const initialState = {
  user: storedAuth?.user || null,
  token: storedAuth?.token || null,
  isAuthenticated: Boolean(storedAuth?.token),
  loading: false,
  error: null,
};

export const loginUser = createAsyncThunk('auth/loginUser', async (credentials, { rejectWithValue }) => {
  try {
    console.log('loginUser: sending credentials ->', { email: credentials.email });
    const loginResponse = await api.post('/auth/login', credentials);
    console.log('loginUser: loginResponse ->', loginResponse?.data);
    const token = loginResponse.data.token;
    const meResponse = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('loginUser: meResponse ->', meResponse?.data);

    return {
      token,
      user: meResponse.data.user,
    };
  } catch (error) {
    console.error('loginUser: error ->', error?.response?.data || error.message || error);
    return rejectWithValue(error.response?.data?.message || 'Login failed');
  }
});

export const registerUser = createAsyncThunk('auth/registerUser', async (userData, { rejectWithValue }) => {
  try {
    const registerResponse = await api.post('/auth/register', userData);
    const token = registerResponse.data.token;
    const meResponse = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });

    return {
      token,
      user: meResponse.data.user,
    };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Registration failed');
  }
});

export const getCurrentUser = createAsyncThunk('auth/getCurrentUser', async (_, { getState, rejectWithValue }) => {
  try {
    const token = getState().auth.token || localStorage.getItem('worktrack-auth-token');

    if (!token) {
      return null;
    }

    const response = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });

    return {
      token,
      user: response.data.user,
    };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Session expired');
  }
});

const persistAuth = (token, user) => {
  localStorage.setItem('worktrack-auth', JSON.stringify({ token, user }));
  localStorage.setItem('worktrack-auth-token', token);
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('worktrack-auth');
      localStorage.removeItem('worktrack-auth-token');
    },
    setUserFromStorage: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = Boolean(action.payload.token);
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
        persistAuth(action.payload.token, action.payload.user);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
        persistAuth(action.payload.token, action.payload.user);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
          persistAuth(action.payload.token, action.payload.user);
        } else {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
          localStorage.removeItem('worktrack-auth');
          localStorage.removeItem('worktrack-auth-token');
        }
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload;
        localStorage.removeItem('worktrack-auth');
        localStorage.removeItem('worktrack-auth-token');
      });
  },
});

export const { logout, setUserFromStorage } = authSlice.actions;
export default authSlice.reducer;
