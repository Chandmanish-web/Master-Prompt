import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../api/axios';

const initialState = {
  chats: [],
  activeChat: null,
  messages: [],
  loading: false,
  error: null,
  sending: false,
  hasMore: true,
  nextCursor: null,
};

export const fetchChats = createAsyncThunk('chat/fetchChats', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/chats');
    return response.data.chats;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to load chats');
  }
});

export const getOrCreateChat = createAsyncThunk('chat/getOrCreateChat', async (otherUserId, { rejectWithValue }) => {
  try {
    const response = await api.post('/chats', { otherUserId });
    return response.data.chat;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to start chat');
  }
});

export const fetchChatHistory = createAsyncThunk('chat/fetchChatHistory', async (chatId, { rejectWithValue }) => {
  try {
    const response = await api.get(`/chats/${chatId}`);
    return { chatId, messages: response.data.messages, nextCursor: response.data.nextCursor };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to load messages');
  }
});

export const sendMessage = createAsyncThunk('chat/sendMessage', async ({ chatId, text }, { rejectWithValue }) => {
  try {
    const response = await api.post(`/chats/${chatId}/messages`, { text });
    return response.data.chat;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to send message');
  }
});

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveChat: (state, action) => {
      state.activeChat = action.payload;
    },
    clearChatError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.loading = false;
        state.chats = action.payload;
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getOrCreateChat.fulfilled, (state, action) => {
        const exists = state.chats.some((chat) => chat._id === action.payload._id);
        if (!exists) {
          state.chats = [action.payload, ...state.chats];
        }
        state.activeChat = action.payload;
      })
      .addCase(fetchChatHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChatHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload.messages;
        state.nextCursor = action.payload.nextCursor;
        state.hasMore = Boolean(action.payload.nextCursor);
      })
      .addCase(fetchChatHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(sendMessage.pending, (state) => {
        state.sending = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sending = false;
        state.messages = action.payload.messages || state.messages;
        const updatedChat = action.payload;
        state.chats = state.chats.map((chat) => (chat._id === updatedChat._id ? updatedChat : chat));
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sending = false;
        state.error = action.payload;
      });
  },
});

export const { setActiveChat, clearChatError } = chatSlice.actions;
export default chatSlice.reducer;
