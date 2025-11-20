import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to fetch email Template data
export const fetchAssessmentForm = createAsyncThunk(
  'assessmentData/fetchAssessmentForm',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${API_URL}/api/formdata/getassessmentData`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      //console.log("Slice Entry");
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch Assessment .';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to Add Email Template status
export const addAssessmentForm = createAsyncThunk('assessmentData/addAssessmentForm',
  async (assessmentAddData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;
 
      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      // Send JSON directly when no files
      const response = await axios.post(
        `${API_URL}/api/formdata/add-assessment-form`,
        assessmentAddData,
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
        error.response?.data?.message || error.message || 'Failed to submit Assessment entries.';
      return rejectWithValue(errorMessage);
    }
  }
);

// update Assessmentdata
export const updateAssessmentData = createAsyncThunk(
  'assessmentData/updateAssessmentData',
  async ( assessmentEditData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;
      
      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      const response = await axios.put(`${API_URL}/api/formdata/update-assessment-form`, 
        assessmentEditData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
      });
    
      return  response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update Assessment.';
      return rejectWithValue({ assessmentEditData, error: errorMessage });
    }
  }
);

// delete assessment form
export const deleteAssessmentData = createAsyncThunk(
  'assessmentData/deleteAssessmentData',
  async ( deleteFormdata, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;
      
      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      const response = await axios.put(`${API_URL}/api/formdata/delete-assessment-form`, 
        deleteFormdata, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
      });

      return  response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update Assessment.';
      return rejectWithValue({ deleteFormdata, error: errorMessage });
    }
  }
);

//sent assessment Data
export const sendAssessmentData = createAsyncThunk('assessmentData/sendAssessmentData',
  async (sendFormData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;
 
      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      // Send JSON directly when no files
      const response = await axios.put(
        `${API_URL}/api/formdata/send-assessment-form`,
        sendFormData,
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
        error.response?.data?.message || error.message || 'Failed to Send Assessment Assign.';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to fetch User AssessmentView
export const fetchAssessmentViewForm = createAsyncThunk(
  'assessmentData/fetchAssessmentViewForm',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${API_URL}/api/formdata/getAssessmentViewData`, {
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

export const fetchAssessmentNotificationViewForm = createAsyncThunk(
  'assessmentData/fetchAssessmentNotificationViewForm',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }
      

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${API_URL}/api/formdata/getAssessmentNotificationViewData`, {
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


const assessmentDataSlice = createSlice({
  name: 'assessmentData',
  initialState: {
    data: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: { },
  extraReducers: (builder) => {
    builder
      // Fetch AccessmentData
      .addCase(fetchAssessmentForm.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAssessmentForm.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data   = action.payload?.assessmentData || action.payload || [];
      })
      .addCase(fetchAssessmentForm.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.data = [];
      })
      //add AccessmentData
      .addCase(addAssessmentForm.pending, (state) => {
        state.status = 'loading';
        state.error  = null;    
      })
      .addCase(addAssessmentForm.fulfilled, (state, action) => {
        state.status = 'succeeded';
        //state.data = action.payload?.caseData || state.data;
        if (action.payload?.caseData) {
          state.data.push(action.payload.caseData);  // ✅ Add new record into array
        }
      })
      .addCase(addAssessmentForm.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.data = [];
      })
      //update Assessment
      .addCase(updateAssessmentData.pending, (state) => {
        state.status = 'loading';
        state.error  = null;    
      })
      .addCase(updateAssessmentData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        //state.data = action.payload?.caseData || state.data;
        if (action.payload?.caseData) {
          state.data = state.data.map((item) =>
            item.assessment_id === action.payload.caseData.assessment_id
              ? action.payload.caseData
              : item
          );
        }
      })
      .addCase(updateAssessmentData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.data = [];
      })
      //delete Assessment
      .addCase(deleteAssessmentData.pending, (state) => {
        state.status = 'loading';
        state.error  = null;    
      })
      .addCase(deleteAssessmentData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        //state.data = action.payload?.caseData || state.data;
        if (action.payload?.caseData) {
          state.data = state.data.filter(
            (item) => item.assessment_id !== action.payload.caseData.assessment_id
          );
        }
      })
      .addCase(deleteAssessmentData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.data = [];
      })

      //Save Assessment
      .addCase(sendAssessmentData.pending, (state) => {
        state.status = 'loading';
        state.error  = null;    
      })
      .addCase(sendAssessmentData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload?.caseData) {
          state.data = state.data.map((item) =>
            item.assessment_id === action.payload.caseData.assessment_id
              ? action.payload.caseData
              : item
          );
        }
      })
      .addCase(sendAssessmentData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.data = [];
      })

      // Fetch AccessmentViewData
      .addCase(fetchAssessmentViewForm.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAssessmentViewForm.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload?.caseData || action.payload || [];
        
      })
      .addCase(fetchAssessmentViewForm.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.data = [];
      })

      // Fetch AccessmentNotificationViewData
      /* .addCase(fetchAssessmentNotificationViewForm.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAssessmentNotificationViewForm.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload || action.payload || [];
        
      })
      .addCase(fetchAssessmentNotificationViewForm.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.data = [];
      });  */

  },
});

export const { optimisticUpdateCaseStatus, revertCaseStatus } = assessmentDataSlice.actions;
export default assessmentDataSlice.reducer;