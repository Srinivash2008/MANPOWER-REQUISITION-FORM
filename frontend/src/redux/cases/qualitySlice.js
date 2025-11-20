import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to fetch email Template data
export const fetchQuality = createAsyncThunk(
  'qualityView/fetchQuality',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${API_URL}/api/qualitydata/getqualityData`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to Quality Show.';
      return rejectWithValue(errorMessage);
    }
  }
);
// Async thunk to update a case's status
export const qualityupdateCaseStatus = createAsyncThunk(
  'qualityView/qualityupdateCaseStatus',
  async ({ caseId, newStatus }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const updateBody = { status: newStatus };

      const response = await axios.put(`${API_URL}/api/qualitydata/quality-update-status/${caseId}`, updateBody, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Return the entire updated case object from the API response
      return response.data; 

    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to update Quality status.';
      // Return the caseId and error message for the component to handle the revert
      return rejectWithValue({ caseId, error: errorMessage });
    }
  }
);
// --- New Discussion Thunks ---
export const fetchDiscussionTicket = createAsyncThunk(
  'qualityView/fetchDiscussionTicket',
  async (ticketId, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;

      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(
        `${API_URL}/api/qualitydata/discussion/${ticketId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        return rejectWithValue(error.response.data.message);
      }
      return rejectWithValue(error.message || 'Failed to fetch discussion ticket');
    }
  }
);

export const postQualityMessage = createAsyncThunk(
  'qualityView/postQualityMessage',
  async (sendData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      const response = await axios.post(
        `${API_URL}/api/qualitydata/quality-discussion`,
        sendData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (err) {
      if (err.response && err.response.data) {
        return rejectWithValue(err.response.data);
      }
      return rejectWithValue(err.message);
    }
  }
);

export const postReplayQualityMessage = createAsyncThunk(
  'qualityView/postReplayQualityMessage',
  async (sendData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      const response = await axios.post(
        `${API_URL}/api/qualitydata/quality-discussion-replay`,
        sendData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (err) {
      if (err.response && err.response.data) {
        return rejectWithValue(err.response.data);
      }
      return rejectWithValue(err.message);
    }
  }
);



const qualitySlice = createSlice({
  name: 'qualityView',
  initialState: {
    data: [],
    qualityDiscussion:[],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    // Reducer to handle optimistic UI update
    optimisticUpdateCaseStatus: (state, action) => {
      const { caseId, newStatus } = action.payload;
      const caseToUpdate = state.data.find(caseItem => caseItem.id === caseId);
      if (caseToUpdate) {
        caseToUpdate.status = newStatus;
      }
    },
    // Reducer to revert an optimistic update on failure
    revertCaseStatus: (state, action) => {
      const { caseId, originalCase } = action.payload;
      const caseToRevert = state.data.find(caseItem => caseItem.id === caseId);
      if (caseToRevert) {
        Object.assign(caseToRevert, originalCase);
      }
    },
   },
    extraReducers: (builder) => {
        builder
        // Fetch AccessmentData
        .addCase(fetchQuality.pending, (state) => {
            state.status = 'loading';
            state.error = null;
        })
        .addCase(fetchQuality.fulfilled, (state, action) => {
            state.status = action.payload?.status || 'succeeded';
            state.data   = action.payload?.qualityData || action.payload || [];
        })
        .addCase(fetchQuality.rejected, (state, action) => {
            state.status = 'failed';
            state.error = action.payload;
            state.data = [];
        })

        // --- Discussion Reducers ---
        .addCase(fetchDiscussionTicket.pending, (state) => {
            state.status = 'loading';
        })
        .addCase(fetchDiscussionTicket.fulfilled, (state, action) => {
            state.status = action.payload?.status || 'succeeded';
            state.qualityDiscussion   = action.payload?.fetchDiscussion || action.payload || [];
        })
        .addCase(fetchDiscussionTicket.rejected, (state, action) => {
            state.status = 'failed';
            state.error = action.payload;
        })

        //Discussion Added
        .addCase(postQualityMessage.pending, (state) => {
            state.status = 'loading';
        })
        .addCase(postQualityMessage.fulfilled, (state, action) => {
            state.status = action.payload?.status || 'succeeded';
            state.qualityDiscussion   = action.payload?.insertDiscussion || action.payload || [];
        })
        .addCase(postQualityMessage.rejected, (state, action) => {
            state.status = 'failed';
            state.error = action.payload;
        })

        //Discussion Replay
        .addCase(postReplayQualityMessage.pending, (state) => {
            state.status = 'loading';
        })
        .addCase(postReplayQualityMessage.fulfilled, (state, action) => {
            state.status = action.payload?.status || 'succeeded';
            state.qualityDiscussion   = action.payload?.replayDiscussion || action.payload || [];
        })
        .addCase(postReplayQualityMessage.rejected, (state, action) => {
            state.status = 'failed';
            state.error = action.payload;
        })

    },
});

export const { optimisticUpdateCaseStatus, revertCaseStatus } = qualitySlice.actions;
export default qualitySlice.reducer;