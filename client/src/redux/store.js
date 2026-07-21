import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import chatReducer from './chatSlice';
import attendanceReducer from './attendanceSlice';
import taskReducer from './taskSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    attendance: attendanceReducer,
    tasks: taskReducer,
  },
});

export default store;
