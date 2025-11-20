import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to fetch email Template data
export const fetchEmailTemplate = createAsyncThunk(
  'emailTemplate/fetchEmailTemplate',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${API_URL}/api/cases/getemailtemplate`, {
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

// Async thunk to Add Email Template status
export const addEmailTemplate = createAsyncThunk('emailTemplate/addEmailTemplate',
  async (emailData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;
 
      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      // Send JSON directly when no files
      const response = await axios.post(
        `${API_URL}/api/cases/add-email-template`,
        emailData,
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


// Async thunk to update a case's status
export const updateEmailTemplate = createAsyncThunk(
  'emailTemplate/updateEmailTemplate',
  async ( editemailData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;
      
      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      const response = await axios.put(`${API_URL}/api/cases/update-email-template`, 
        editemailData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
      });

      return  response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update case.';
      return rejectWithValue({ editemailData, error: errorMessage });
    }
  }
);

// Async thunk to delete email template
export const deleteEmailTemplate = createAsyncThunk(
  'emailTemplate/deleteEmailTemplate',
  async ( deleteemaildata, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;
      
      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      const response = await axios.put(`${API_URL}/api/cases/delete-email-template`, 
        deleteemaildata, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
      });

      return  response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update case.';
      return rejectWithValue({ editemailData, error: errorMessage });
    }
  }
);

const emailTemplateSlice = createSlice({
  name: 'emailTemplate',
  initialState: {
    data: [],
    emailCount: 0,
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
      // Handle fetchEscalatedCases
      .addCase(fetchEmailTemplate.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchEmailTemplate.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
        state.emailCount = action.payload.length;
      })
      .addCase(fetchEmailTemplate.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.data = [];
      })
      //add email template
      .addCase(addEmailTemplate.pending, (state) => {
        state.status = 'loading';
        state.error  = null;    
      })
      .addCase(addEmailTemplate.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(addEmailTemplate.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.data = [];
      })
      //update email template  
      .addCase(updateEmailTemplate.pending, (state) => {
        state.status = 'loading';
        state.error  = null;    
      })
      .addCase(updateEmailTemplate.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(updateEmailTemplate.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.data = [];
      })
      //delete email function
      .addCase(deleteEmailTemplate.pending, (state) => {
        state.status = 'loading';
        state.error  = null;    
      })
      .addCase(deleteEmailTemplate.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(deleteEmailTemplate.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.data = [];
      });


  },
});

export const { optimisticUpdateCaseStatus, revertCaseStatus } = emailTemplateSlice.actions;
export default emailTemplateSlice.reducer;