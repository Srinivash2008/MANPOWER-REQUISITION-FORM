// src/redux/dashboard/dashboardSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to fetch the dashboard summary data
export const fetchDashboardSummary = createAsyncThunk(
  'dashboard/fetchSummary',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      const response = await axios.get(`${API_URL}/api/dashboard/summary`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const receivedData = Array.isArray(response.data) ? response.data : [];
      const sortedData = receivedData.sort((a, b) => a.emp_id.localeCompare(b.emp_id));
      return sortedData;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch dashboard summary.';
      return rejectWithValue(errorMessage);
    }
  }
);

/* export const fetchShiftNotification = createAsyncThunk(
    'dashboard/fetchShiftNotification',
    async (_, { rejectWithValue, getState }) => {
        try {
          
            const { auth } = getState();
            const token = auth.token;

            if (!token) {
              return rejectWithValue('Authentication token is missing.');
            }
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const response = await axios.get(`${API_URL}/api/dashboard/fetch-shift-notification`,  {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
); */

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    summary: [],
    //shiftnotifycount: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardSummary.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.summary = action.payload;
      })
      .addCase(fetchDashboardSummary.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.summary = [];
      })
      /*  .addCase(fetchShiftNotification.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchShiftNotification.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.shiftnotifycount = action.payload;
      })
      .addCase(fetchShiftNotification.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.shiftnotifycount = [];
      });  */
  },
});

export default dashboardSlice.reducer;