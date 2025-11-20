import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchAssessmentResponseUserAnswer = createAsyncThunk(
  'assessmentResponseCorrection/fetchAssessmentResponseUser',
  async ({ assessmentId, employeeId }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      // Assuming you need to pass employee_id as a query param or part of URL
      const response = await axios.get(`${API_URL}/api/responsecorrection/getResponsecorrectionData/${assessmentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { employeeId } // If API supports query param
      });

      return response.data;
    } catch (error) {
      //console.log("Slice Entry");
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch Response User.';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to Add Assessment Question
export const updateAssessmentResponseUserAnswer = createAsyncThunk('assessmentResponseCorrection/updateAssessmentResponseUserAnswer',
  async (correctionsData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;
 
      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      // Send JSON directly when no files
      const response = await axios.post(
        `${API_URL}/api/responsecorrection/update-question-answer-correction`,
        correctionsData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json', // JSON format for text-only
          },
        }
      );

      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to submit question answer.';
      return rejectWithValue(errorMessage);
    }
  }
);


const assessmentResponseCorrection = createSlice({
  name: 'assessmentResponseCorrection',
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
      .addCase(fetchAssessmentResponseUserAnswer.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAssessmentResponseUserAnswer.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload?.fetchquestion || action.payload || [];
        state.assessment = action.payload?.fetchassessment || action.payload || [];
      })
      .addCase(fetchAssessmentResponseUserAnswer.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.data = [];
      })

      //update question answer
       .addCase(updateAssessmentResponseUserAnswer.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateAssessmentResponseUserAnswer.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload?.caseData || action.payload || [];
      })
      .addCase(updateAssessmentResponseUserAnswer.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.data = [];
      })
      

  },
});

export const { optimisticUpdateCaseStatus, revertCaseStatus } = assessmentResponseCorrection.actions;
export default assessmentResponseCorrection.reducer;