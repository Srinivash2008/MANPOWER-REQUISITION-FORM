// redux/users/userSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ---- THUNKS ----
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const res = await axios.get(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data; // Expecting array of users
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const addUser = createAsyncThunk(
  'users/addUser',
  async (userData, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const res = await axios.post(`${API_URL}/api/users/adduser`, userData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return res.data; // new user object
    } catch (err) {
      if (err.response && err.response.status === 409) {
        return rejectWithValue({ code: 409, message: err.response.data?.message || 'Duplicate' });
      }
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, data }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const res = await axios.put(`${API_URL}/api/users/edit/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return res.data; // updated user object
    } catch (err) {
      if (err.response && err.response.status === 409) {
        return rejectWithValue({ code: 409, message: err.response.data?.message || 'Duplicate' });
      }
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const softDeleteUser = createAsyncThunk(
  'users/softDeleteUser',
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      // Use DELETE or PUT based on backend implementation
      const res = await axios.delete(`${API_URL}/api/users/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ---- SLICE ----
const userSlice = createSlice({
  name: 'users',
  initialState: {
    users: [], // list of active users
    selectedUser: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    clearSelectedUser(state) {
      state.selectedUser = null;
    },
    setSelectedUser(state, action) {
      state.selectedUser = action.payload;
    },
    addUserLocally(state, action) {
      state.users.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // FETCH USERS
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          typeof action.payload === 'string'
            ? { message: action.payload }
            : action.payload || { message: action.error?.message };
      })

      // ADD USER
      .addCase(addUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.users.unshift(action.payload);
      })
      .addCase(addUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          typeof action.payload === 'string'
            ? { message: action.payload }
            : action.payload || { message: action.error?.message };
      })

      // UPDATE USER
      .addCase(updateUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const updated = action.payload;
        const idx = state.users.findIndex((u) => u.employee_id === updated.employee_id);
        if (idx !== -1) {
          state.users[idx] = updated;
        } else {
          state.users.unshift(updated);
        }
        if (state.selectedUser && state.selectedUser.employee_id === updated.employee_id) {
          state.selectedUser = updated;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          typeof action.payload === 'string'
            ? { message: action.payload }
            : action.payload || { message: action.error?.message };
      })

      // SOFT DELETE
      .addCase(softDeleteUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(softDeleteUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const id = action.payload;
        state.users = state.users.filter((u) => u.employee_id !== id);
        if (state.selectedUser && state.selectedUser.employee_id === id) {
          state.selectedUser = null;
        }
      })
      .addCase(softDeleteUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          typeof action.payload === 'string'
            ? { message: action.payload }
            : action.payload || { message: action.error?.message };
      });
  },
});

export const { clearSelectedUser, setSelectedUser, addUserLocally } = userSlice.actions;
export default userSlice.reducer;
