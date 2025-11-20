import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to fetch email Template data
export const fetchAssessmentQuestionForm = createAsyncThunk(
  'assementQuestion/fetchAssessmentQuestionForm',
  async (assessmentId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      //console.log("Fetching assessment_id:", assessmentId);
      
      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${API_URL}/api/questiondata/getquestionData/${assessmentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      //console.log("Slice Entry");
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch escalated cases.';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to Add Assessment Question
export const addAssessmentQuestion = createAsyncThunk('assementQuestion/addAssessmentQuestion',
  async (questionAddData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;
 
      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      // Send JSON directly when no files
      const response = await axios.post(
        `${API_URL}/api/questiondata/add-assessment-question`,
        questionAddData,
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
        error.response?.data?.message || error.message || 'Failed to submit batch case entries.';
      return rejectWithValue(errorMessage);
    }
  }
);
// update Assessmentdata
export const updateAssessmentQuestion = createAsyncThunk(
  'assementQuestion/updateAssessmentQuestion',
  async ( questiontEditData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;
      
      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.put(`${API_URL}/api/questiondata/update-assessment-question`, 
        questiontEditData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
      });
    
      return  response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update case.';
      return rejectWithValue({ questiontEditData, error: errorMessage });
    }
  }
);

// delete assessment form
export const deleteAssessmenQuestion = createAsyncThunk(
  'assementQuestion/deleteAssessmenQuestion',
  async ( deleteQuestiondata, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;
      
      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      const response = await axios.put(`${API_URL}/api/questiondata/delete-assessment-question`, 
        deleteQuestiondata, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
      });

      return  response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update case.';
      return rejectWithValue({ deleteFormdata, error: errorMessage });
    }
  }
);


const assementQuestionSlice = createSlice({
  name: 'assementQuestion',
  initialState: {
    data: [],
    assessment:[],
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
      // Fetch AccessmentData
      .addCase(fetchAssessmentQuestionForm.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAssessmentQuestionForm.fulfilled, (state, action) => {
        state.status = 'succeeded';
        //state.data = action.payload;
        state.data = action.payload?.fetchquestion || action.payload || [];
        state.assessment = action.payload?.fetchassessment || action.payload || [];
      })
      .addCase(fetchAssessmentQuestionForm.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.data = [];
      })
      

  },
});

export const { optimisticUpdateCaseStatus, revertCaseStatus } = assementQuestionSlice.actions;
export default assementQuestionSlice.reducer;