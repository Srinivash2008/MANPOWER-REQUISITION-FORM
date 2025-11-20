import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// --- Thunks for CRUD Operations ---

// Fetch all case entries
export const fetchCaseEntries = createAsyncThunk(
  'customerCase/fetchCaseEntries',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.get(`${API_URL}/api/customarecases`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to fetch case entries.');
    }
  }
);

// Create a new case entry
export const createCaseEntry = createAsyncThunk(
  'customerCase/createCaseEntry',
  async (caseData, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.post(`${API_URL}/api/customarecases`, caseData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to create case entry.');
    }
  }
);

// Update an existing case entry
export const updateCaseEntry = createAsyncThunk(
  'customerCase/updateCaseEntry',
  async ({ id, caseData }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.put(`${API_URL}/api/customarecases/${id}`, caseData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to update case entry.');
    }
  }
);

// Soft Delete a case entry
export const deleteCaseEntry = createAsyncThunk(
  'customerCase/deleteCaseEntry',
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      await axios.delete(`${API_URL}/api/customarecases/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return id; // Return the deleted ID
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to delete case entry.');
    }
  }
);

// Fetch employee list for the dropdown
export const fetchEmployeesForCase = createAsyncThunk(
  'customerCase/fetchEmployeesForCase',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.get(`${API_URL}/api/customarecases/employees/names`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to fetch employee list.');
    }
  }
);


// --- Slice Definition ---
const customerCaseSlice = createSlice({
  name: 'customerCase',
  initialState: {
    entries: [],
    employees: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Case Entries
      .addCase(fetchCaseEntries.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchCaseEntries.fulfilled, (state, action) => { state.status = 'succeeded'; state.entries = action.payload; })
      .addCase(fetchCaseEntries.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; })

      // Create Case Entry
      .addCase(createCaseEntry.fulfilled, (state, action) => {
        state.entries.unshift(action.payload);
      })
      
      // Update Case Entry
      .addCase(updateCaseEntry.fulfilled, (state, action) => {
        const index = state.entries.findIndex(entry => entry.custom_case_pid === action.payload.custom_case_pid);
        if (index !== -1) {
          state.entries[index] = action.payload;
        }
      })
      
      // Delete Case Entry (Soft Delete)
      .addCase(deleteCaseEntry.fulfilled, (state, action) => {
        state.entries = state.entries.filter(entry => entry.custom_case_pid !== action.payload);
      })

      // Fetch Employees
      .addCase(fetchEmployeesForCase.fulfilled, (state, action) => {
        state.employees = action.payload;
      });
  },
});

export default customerCaseSlice.reducer;