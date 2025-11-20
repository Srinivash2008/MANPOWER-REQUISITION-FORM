// redux/profile/profileSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// --- Token Helpers ---
export const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

// Reapply token if it exists at startup
const token = localStorage.getItem('token');
if (token) {
  setAuthToken(token);
}

// --- Thunks ---

// Fetch profile (authenticated user)
export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token; // ✅ latest token
      const res = await axios.get(`${API_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Update profile
export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (profileData, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const res = await axios.put(`${API_URL}/api/users/profile`, profileData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Change password
export const changePassword = createAsyncThunk(
  'profile/changePassword',
  async (passwords, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const res = await axios.put(
        `${API_URL}/api/users/change-password`,
        passwords,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to change password.'
      );
    }
  }
);

// --- Slice ---
const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    data: null,
    status: 'idle', // idle | loading | succeeded | failed
    error: null,
    passwordStatus: 'idle',
    passwordError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          typeof action.payload === 'string'
            ? { message: action.payload }
            : action.payload || { message: action.error?.message };
      })

      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          typeof action.payload === 'string'
            ? { message: action.payload }
            : action.payload || { message: action.error?.message };
      })

      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.passwordStatus = 'loading';
        state.passwordError = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.passwordStatus = 'succeeded';
        state.passwordError = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.passwordStatus = 'failed';
        state.passwordError =
          typeof action.payload === 'string'
            ? { message: action.payload }
            : action.payload || { message: action.error?.message };
      });
  },
});

export default profileSlice.reducer;
