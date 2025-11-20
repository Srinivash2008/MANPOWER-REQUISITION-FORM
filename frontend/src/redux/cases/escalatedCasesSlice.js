// src/redux/cases/escalatedCasesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to fetch escalated cases data
export const fetchEscalatedCases = createAsyncThunk(
  'escalatedCases/fetchEscalatedCases',
  async (employeeId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${API_URL}/api/cases_escalated/escalated/${employeeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch escalated cases.';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateCaseStatus = createAsyncThunk(
  'escalatedCases/updateCaseStatus',
  async ({ caseId, status, escalated_status, esc_resolved_team_name }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      // Pass all fields to backend
      const updateBody = { status, escalated_status, esc_resolved_team_name };

      const response = await axios.put(
        `${API_URL}/api/cases_escalated/update-status/${caseId}`,
        updateBody,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return { caseId, status, escalated_status, esc_resolved_team_name };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update case.';
      return rejectWithValue({ caseId, error: errorMessage });
    }
  }
);


const escalatedCasesSlice = createSlice({
  name: 'escalatedCases',
  initialState: {
    data: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    // Reducer to handle optimistic update in UI
    optimisticUpdateCaseStatus: (state, action) => {
      const { caseId, newStatus } = action.payload;
      state.data = state.data.map(caseItem =>
        caseItem.id === caseId ? { ...caseItem, status: newStatus } : caseItem
      );
    },
    // Reducer to revert an optimistic update on failure
    revertCaseStatus: (state, action) => {
      const { caseId, originalCase } = action.payload;
      state.data = state.data.map(caseItem =>
        caseItem.id === caseId ? originalCase : caseItem
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateCaseStatus.fulfilled, (state, action) => {
        const { id, status } = action.payload; // assuming API returns updated case
        const idx = state.data.findIndex(c => c.id === id);
        if (idx !== -1) {
          state.data[idx].status = status;
        }
      })
      // Handle fetchEscalatedCases
      .addCase(fetchEscalatedCases.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchEscalatedCases.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchEscalatedCases.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.data = [];
      });
  },
});

export const { optimisticUpdateCaseStatus, revertCaseStatus } = escalatedCasesSlice.actions;
export default escalatedCasesSlice.reducer;