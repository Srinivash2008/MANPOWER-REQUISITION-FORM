import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const fetchAdminUpdates = createAsyncThunk(
  'systemUpdates/fetchAdminUpdates',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.get(`${API_URL}/api/system-updates/admin`, { headers: { Authorization: `Bearer ${token}` } });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);


// ** THUNK FOR SYSTEM UPDATES **
export const fetchSystemUpdates = createAsyncThunk(
  'systemUpdates/fetchSystemUpdates',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.get(`${API_URL}/api/system-updates/system`, { headers: { Authorization: `Bearer ${token}` } });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);

    }
  }
);

// ** THUNK FOR KNOWLEDGE BASE UPDATES **
export const fetchKnowledgeBaseUpdates = createAsyncThunk(
  'systemUpdates/fetchKnowledgeBaseUpdates',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.get(`${API_URL}/api/system-updates/knowledge-base`, { headers: { Authorization: `Bearer ${token}` } });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);

    }
  }
);

// ** THUNK FOR TRAINING DISCUSSION UPDATES **
export const fetchTrainingDiscussionUpdates = createAsyncThunk(
  'systemUpdates/fetchTrainingDiscussionUpdates',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.get(`${API_URL}/api/system-updates/training-discussion`, { headers: { Authorization: `Bearer ${token}` } });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);

    }
  }
);


export const fetchUserUpdates = createAsyncThunk(
  'systemUpdates/fetchUserUpdates',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.get(`${API_URL}/api/system-updates/user`, { headers: { Authorization: `Bearer ${token}` } });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);

    }
  }
);

export const createUpdate = createAsyncThunk(
  'systemUpdates/createUpdate',
  async (formData, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.post(`${API_URL}/api/system-updates`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);

    }
  }
);

export const updateUpdate = createAsyncThunk(
  'systemUpdates/updateUpdate',
  async ({ id, formData }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.put(`${API_URL}/api/system-updates/${id}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);

    }
  }
);

// ---- MARK UPDATE AS READ ----
export const markUpdateAsRead = createAsyncThunk(
  'systemUpdates/markUpdateAsRead',
  async (updateId, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const userId = getState().auth.user.emp_id;

      const response = await axios.post(
        `${API_URL}/api/system-updates/${updateId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Even if backend says "already marked", still return success
      return { updateId, userId, message: response.data?.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);


export const softDeleteUpdate = createAsyncThunk(
  'systemUpdates/softDeleteUpdate',
  async (updateId, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      await axios.delete(`${API_URL}/api/system-updates/${updateId}`, { headers: { Authorization: `Bearer ${token}` } });
      return updateId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);

    }
  }
);

export const fetchEmployeeList = createAsyncThunk(
  'systemUpdates/fetchEmployeeList',
  async ({ department, excludeRole }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.get(`${API_URL}/api/employees`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          department,
          excludeRole
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);

    }
  }
);


// --- New Discussion Thunks ---
export const fetchDiscussionThread = createAsyncThunk(
    'systemUpdates/fetchDiscussionThread',
    async (updateId, { rejectWithValue, getState }) => {
        try {
            const token = getState().auth.token;
            const response = await axios.get(`${API_URL}/api/system-updates/discussion/${updateId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const postDiscussionMessage = createAsyncThunk(
  'systemUpdates/postDiscussionMessage',
  async ({ updateId, message, userId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/system-updates/discussion`,
        {
          discuss_system_pid: updateId,
          discuss_text: message,
          discusess_created_user_id: userId
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data || err.message);
    }
  }
);

export const createDiscussionMessage = createAsyncThunk(
    'systemUpdates/createDiscussionMessage',
    async (data, { rejectWithValue, getState }) => {
        try {
            const token = getState().auth.token;
            const response = await axios.post(`${API_URL}/api/system-updates/discussion`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const createReplyMessage = createAsyncThunk(
    'systemUpdates/createReplyMessage',
    async (data, { rejectWithValue, getState }) => {
        try {
            const token = getState().auth.token;
            const response = await axios.post(`${API_URL}/api/system-updates/discussion/reply`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const systemUpdateSlice = createSlice({
  name: 'systemUpdates',
  initialState: {
    adminUpdates: [],
    userUpdates: [],
    systemUpdates: [],
    knowledgeBaseUpdates: [],
    trainingDiscussionUpdates: [],
    allEmployees: [], 
    discussionThread: [],
    status: 'idle',
    error: null,
  },
  reducers: {

    clearNotification: (state) => {
        state.notification = null;
    },
    addDiscussionMessage: (state, action) => {
        state.discussionThread.push(action.payload);
    },
    setNotification: (state, action) => {
        state.notification = action.payload;
    }

  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminUpdates.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchAdminUpdates.fulfilled, (state, action) => { state.status = 'succeeded'; state.adminUpdates = action.payload; })
      .addCase(fetchAdminUpdates.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; })

       // ** CASE FOR SYSTEM UPDATES **
      .addCase(fetchSystemUpdates.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchSystemUpdates.fulfilled, (state, action) => { state.status = 'succeeded'; state.systemUpdates = action.payload; })
      .addCase(fetchSystemUpdates.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; })

      // ** CASE FOR KNOWLEDGE BASE UPDATES **
      .addCase(fetchKnowledgeBaseUpdates.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchKnowledgeBaseUpdates.fulfilled, (state, action) => { state.status = 'succeeded'; state.knowledgeBaseUpdates = action.payload; })
      .addCase(fetchKnowledgeBaseUpdates.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; })

      // ** CASE FOR TRAINING DISCUSSION UPDATES **
      .addCase(fetchTrainingDiscussionUpdates.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchTrainingDiscussionUpdates.fulfilled, (state, action) => { state.status = 'succeeded'; state.trainingDiscussionUpdates = action.payload; })
      .addCase(fetchTrainingDiscussionUpdates.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; })
      
      .addCase(fetchUserUpdates.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchUserUpdates.fulfilled, (state, action) => { state.status = 'succeeded'; state.userUpdates = action.payload; })
      .addCase(fetchUserUpdates.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; })

            
      .addCase(createUpdate.pending, (state) => { state.status = 'loading'; })
      .addCase(createUpdate.fulfilled, (state, action) => { state.status = 'succeeded'; state.adminUpdates.unshift(action.payload); })
      .addCase(createUpdate.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; })

      .addCase(updateUpdate.pending, (state) => { state.status = 'loading'; })
      .addCase(updateUpdate.fulfilled, (state, action) => { state.status = 'succeeded'; })
      .addCase(updateUpdate.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; })

       .addCase(markUpdateAsRead.fulfilled, (state, action) => {
        const { updateId, userId } = action.payload;
        const numericUserId = Number(userId);

        state.userUpdates = state.userUpdates.map((update) => {
          if (update.id === updateId) {
            const readedUsers = update.readed_users
              ? update.readed_users.split(',').map(Number)
              : [];
            if (!readedUsers.includes(numericUserId)) {
              update.readed_users = [...readedUsers, numericUserId].join(',');
            }
          }
          return update;
        });
      })
      .addCase(markUpdateAsRead.rejected, (state, action) => {
        state.error = action.payload;
      })

      
      .addCase(softDeleteUpdate.fulfilled, (state, action) => {
        const updateId = action.payload;
        state.adminUpdates = state.adminUpdates.filter(update => update.id !== updateId);
      })
      .addCase(fetchEmployeeList.fulfilled, (state, action) => {
        state.allEmployees = action.payload;
      })

      // --- Discussion Reducers ---
      .addCase(fetchDiscussionThread.pending, (state) => {
          state.status = 'loading';
      })
      .addCase(fetchDiscussionThread.fulfilled, (state, action) => {
          state.status = 'succeeded';
          state.discussionThread = action.payload;
      })
      .addCase(fetchDiscussionThread.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.payload;
      })
      .addCase(createDiscussionMessage.fulfilled, (state, action) => {
          state.status = 'succeeded';
      })
      .addCase(createReplyMessage.fulfilled, (state, action) => {
          state.status = 'succeeded';
      });

     

  },
});
export const { clearNotification, addDiscussionMessage, setNotification } = systemUpdateSlice.actions;
export default systemUpdateSlice.reducer;
