import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';


export const fetchChatMessageList = createAsyncThunk(
  'manpowerRequisition/fetchChatMessageList',
  async (mrfId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;
      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(
        `${API_URL}/api/chatbox/get-chat-box-list/${mrfId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch user by emp_id.';
      return rejectWithValue(errorMessage);
    }
  }
);
export const sentChatboxMessage = createAsyncThunk(
    'manpowerRequisition/sentChatboxMessage',
    async (messageData , { rejectWithValue, getState }) => {
       try {
          const { auth } = getState();
          const token = auth.token;

          if (!token) {
            return rejectWithValue('Authentication token is missing.');
          }
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

          const response = await axios.post(
            `${API_URL}/api/chatbox/add-chatbox-message`, messageData,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
          );
          return response.data;
       } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to submit Chatbox Message.';
          return rejectWithValue(errorMessage);
       }
    }
);

export const fetchChatHRFHList = createAsyncThunk(
  'manpowerRequisition/fetchChatHRFHList',
  async (mrfId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;
      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(
        `${API_URL}/api/chatbox/get-hrfh-chat-box-list/${mrfId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch user by emp_id.';
      return rejectWithValue(errorMessage);
    }
  }
);

export const sentChatboxHRFHMessage = createAsyncThunk(
    'manpowerRequisition/sentChatboxHRFHMessage',
    async (messageData , { rejectWithValue, getState }) => {
       try {
          const { auth } = getState();
          const token = auth.token;

          if (!token) {
            return rejectWithValue('Authentication token is missing.');
          }
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

          const response = await axios.post(
            `${API_URL}/api/chatbox/add-hrfh-chatbox-message`, messageData,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
          );
          return response.data;
       } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to submit Chatbox Message.';
          return rejectWithValue(errorMessage);
       }
    }
);


const manpowerrequisitionChatSlice = createSlice({
  name: 'manpowerRequisitionChat',
  initialState: {
    data: [],
    query: null,
    status: 'idle',
    error: null,
  },
  reducers: { },
    extraReducers: (builder) => {
        builder
        .addCase(fetchChatMessageList.pending, (state) => {
            state.status = 'loading';
            state.error = null;
        })
        .addCase(fetchChatMessageList.fulfilled, (state, action) => {
            state.status = 'succeeded'; 
            state.data = action.payload;
        })
        .addCase(fetchChatMessageList.rejected, (state, action) => {
            state.status = 'failed';
            state.error = action.payload;
        })
        .addCase(sentChatboxMessage.pending, (state) => {
            state.status = 'loading';
            state.error = null;
        })
        .addCase(sentChatboxMessage.fulfilled, (state, action) => {
            state.status = 'succeeded'; 
            if (action.payload?.manpowerId) {
               state.data.push(action.payload.manpowerId); // ✅ object only
            }
        })
        .addCase(sentChatboxMessage.rejected, (state, action) => {
            state.status = 'failed';
            state.error = action.payload;
        })
        .addCase(fetchChatHRFHList.pending, (state) => {
            state.status = 'loading';
            state.error = null;
        })
        .addCase(fetchChatHRFHList.fulfilled, (state, action) => {
            state.status = 'succeeded'; 
            state.data = action.payload;
        })
        .addCase(fetchChatHRFHList.rejected, (state, action) => {
            state.status = 'failed';
            state.error = action.payload;
        })
        .addCase(sentChatboxHRFHMessage.pending, (state) => {
            state.status = 'loading';
            state.error = null;
        })
        .addCase(sentChatboxHRFHMessage.fulfilled, (state, action) => {
            state.status = 'succeeded'; 
            if (action.payload?.manpowerId) {
               state.data.push(action.payload.manpowerId); // ✅ object only
            }
        })
        .addCase(sentChatboxHRFHMessage.rejected, (state, action) => {
            state.status = 'failed';
            state.error = action.payload;
        })
    }
});


export default manpowerrequisitionChatSlice.reducer;