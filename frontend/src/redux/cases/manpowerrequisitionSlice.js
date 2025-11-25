import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to fetch email Template data
export const fetchManpowerRequisition = createAsyncThunk(
  'manpowerRequisition/fetchManpowerRequisition',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${API_URL}/api/cases/getmanpowerrequisition`, {
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

// Async thunk to fetch departments for the logged-in manager
export const fetchDepartmentsManagerId = createAsyncThunk(
  'manpowerRequisition/fetchDepartments',
  async (managerId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${API_URL}/api/mrf/departments-by-manager/${managerId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch departments.';
      return rejectWithValue(errorMessage);
    }
  }
);
// Async thunk to add a new Manpower Requisition Form entry
export const addManpowerRequisition = createAsyncThunk(
  'manpowerRequisition/addManpowerRequisition',
  async (mrfData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.post(
        `${API_URL}/api/mrf/add-manpower-requisition`,
        mrfData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data', // Important for file uploads
          },
        }
      );

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit MRF request.';
      return rejectWithValue(errorMessage);
    }
  }
);
const manpowerrequisitionSlice = createSlice({
  name: 'manpowerRequisition',
  initialState: {
    data: [],
    departments: [],
    status: 'idle',
    error: null,
  },
  reducers: { },
  extraReducers: (builder) => {
    builder

    .addCase(fetchManpowerRequisition.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    })
    .addCase(fetchManpowerRequisition.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.data = action.payload;
    })
    .addCase(fetchManpowerRequisition.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload;
      state.data = [];
    })

    // Handle fetchDepartments
    .addCase(fetchDepartmentsManagerId.pending, (state) => {
      state.status = 'loading';
    })
    .addCase(fetchDepartmentsManagerId.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.departments = action.payload;
    })
    .addCase(fetchDepartmentsManagerId.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload;
      state.departments = [];
    })

    // Handle addManpowerRequisition
    .addCase(addManpowerRequisition.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    })
    .addCase(addManpowerRequisition.fulfilled, (state, action) => {
      state.status = 'succeeded';
      // Add the new entry to the state so the UI can update if needed
      state.data.push(action.payload.mrfData);
    })
    .addCase(addManpowerRequisition.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload;
    })
  }
});


export default manpowerrequisitionSlice.reducer;