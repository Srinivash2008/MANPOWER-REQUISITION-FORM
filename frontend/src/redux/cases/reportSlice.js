import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunk to fetch email Template data
export const fetchReport = createAsyncThunk('report/fetchReport',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${API_URL}/api/cases/getreport`, {
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

const reportSlice = createSlice({
    name: 'report',
    initialState: {
        data: [],
        typeDetails: [], // Add this
        UserDetails: [], // Add this
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
            .addCase(fetchReport.pending, (state) => {
               state.status = 'loading';
               state.error = null;
            })
            .addCase(fetchReport.fulfilled, (state, action) => {
               state.status = 'succeeded';
               state.data = action.payload.fetchreport;
               state.typeDetails = action.payload.typeDetails;
               state.UserDetails = action.payload.UserDetails;
            })
            .addCase(fetchReport.rejected, (state, action) => {
               state.status = 'failed';
               state.error = action.payload;
               state.data = [];
               state.typeDetails = [];
               state.UserDetails = [];
            })
    },   
});

export const { optimisticUpdateCaseStatus, revertCaseStatus } = reportSlice.actions;
export default reportSlice.reducer;