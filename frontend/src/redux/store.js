// frontend/src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../redux/auth/authSlice';
import manpowerRequisitionReducer from '../redux/cases/manpowerrequisitionSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    manpowerRequisition: manpowerRequisitionReducer,
  },
});