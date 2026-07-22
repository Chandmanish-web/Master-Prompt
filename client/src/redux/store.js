import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import chatReducer from './chatSlice';
import attendanceReducer from './attendanceSlice';
import taskReducer from './taskSlice';
import leaveReducer from './leaveSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    attendance: attendanceReducer,
    tasks: taskReducer,
    leave: leaveReducer,
  },
});

export default store;
