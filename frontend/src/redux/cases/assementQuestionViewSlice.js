import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to fetch email Template data
export const fetchAssessmentQuestionView = createAsyncThunk(
  'assementQuestionView/fetchAssessmentQuestionView',
  async (assessmentId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      //console.log("Fetching assessment_id:", assessmentId);
      
      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${API_URL}/api/questionview/getQuestionViewData/${assessmentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch Assessment View.';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to Add Assessment Question
export const updateUserQuestionAnswer = createAsyncThunk('assementQuestionView/updateUserQuestionAnswer',
  async (answersWithIds, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;
 
      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      // Send JSON directly when no files
      const response = await axios.post(
        `${API_URL}/api/questionview/update-question-answer`,
        answersWithIds,
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

const assementQuestionViewSlice = createSlice({
  name: 'assementQuestionView',
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
      .addCase(fetchAssessmentQuestionView.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAssessmentQuestionView.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload?.fetchquestion || action.payload || [];
        state.assessment = action.payload?.fetchassessment || action.payload || [];
      })
      .addCase(fetchAssessmentQuestionView.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.data = [];
      })
       
            
  },
});

export const { optimisticUpdateCaseStatus, revertCaseStatus } = assementQuestionViewSlice.actions;
export default assementQuestionViewSlice.reducer;