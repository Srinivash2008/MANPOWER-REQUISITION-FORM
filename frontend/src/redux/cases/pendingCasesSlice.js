// src/redux/cases/pendingCasesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to fetch pending cases data
export const fetchPendingCases = createAsyncThunk(
  'pendingCases/fetchPendingCases',
  async (employeeId, { rejectWithValue, getState }) => {
    try {
      //console.log("Fetching Pending Cases for Employee ID:", employeeId);
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${API_URL}/api/cases/pending/${employeeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      //console.log("Fetched Pending Cases responses:", response.data);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch pending cases.';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to update case status
export const updateCaseStatus = createAsyncThunk(
  'pendingCases/updateCaseStatus',
  async ({ caseId, newStatus }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const updateBody = {
        status: newStatus,
        completed_date: newStatus === 'Resolved' ? new Date().toISOString().split('T')[0] : null,
      };

      const response = await axios.put(
        `${API_URL}/api/cases/update-status/${caseId}`,
        updateBody,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return { caseId, newStatus, message: response.data.message };

    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to update case status.';
      return rejectWithValue({ caseId, error: errorMessage });
    }
  }
);


const pendingCasesSlice = createSlice({
  name: 'pendingCases',
  initialState: {
    data: [], // Stores the list of pending cases
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    // Reducer to manually remove a case from state (for optimistic updates)
    removeCaseFromList: (state, action) => {
      const caseIdToRemove = action.payload;
      state.data = state.data.filter(caseItem => caseItem.id !== caseIdToRemove);
    },
    // Reducer to revert case status on error (for optimistic updates)
    revertCaseStatus: (state, action) => {
      const { caseId, originalCase } = action.payload;
      state.data = state.data.map(caseItem =>
        caseItem.id === caseId ? originalCase : caseItem
      );
    },
    // Reducer to handle optimistic update for status change
    optimisticUpdateCaseStatus: (state, action) => {
        const { caseId, newStatus } = action.payload;
        state.data = state.data.map(caseItem => 
            caseItem.id === caseId ? { ...caseItem, status: newStatus } : caseItem
        );
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchPendingCases
      .addCase(fetchPendingCases.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchPendingCases.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchPendingCases.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.data = [];
      })
      // Handle updateCaseStatus
      .addCase(updateCaseStatus.pending, (state) => {
        // We're doing an optimistic update in the component, so no need to change status here
      })
      .addCase(updateCaseStatus.fulfilled, (state, action) => {
        // The optimistic update already happened. If the status is no longer "Pending",
        // the component itself will filter it out, or you could add a 'refetch' logic.
        // For simplicity and to match previous component logic, we'll let the component filter.
        // If the newStatus is NOT 'Pending', the case will be removed from the filtered list in the component.
        // If you need more complex state management after update, you'd handle it here.
      })
      .addCase(updateCaseStatus.rejected, (state, action) => {
        // The component will handle reverting the optimistic update on failure.
        // You could also add a global error here if needed.
        //console.error("Failed to update status via Redux thunk:", action.payload);
      });
  },
});

export const { removeCaseFromList, revertCaseStatus, optimisticUpdateCaseStatus } = pendingCasesSlice.actions;
export default pendingCasesSlice.reducer;