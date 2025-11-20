// frontend/src/redux/attendance/attendanceSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { logout } from '../auth/authSlice';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchEmployeeList = createAsyncThunk(
    'attendance/fetchEmployeeList',
    async ({ department, excludeRole }, { rejectWithValue, getState, dispatch }) => {
        try {
            const token = getState().auth?.token || localStorage.getItem('token');
            if (!token) {
                return rejectWithValue('No authentication token found.');
            }
            
            let url = `${API_BASE}/employees`;
            const params = new URLSearchParams();
            if (department) {
                params.append('department', department);
            }
            if (excludeRole) {
                params.append('excludeRole', excludeRole);
            }
            url += `?${params.toString()}`;

            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.data;
        } catch (err) {
            if (err.response?.status === 401 || err.response?.status === 403) {
                dispatch(logout());
            }
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const fetchDailyAttendance = createAsyncThunk(
    'attendance/fetchDailyAttendance',
    async ({ startDate, endDate, employeeId }, { rejectWithValue, getState, dispatch }) => {
        try {
            const token = getState().auth?.token || localStorage.getItem('token');

            if (!token) {
                return rejectWithValue('No authentication token found.');
            }

            let url = `${API_BASE}/attendance/range?startDate=${startDate}&endDate=${endDate}`;
            if (employeeId) {
                url += `&employeeId=${employeeId}`;
            }

            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            return res.data;
        } catch (err) {
            const status = err.response?.status;
            if (status === 401 || status === 403) {
                dispatch(logout());
                return rejectWithValue('Session expired. Please login again.');
            }
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

const attendanceSlice = createSlice({
    name: 'attendance',
    initialState: {
        data: [],
        employees: [],
        status: 'idle',
        employeeStatus: 'idle',
        error: null,
    },
    reducers: {
        clearAttendance(state) {
            state.data = [];
            state.status = 'idle';
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDailyAttendance.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchDailyAttendance.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.data = action.payload;
            })
            .addCase(fetchDailyAttendance.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(fetchEmployeeList.pending, (state) => {
                state.employeeStatus = 'loading';
            })
            .addCase(fetchEmployeeList.fulfilled, (state, action) => {
                state.employeeStatus = 'succeeded';
                state.employees = action.payload;
            })
            .addCase(fetchEmployeeList.rejected, (state, action) => {
                state.employeeStatus = 'failed';
                state.error = action.payload;
            });
    },
});

export const { clearAttendance } = attendanceSlice.actions;
export default attendanceSlice.reducer;