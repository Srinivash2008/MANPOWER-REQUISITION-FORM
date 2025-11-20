// frontend/src/redux/auth/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// --- Configuration ---
const API_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/auth`
  : 'http://localhost:5001/api/auth';

// --- Thunks for API Calls ---
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/login`, credentials);

      // ✅ Persist both token and user
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue(errorMessage);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (emp_id, { rejectWithValue }) => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);





// --- Initial State and Token Hydration Logic ---
let token = localStorage.getItem('token');
let user = null;

if (token) {
  try {
    const currentTime = Date.now() / 1000;
    const decodedToken = jwtDecode(token);

    if (decodedToken.exp < currentTime) {
      //console.warn('Token expired. Clearing session.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      token = null;
    } else {
      // ✅ Hydrate user either from storage or fallback to decoded token
      const storedUser = localStorage.getItem('user');
      user = storedUser
        ? JSON.parse(storedUser)
        : {
            emp_id: decodedToken.emp_id,
            emp_pos: decodedToken.emp_pos,
            emp_name: decodedToken.emp_name,
            emp_dept: decodedToken.emp_dept,
          };
    }
  } catch (error) {
    //console.error('Invalid token found in localStorage. Clearing.', error);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    token = null;
    user = null;
  }
}

const initialState = {
  token: token,
  user: user,
  status: 'idle',
  error: null,
};

// --- Redux Slice ---
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      state.token = null;
      state.user = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.token = null;
        state.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;