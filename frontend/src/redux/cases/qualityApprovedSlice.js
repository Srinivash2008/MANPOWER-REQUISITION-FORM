import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to fetch email Template data
export const fetchQualityApproved = createAsyncThunk(
  'qualityApproved/fetchQualityApproved',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${API_URL}/api/qualityapproved/getqualityapprovedData`, {
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

// --- New Approved Discussion Thunks ---
export const fetchApprovedDiscussionTicket = createAsyncThunk(
  'qualityApproved/fetchApprovedDiscussionTicket',
  async (ticketId, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(
        `${API_URL}/api/qualityapproved/approveddiscussion/${ticketId}`,
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

export const postApprovedQualityMessage = createAsyncThunk(
  'qualityApproved/postApprovedQualityMessage',
  async (sendData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      const response = await axios.post(
        `${API_URL}/api/qualityapproved/quality-approved-discussion`,
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

export const postApprovedReplayQualityMessage = createAsyncThunk(
  'qualityApproved/postApprovedReplayQualityMessage',
  async (sendData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      const response = await axios.post(
        `${API_URL}/api/qualityapproved/quality-approved-discussion-replay`,
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

const qualityApprovedSlice = createSlice({
  name: 'qualityApproved',
  initialState: {
    data: [],
    approvedData:[],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: { },
    extraReducers: (builder) => {
        builder
        // Fetch AccessmentData
        .addCase(fetchQualityApproved.pending, (state) => {
            state.status = 'loading';
            state.error = null;
        })
        .addCase(fetchQualityApproved.fulfilled, (state, action) => {
            state.status = action.payload?.status || 'succeeded';
            state.data   = action.payload?.qualityApprovedData || action.payload || [];

        })
        .addCase(fetchQualityApproved.rejected, (state, action) => {
            state.status = 'failed';
            state.error = action.payload;
            state.data = [];
        })

        // --- Discussion Reducers ---
        .addCase(fetchApprovedDiscussionTicket.pending, (state) => {
            state.status = 'loading';
        })
        .addCase(fetchApprovedDiscussionTicket.fulfilled, (state, action) => {
            state.status = action.payload?.status || 'succeeded';
            state.approvedData   = action.payload?.qualityApprovedData || action.payload || [];
        })
        .addCase(fetchApprovedDiscussionTicket.rejected, (state, action) => {
            state.status = 'failed';
            state.error = action.payload;
        })
        //Discussion Added
        .addCase(postApprovedQualityMessage.pending, (state) => {
            state.status = 'loading';
        })
        .addCase(postApprovedQualityMessage.fulfilled, (state, action) => {
            state.status = action.payload?.status || 'succeeded';
            state.approvedData   = action.payload?.insertDiscussion || action.payload || [];
        })
        .addCase(postApprovedQualityMessage.rejected, (state, action) => {
            state.status = 'failed';
            state.error = action.payload;
        })
        
        //Discussion Replay
        .addCase(postApprovedReplayQualityMessage.pending, (state) => {
            state.status = 'loading';
        })
        .addCase(postApprovedReplayQualityMessage.fulfilled, (state, action) => {
            state.status = action.payload?.status || 'succeeded';
            state.approvedData   = action.payload?.replayDiscussion || action.payload || [];
        })
        .addCase(postApprovedReplayQualityMessage.rejected, (state, action) => {
            state.status = 'failed';
            state.error = action.payload;
        })
    },
});

export const { optimisticUpdateCaseStatus, revertCaseStatus } = qualityApprovedSlice.actions;
export default qualityApprovedSlice.reducer;