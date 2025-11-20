// frontend/src/redux/cases/caseEntrySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { login } from '../auth/authSlice';

// Async thunk to submit a new case entry
export const submitCaseEntry = createAsyncThunk(
  'caseEntry/submitCaseEntry',
  async (caseData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.post(`${API_URL}/api/cases/add-entry`, caseData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to submit case entry.';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to submit multiple case entries at once
export const submitBatchCaseEntries = createAsyncThunk(
  'caseEntry/submitBatchCaseEntries',
  async (caseDataArray, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.post(`${API_URL}/api/cases/add-batch-entries`,
        { entries: caseDataArray },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
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

// Async thunk to fetch request types for dropdown
export const fetchRequestTypes = createAsyncThunk(
  'caseEntry/fetchRequestTypes',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${API_URL}/api/cases/request-types`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch request types.';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to fetch ticket modes for dropdown
export const fetchTicketModes = createAsyncThunk(
  'caseEntry/fetchTicketModes',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${API_URL}/api/cases/ticket-modes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch ticket modes.';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to fetch employee options for dropdown (senior managers only)
export const fetchEmployeeOptions = createAsyncThunk(
  'caseEntry/fetchEmployeeOptions',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${API_URL}/api/cases/employee-options`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch employee options.';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to fetch today's case entries for the current user
export const fetchTodayEntries = createAsyncThunk(
    'caseEntry/fetchTodayEntries',
    async (_, { rejectWithValue, getState }) => {
        try {
            const { auth } = getState();
            const token = auth.token;

            if (!token) {
                return rejectWithValue('Authentication token is missing.');
            }

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const response = await axios.get(`${API_URL}/api/cases/today-entries`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || error.message || 'Failed to fetch today\'s entries.';
            return rejectWithValue(errorMessage);
        }
    }
);

// Async thunk to fetch all today's case entries (for senior managers)
export const fetchAllTodayEntries = createAsyncThunk(
    'caseEntry/fetchAllTodayEntries',
    async (_, { rejectWithValue, getState }) => {
        try {
            const { auth } = getState();
            const token = auth.token;

            if (!token) {
                return rejectWithValue('Authentication token is missing.');
            }

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const response = await axios.get(`${API_URL}/api/cases/all-today-entries`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response.data;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || error.message || 'Failed to fetch all today\'s entries.';
            return rejectWithValue(errorMessage);
        }
    }
);

// Async thunk to update a case entry
export const updateCaseEntry = createAsyncThunk(
  'caseEntry/updateCaseEntry',
  async ({ entryId, caseData }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.put(`${API_URL}/api/cases/update-entry/${entryId}`, caseData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to update case entry.';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to delete a case entry
export const deleteCaseEntry = createAsyncThunk(
  'caseEntry/deleteCaseEntry',
  async (entryId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.delete(`${API_URL}/api/cases/delete-entry/${entryId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return { entryId, ...response.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to delete case entry.';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to fetch previous case entries (before today)
export const fetchPreviousEntries = createAsyncThunk(
  'caseEntry/fetchPreviousEntries',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${API_URL}/api/cases/previous-entries`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch previous entries.';
      return rejectWithValue(errorMessage);
    }
  }
);

//Login USer Status
/* export const fetchTodayLogin = createAsyncThunk(
  'caseEntry/fetchTodayLogin',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${API_URL}/api/cases/user-login-status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch previous entries.';
      return rejectWithValue(errorMessage);
    }
  }
); */

//update shift user
// Async thunk to update a case entry
/* export const shiftUpdateUser = createAsyncThunk(
  'caseEntry/shiftUpdateUser',
  async ({ login_id, caseData }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      console.log(caseData,"caseData1");
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.put(`${API_URL}/api/cases/shift-update-entry/${login_id}`, caseData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to update case entry.';
      return rejectWithValue(errorMessage);
    }
  }
); */


const caseEntrySlice = createSlice({
  name: 'caseEntry',
  initialState: {
    // Form submission state
    submitStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    submitError: null,
    lastSubmittedCase: null,
    
    // Batch submission state
    batchSubmitStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    batchSubmitError: null,
    batchSubmitResults: null,
    
    // Today's entries state
    todayEntries: [],
    todayEntriesStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    todayEntriesError: null,
    
    // All today's entries state (for senior managers)
    allTodayEntries: [],
    allTodayEntriesStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    allTodayEntriesError: null,

    // Previous entries state (before today)
    previousEntries: [],
    previousEntriesStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    previousEntriesError: null,

    // Update entry state
    updateStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    updateError: null,

    // Delete entry state
    deleteStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    deleteError: null,
    
    // Dropdown options state
    requestTypes: [],
    ticketModes: [],
    employeeOptions: [],
    //userLoginStatus: [],
    optionsStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    optionsError: null,

    
    // Form state
    formData: {
      ticket_no: '',
      received_date: '',
      completed_date: '',
      status: 'Pending',
      requested_type: '',
      ticket_mode: ''
    },
    
    // Validation state
    formErrors: {},
    isFormValid: false
  },
  reducers: {
    // Update form data
    updateFormData: (state, action) => {
      const { field, value } = action.payload;
      state.formData[field] = value;
      
      // Clear specific field error when user starts typing
      if (state.formErrors[field]) {
        delete state.formErrors[field];
      }
      
      // Update form validity
      state.isFormValid = Object.keys(state.formErrors).length === 0;
    },
    
    // Set form errors
    setFormErrors: (state, action) => {
      state.formErrors = action.payload;
      state.isFormValid = Object.keys(action.payload).length === 0;
    },
    
    // Clear form errors
    clearFormErrors: (state) => {
      state.formErrors = {};
      state.isFormValid = true;
    },
    
    // Reset form to initial state
    resetForm: (state) => {
      state.formData = {
        ticket_no: '',
        received_date: '',
        completed_date: '',
        status: 'Pending',
        requested_type: '',
        ticket_mode: ''
      };
      state.formErrors = {};
      state.isFormValid = false;
      state.submitStatus = 'idle';
      state.submitError = null;
    },
    
    // Clear submit status (for clearing success/error messages)
    clearSubmitStatus: (state) => {
      state.submitStatus = 'idle';
      state.submitError = null;
    },
    
    // Clear batch submit status
    clearBatchSubmitStatus: (state) => {
      state.batchSubmitStatus = 'idle';
      state.batchSubmitError = null;
      state.batchSubmitResults = null;
    },
    
    // Clear today entries status
    clearTodayEntriesStatus: (state) => {
      state.todayEntriesStatus = 'idle';
      state.todayEntriesError = null;
    },
    
    // Clear update status
    clearUpdateStatus: (state) => {
      state.updateStatus = 'idle';
      state.updateError = null;
    },

    // Trigger data refresh for senior managers when entry not found in arrays
    triggerDataRefresh: (state) => {
      //console.log('[Redux] Data refresh triggered - entry not found in local arrays');
      // This action doesn't modify state directly, but will be used to trigger API calls
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle submitCaseEntry
      .addCase(submitCaseEntry.pending, (state) => {
        state.submitStatus = 'loading';
        state.submitError = null;
      })
      .addCase(submitCaseEntry.fulfilled, (state, action) => {
        state.submitStatus = 'succeeded';
        state.lastSubmittedCase = action.payload.caseData;
        // Reset form on successful submission
        state.formData = {
          ticket_no: '',
          received_date: '',
          completed_date: '',
          status: 'Pending',
          requested_type: '',
          ticket_mode: ''
        };
        state.formErrors = {};
        state.isFormValid = false;

        // Add the new case entry to both arrays to update UI immediately
        if (action.payload.caseData) {
          // Add to todayEntries (for regular users)
          const existsInToday = state.todayEntries.find(entry => entry.id === action.payload.caseData.id);
          if (!existsInToday) {
            state.todayEntries.unshift(action.payload.caseData);
          }

          // Add to allTodayEntries (for senior managers)
          const existsInAll = state.allTodayEntries.find(entry => entry.id === action.payload.caseData.id);
          if (!existsInAll) {
            state.allTodayEntries.unshift(action.payload.caseData);
          }
        }
      })
      .addCase(submitCaseEntry.rejected, (state, action) => {
        state.submitStatus = 'failed';
        state.submitError = action.payload;
      })
      
      // Handle fetchRequestTypes
      .addCase(fetchRequestTypes.pending, (state) => {
        state.optionsStatus = 'loading';
        state.optionsError = null;
      })
      .addCase(fetchRequestTypes.fulfilled, (state, action) => {
        state.optionsStatus = 'succeeded';
        state.requestTypes = action.payload;
      })
      .addCase(fetchRequestTypes.rejected, (state, action) => {
        state.optionsStatus = 'failed';
        state.optionsError = action.payload;
      })
      
      // Handle fetchTicketModes
      .addCase(fetchTicketModes.fulfilled, (state, action) => {
        state.ticketModes = action.payload;
      })

      // Handle fetchEmployeeOptions
      .addCase(fetchEmployeeOptions.fulfilled, (state, action) => {
        state.employeeOptions = action.payload;
        //state.employeeShift   = action.payload.employeeShift;
      })
      .addCase(fetchEmployeeOptions.rejected, (state, action) => {
        state.employeeOptions = [];
        //console.warn('Failed to fetch employee options:', action.payload);
      })
      
      // Handle submitBatchCaseEntries
      .addCase(submitBatchCaseEntries.pending, (state) => {
        state.batchSubmitStatus = 'loading';
        state.batchSubmitError = null;
        state.batchSubmitResults = null;
      })
      .addCase(submitBatchCaseEntries.fulfilled, (state, action) => {
        state.batchSubmitStatus = 'succeeded';
        state.batchSubmitResults = action.payload;
      })
      .addCase(submitBatchCaseEntries.rejected, (state, action) => {
        state.batchSubmitStatus = 'failed';
        state.batchSubmitError = action.payload;
      })
      
      // Handle fetchTodayEntries
      .addCase(fetchTodayEntries.pending, (state) => {
          state.todayEntriesStatus = 'loading';
          state.todayEntriesError = null;
      })
      // .addCase(fetchTodayEntries.fulfilled, (state, action) => {
      //     state.todayEntriesStatus = 'succeeded';
      //     state.todayEntries = action.payload.entries || [];
      // })

      .addCase(fetchTodayEntries.fulfilled, (state, action) => {
        const entries = action.payload.entries || [];
        state.todayEntries = entries.sort((a, b) => b.id - a.id);
        state.status = 'succeeded';
      })
      .addCase(fetchTodayEntries.rejected, (state, action) => {
          state.todayEntriesStatus = 'failed';
          state.todayEntriesError = action.payload;
      })
      
      // Handle fetchAllTodayEntries
      .addCase(fetchAllTodayEntries.pending, (state) => {
          state.allTodayEntriesStatus = 'loading';
          state.allTodayEntriesError = null;
      })
      // .addCase(fetchAllTodayEntries.fulfilled, (state, action) => {
      //     state.allTodayEntriesStatus = 'succeeded';
      //     state.allTodayEntries = action.payload.entries || [];
      // })

      .addCase(fetchAllTodayEntries.fulfilled, (state, action) => {
  const entries = action.payload.entries || [];
  state.allTodayEntries = entries.sort((a, b) => b.id - a.id);
  state.status = 'succeeded';
})
      .addCase(fetchAllTodayEntries.rejected, (state, action) => {
          state.allTodayEntriesStatus = 'failed';
          state.allTodayEntriesError = action.payload;
      })
      
      // Handle updateCaseEntry
      .addCase(updateCaseEntry.pending, (state) => {
        state.updateStatus = 'loading';
        state.updateError = null;
      })
      .addCase(updateCaseEntry.fulfilled, (state, action) => {
        state.updateStatus = 'succeeded';
        // Update the entry in both arrays if it exists
        const updatedEntry = action.payload.caseData;

        // Update in todayEntries if it exists
        const todayIndex = state.todayEntries.findIndex(entry => entry.id === updatedEntry.id);
        if (todayIndex !== -1) {
          state.todayEntries[todayIndex] = { ...state.todayEntries[todayIndex], ...updatedEntry };
        }

        // Update in allTodayEntries if it exists
        const allIndex = state.allTodayEntries.findIndex(entry => entry.id === updatedEntry.id);
        if (allIndex !== -1) {
          state.allTodayEntries[allIndex] = { ...state.allTodayEntries[allIndex], ...updatedEntry };
        }
      })
      .addCase(updateCaseEntry.rejected, (state, action) => {
        state.updateStatus = 'failed';
        state.updateError = action.payload;
      })

      // Handle deleteCaseEntry
      .addCase(deleteCaseEntry.pending, (state) => {
        state.deleteStatus = 'loading';
        state.deleteError = null;
      })
      .addCase(deleteCaseEntry.fulfilled, (state, action) => {
        state.deleteStatus = 'succeeded';
        // Remove the deleted entry from all arrays if it exists
        const deletedEntryId = action.payload.entryId;

        // Remove from todayEntries if it exists
        state.todayEntries = state.todayEntries.filter(entry => entry.id !== deletedEntryId);

        // Remove from allTodayEntries if it exists
        state.allTodayEntries = state.allTodayEntries.filter(entry => entry.id !== deletedEntryId);

        // Remove from previousEntries if it exists
        state.previousEntries = state.previousEntries.filter(entry => entry.id !== deletedEntryId);
      })
      .addCase(deleteCaseEntry.rejected, (state, action) => {
        state.deleteStatus = 'failed';
        state.deleteError = action.payload;
      })

      // Handle fetchPreviousEntries
      .addCase(fetchPreviousEntries.pending, (state) => {
        state.previousEntriesStatus = 'loading';
        state.previousEntriesError = null;
      })
      .addCase(fetchPreviousEntries.fulfilled, (state, action) => {
        state.previousEntriesStatus = 'succeeded';
        // Filter out today's entries to ensure previousEntries only contains entries before today
        state.previousEntries = action.payload.entries;
        // const today = new Date().toISOString().split('T')[0];
        // state.previousEntries = (action.payload.entries || []).filter(entry => entry.received_date !== today);
      })
      .addCase(fetchPreviousEntries.rejected, (state, action) => {
        state.previousEntriesStatus = 'failed';
        state.previousEntriesError = action.payload;
      })

      //fetchtoday login user
      /* .addCase(fetchTodayLogin.pending, (state) => {
        state.userStatus = 'loading';
        state.userError = null;
      })
      .addCase(fetchTodayLogin.fulfilled, (state, action) => {
        state.userStatus = 'succeeded';
        state.userLoginStatus = action.payload;
      })
      .addCase(fetchTodayLogin.rejected, (state, action) => {
        state.userStatus = 'failed';
        state.userError = action.payload;
      }) */

      /* .addCase(shiftUpdateUser.pending, (state) => {
        state.userStatus = 'loading';
        state.userError = null;
      })
      .addCase(shiftUpdateUser.fulfilled, (state, action) => {
        state.userStatus = 'succeeded';
        state.userLoginStatus = action.payload;
      })
      .addCase(shiftUpdateUser.rejected, (state, action) => {
        state.userStatus = 'failed';
        state.userError = action.payload;
      }) */
  },
});



export const {
  updateFormData,
  setFormErrors,
  clearFormErrors,
  resetForm,
  clearSubmitStatus,
  clearBatchSubmitStatus,
  clearTodayEntriesStatus,
  clearUpdateStatus,
  triggerDataRefresh
} = caseEntrySlice.actions;

export default caseEntrySlice.reducer;