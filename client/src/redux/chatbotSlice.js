import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../api/axios';

export const getChatbotHistory = createAsyncThunk('chatbot/getHistory', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/chatbot/history');
    return response.data.messages;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to load assistant history');
  }
});

export const sendChatbotMessage = createAsyncThunk('chatbot/sendMessage', async (message, { rejectWithValue }) => {
  try {
    const response = await api.post('/chatbot/message', { message });
    return response.data.messages;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to contact the HR assistant');
  }
});

const chatbotSlice = createSlice({
  name: 'chatbot',
  initialState: { messages: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getChatbotHistory.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(getChatbotHistory.fulfilled, (state, action) => { state.loading = false; state.messages = action.payload; })
      .addCase(getChatbotHistory.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(sendChatbotMessage.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(sendChatbotMessage.fulfilled, (state, action) => { state.loading = false; state.messages.push(...action.payload); })
      .addCase(sendChatbotMessage.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export default chatbotSlice.reducer;
