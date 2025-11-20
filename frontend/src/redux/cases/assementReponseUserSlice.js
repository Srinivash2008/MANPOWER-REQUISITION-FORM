import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to fetch email Template data
export const fetchAssessmentResponseUser = createAsyncThunk(
  'assementReponseUser/fetchAssessmentResponseUser',
  async (assessmentId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      //console.log("Fetching Response User:", assessmentId);
      
      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${API_URL}/api/responseUser/getResponseUserData/${assessmentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      //console.log("Slice Entry");
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch Response User.';
      return rejectWithValue(errorMessage);
    }
  }
);


const assementReponseUser = createSlice({
  name: 'assementReponseUser',
  initialState: {
    data: [],
    assessment: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: { },
  extraReducers: (builder) => {
    builder
      // Fetch AccessmentData
      .addCase(fetchAssessmentResponseUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAssessmentResponseUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        //state.data = action.payload;
        state.data = action.payload?.fetchresponse || action.payload || [];
        state.assessment = action.payload?.fetchassessment || action.payload || [];
      })
      .addCase(fetchAssessmentResponseUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.data = [];
      })
      

  },
});

export const { optimisticUpdateCaseStatus, revertCaseStatus } = assementReponseUser.actions;
export default assementReponseUser.reducer;