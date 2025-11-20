// src/redux/cases/todayCasesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to fetch today's cases
export const fetchTodayCases = createAsyncThunk(
  'todayCases/fetchTodayCases',
  async (employeeId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(
        `${API_URL}/api/cases/today/${employeeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch today's cases.";
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to update a case's status
export const updateCaseStatus = createAsyncThunk(
  'todayCases/updateCaseStatus',
  async ({ caseId, newStatus }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.put(
        `${API_URL}/api/cases/update-status/${caseId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Return the info needed to update Redux state
      return {
        caseId,
        newStatus,
        completed_date: response.data.completed_date,
      };
    } catch (error) {
      return rejectWithValue({ caseId, error: error.message });
    }
  }
);

const todayCasesSlice = createSlice({
  name: 'todayCases',
  initialState: {
    data: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    // Optimistic update in UI
    optimisticUpdateCaseStatus: (state, action) => {
      const { caseId, newStatus } = action.payload;
      state.data = state.data.map((caseItem) =>
        caseItem.id === caseId
          ? { ...caseItem, status: newStatus }
          : caseItem
      );
    },
    // Revert on API failure
    revertCaseStatus: (state, action) => {
      const { caseId, originalCase } = action.payload;
      state.data = state.data.map((caseItem) =>
        caseItem.id === caseId ? originalCase : caseItem
      );
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchTodayCases
      .addCase(fetchTodayCases.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTodayCases.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchTodayCases.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.data = [];
      })
      // Handle updateCaseStatus
      .addCase(updateCaseStatus.fulfilled, (state, action) => {
        const { caseId, newStatus, completed_date } = action.payload;
        const index = state.data.findIndex(
          (c) => c.id === caseId || String(c.id) === String(caseId)
        );
        if (index !== -1) {
          state.data[index] = {
            ...state.data[index],
            status: newStatus,
            completed_date: completed_date ?? state.data[index].completed_date,
          };
        }
      });
  },
});

export const { optimisticUpdateCaseStatus, revertCaseStatus } =
  todayCasesSlice.actions;

export default todayCasesSlice.reducer;
