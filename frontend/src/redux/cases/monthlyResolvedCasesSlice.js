// src/features/cases/monthlyResolvedCasesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to fetch monthly resolved cases data
export const fetchMonthlyResolvedCases = createAsyncThunk(
  'monthlyResolvedCases/fetchMonthlyResolvedCases',
  async (employeeId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${API_URL}/api/cases/monthly-resolved/${employeeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch monthly resolved cases.';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to update a case's status
export const updateCaseStatus = createAsyncThunk(
  'monthlyResolvedCases/updateCaseStatus',
  async ({ caseId, newStatus }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const updateBody = { status: newStatus };

      const response = await axios.put(`${API_URL}/api/cases/update-status/${caseId}`, updateBody, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Return the entire updated case object from the API response
      return response.data; 

    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to update case status.';
      // Return the caseId and error message for the component to handle the revert
      return rejectWithValue({ caseId, error: errorMessage });
    }
  }
);

const monthlyResolvedCasesSlice = createSlice({
  name: 'monthlyResolvedCases',
  initialState: {
    data: [], // Stores the list of monthly resolved cases
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    // Reducer to handle optimistic UI update
    optimisticUpdateCaseStatus: (state, action) => {
      const { caseId, newStatus } = action.payload;
      const caseToUpdate = state.data.find(caseItem => caseItem.id === caseId);
      if (caseToUpdate) {
        caseToUpdate.status = newStatus;
      }
    },
    // Reducer to revert an optimistic update on failure
    revertCaseStatus: (state, action) => {
      const { caseId, originalCase } = action.payload;
      const caseToRevert = state.data.find(caseItem => caseItem.id === caseId);
      if (caseToRevert) {
        Object.assign(caseToRevert, originalCase);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateCaseStatus.fulfilled, (state, action) => {
        const updated = action.payload; // { id, status, completed_date }
        const idx = state.data.findIndex(c => c.id === updated.id);
        if (idx !== -1) {
          state.data[idx] = { ...state.data[idx], ...updated };
        }
      })
      // Handle fetchMonthlyResolvedCases
      .addCase(fetchMonthlyResolvedCases.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchMonthlyResolvedCases.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchMonthlyResolvedCases.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.data = [];
      })
      // Handle rejected case status update
      .addCase(updateCaseStatus.rejected, (state, action) => {
        // The component handles the revert, so we just log the error here
        //console.error("Case update failed:", action.payload.error);
      });
  },
});

export const { optimisticUpdateCaseStatus, revertCaseStatus } = monthlyResolvedCasesSlice.actions;
export default monthlyResolvedCasesSlice.reducer;