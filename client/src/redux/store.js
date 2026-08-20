import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import chatReducer from './chatSlice';
import attendanceReducer from './attendanceSlice';
import taskReducer from './taskSlice';
import leaveReducer from './leaveSlice';
import chatbotReducer from './chatbotSlice';
import calendarReducer from './calendarSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    attendance: attendanceReducer,
    tasks: taskReducer,
    leave: leaveReducer,
    chatbot: chatbotReducer,
    calendar: calendarReducer,
  },
});

export default store;
