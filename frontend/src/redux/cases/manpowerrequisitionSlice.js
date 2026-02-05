import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to fetch email Template data



export const fetchUserByEmpId = createAsyncThunk(
  'manpowerRequisition/fetchUserByEmpId',
  async (emp_id, { rejectWithValue, getState }) => {
    console.log('fetchUserByEmpId called with emp_id:', emp_id);
    try {
      const { auth } = getState();
      const token = auth.token;
      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(
        `${API_URL}/api/cases/get-user-by-empid/${emp_id}`,
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



// Async thunk to fetch email Template data
export const fetchManpowerRequisitionByuserId = createAsyncThunk(
  'manpowerRequisition/fetchManpowerRequisitionByuserId',
  async (userId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${API_URL}/api/cases/getmanpowerrequisitionbyuser/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch manpower requisition by user ID.';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to fetch email Template data
export const my_requisitions = createAsyncThunk(
  'manpowerRequisition/my-requisitions',
  async (userId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${API_URL}/api/cases/my-requisitions/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch manpower requisition by user ID.';
      return rejectWithValue(errorMessage);
    }
  }
);


export const fetchManpowerRequisition = createAsyncThunk(
  'manpowerRequisition/fetchManpowerRequisition',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${API_URL}/api/cases/getmanpowerrequisition`, {
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

export const fetchManpowerRequisitionByStatus = createAsyncThunk(
  'manpowerRequisition/fetchManpowerRequisitionByStatus',
  async (data, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;
      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(
        `${API_URL}/api/cases/getmanpowerrequisitionbystatus/${data?.status}/${data?.emp_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch MRF by status.';
      return rejectWithValue(errorMessage);
    }
  }
);


export const getMFRCounts = createAsyncThunk(
  'manpowerRequisition/getMFRCounts',
  async (managerId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;
      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(
        `${API_URL}/api/mrf/manager-mrf-counts/${managerId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch MRF counts.';
      return rejectWithValue(errorMessage);
    }
  }
);
export const fetchManagerList = createAsyncThunk(
  'manpowerRequisition/fetchManagerrList',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;
      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(
        `${API_URL}/api/mrf/manager-list`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch Manager list.';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateManpowerTracking = createAsyncThunk(
  'manpowerRequisition/updateManpowerTracking',
  async (payload, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const { id, ...data } = payload;

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      const response = await axios.put(
        `${API_URL}/api/mrf/update-mrf-tracking/${id}`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update manpower tracking status.';
      return rejectWithValue(errorMessage);
    }
  }
);
      
export const fetchMrfTrackingById = createAsyncThunk(
  'manpowerRequisition/fetchMrfTrackingById',
  async (id, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      const response = await axios.get(
        `${API_URL}/api/mrf/get-mrf-tracking/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch MRF tracking data by ID.';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchManagerByDepartmentId = createAsyncThunk(
  'manpowerRequisition/fetchManagerByDepartmentId',
  async (id, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      const response = await axios.get(
        `${API_URL}/api/mrf/manager-list/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch MRF tracking data by ID.';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchMrfTrackingList = createAsyncThunk(
  'manpowerRequisition/fetchMrfTrackingList',
  async (userId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(
        `${API_URL}/api/mrf/mrf-tracking-list/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch MRF tracking list.';
      return rejectWithValue(errorMessage);
    }
  }
);



export const fetchManpowerRequisitionById = createAsyncThunk(
  'manpowerRequisition/fetchManpowerRequisitionById',
  async (id, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      const response = await axios.get(
        `${API_URL}/api/cases/getmanpowerrequisitionbyid/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch manpower requisition by ID.';

      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchManpowerRequisitionFH = createAsyncThunk(
  'manpowerRequisition/fetchManpowerRequisitionFH',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${API_URL}/api/cases/getmanpowerrequisitionFH`, {
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

export const addQueryForm = createAsyncThunk(
  'manpowerRequisition/addQueryForm',

  async (queryAddData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      // Send JSON directly when no files
      const response = await axios.post(
        `${API_URL}/api/cases/add-query-form`,
        queryAddData,
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
        error.response?.data?.message || error.message || 'Failed to submit Query entries.';
      return rejectWithValue(errorMessage);
    }
  }

);

export const updateManpowerStatus = createAsyncThunk(
  'manpowerRequisition/updateManpowerStatus',
  async ({ manpowerId, newStatus, hr_comments, director_comments,data,isSendMail }, { rejectWithValue, getState }) => {
    console.log('updateManpowerStatus called with:', { manpowerId, newStatus });
    try {
      const { auth } = getState();
      const token = auth.token;
      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const updateBody = {
        status: newStatus,
        user: auth.user,
        hr_comments,
        director_comments,
        data,
        isSendMail
      };

      const response = await axios.put(
        `${API_URL}/api/cases/update-status/${manpowerId}`,
        updateBody,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return { manpowerId, newStatus, message: response.data.message };

    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to update manpower status.';
      return rejectWithValue({ manpowerId, error: errorMessage });
    }
  }
);


export const deleteManpowerRequisition = createAsyncThunk(
  'manpowerRequisition/deleteManpowerRequisition',
  async ({ id }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const deleteBody = {
        is_delete: 'Inactive'
      };

      const response = await axios.put(
        `${API_URL}/api/cases/delete-manpower/${id}`,
        deleteBody,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return { manpowerId: id, message: response.data.message };

    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to delete manpower status.';
      return rejectWithValue({ manpowerId: id, error: errorMessage });
    }
  }
);

export const withdrawManpowerRequisition = createAsyncThunk(
  'manpowerRequisition/withdrawManpowerRequisition',
  async ({ id }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const withdrawBody = {
        status: 'Withdraw'
      };

      const response = await axios.put(
        `${API_URL}/api/cases/withdraw-manpower/${id}`,
        withdrawBody,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return { manpowerId: id, message: response.data.message };

    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to withdraw manpower status.';
      return rejectWithValue({ manpowerId: id, error: errorMessage });
    }
  }
);

// Async thunk to fetch departments for the logged-in manager
export const fetchDepartmentsManagerId = createAsyncThunk(
  'manpowerRequisition/fetchDepartments',
  async (managerId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${API_URL}/api/mrf/departments-by-manager/${managerId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch departments.';
      return rejectWithValue(errorMessage);
    }
  }
);




// Async thunk to add a new Manpower Requisition Form entry
export const addManpowerRequisition = createAsyncThunk(
  'manpowerRequisition/addManpowerRequisition',
  async (mrfData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.post(
        `${API_URL}/api/mrf/add-manpower-requisition`,
        mrfData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data', // Important for file uploads
          },
        }
      );

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit MRF request.';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to update a Manpower Requisition Form entry
export const updateManpowerRequisition = createAsyncThunk(
  'manpowerRequisition/updateManpowerRequisition',
  async ({ id, data }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.put(
        `${API_URL}/api/mrf/update-manpower-requisition/${id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update MRF request.';
      return rejectWithValue(errorMessage);
    }
  }
);
export const replyToQuery = createAsyncThunk(
  'manpowerRequisition/replyToQuery',
  async ({ id, reply,query_pid }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.post(
        `${API_URL}/api/mrf/reply-to-query/${id}`,
        { reply,query_pid },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit reply.';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchQuery = createAsyncThunk(
  'manpowerRequisition/fetchQuery',
  async (id, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      if (!token) {
        return rejectWithValue('Authentication token is missing.');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(
        `${API_URL}/api/mrf/get-query/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch query.';
      return rejectWithValue(errorMessage);
    }
  }
);
const manpowerrequisitionSlice = createSlice({
  name: 'manpowerRequisition',
  initialState: {
    userByEmpId: null,
    data: [],
    mfrCounts: [],
    departments: [],
    managerList: [],
    managerListById: [],
    query: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    optimisticUpdateManpowerStatus: (state, action) => {
      const { manpowerId, newStatus } = action.payload;
      state.data = state.data?.map(manpowerItem =>
        manpowerItem.id === manpowerId ? { ...manpowerItem, status: newStatus } : manpowerItem
      );
    },
    revertManpowerStatus: (state, action) => {
      const { manpowerId, originalManpower } = action.payload;
      state.data = state?.data?.map(manpowerItem =>
        manpowerItem.id === manpowerId ? originalManpower : manpowerItem
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserByEmpId.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUserByEmpId.fulfilled, (state, action) => {
        state.status = 'succeeded'; 
        state.userByEmpId = action.payload;
      })
      .addCase(fetchUserByEmpId.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.userByEmpId = null;
      })

      .addCase(fetchManpowerRequisition.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchManpowerRequisition.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchManpowerRequisition.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.data = [];
      })
      .addCase(fetchManpowerRequisitionByuserId.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchManpowerRequisitionByuserId.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchManpowerRequisitionByuserId.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.data = [];
      })
       .addCase(my_requisitions.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(my_requisitions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(my_requisitions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.data = [];
      })
      .addCase(fetchManpowerRequisitionByStatus.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchManpowerRequisitionByStatus.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchManpowerRequisitionByStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.data = [];
      })
      .addCase(fetchManpowerRequisitionById.pending, (state) => {
        state.statusById = 'loading';
        state.errorById = null;
      })
      .addCase(fetchManpowerRequisitionById.fulfilled, (state, action) => {
        state.statusById = 'succeeded';
        state.selectedRequisition = action.payload;
      })
      .addCase(fetchManpowerRequisitionById.rejected, (state, action) => {
        state.statusById = 'failed';
        state.errorById = action.payload;
        state.selectedRequisition = null;
      })
      .addCase(fetchManpowerRequisitionFH.pending, (state) => {
        state.statusById = 'loading';
        state.errorById = null;
      })
      .addCase(fetchManpowerRequisitionFH.fulfilled, (state, action) => {
        state.statusById = 'succeeded';
        state.selectedRequisitionFH = action.payload;
      })
      .addCase(fetchManpowerRequisitionFH.rejected, (state, action) => {
        state.statusById = 'failed';
        state.errorById = action.payload;
        state.selectedRequisitionFH = null;
      })
      .addCase(getMFRCounts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getMFRCounts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.mfrCounts = action.payload;
      }
      )
      .addCase(getMFRCounts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.mfrCounts = null;
      })
      .addCase(fetchManagerList.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchManagerList.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.managerList = action.payload;
      })
      .addCase(fetchManagerList.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.managerList = [];
      })

      .addCase(fetchManagerByDepartmentId.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchManagerByDepartmentId.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.managerListById = action.payload;
      })
      .addCase(fetchManagerByDepartmentId.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.managerListById = [];
      })

      // Handle fetchDepartments
      .addCase(fetchDepartmentsManagerId.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDepartmentsManagerId.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.departments = action.payload;
      })
      .addCase(fetchDepartmentsManagerId.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.departments = [];
      })


  




      // Handle addManpowerRequisition
      .addCase(addManpowerRequisition.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(addManpowerRequisition.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Add the new entry to the state so the UI can update if needed
        state.data.push(action.payload.mrfData);
      })
      .addCase(addManpowerRequisition.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Handle updateManpowerRequisition
      .addCase(updateManpowerRequisition.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateManpowerRequisition.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Optionally update the specific item in the state if needed
      })
      .addCase(updateManpowerRequisition.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      .addCase(addQueryForm.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(addQueryForm.fulfilled, (state, action) => {
        state.status = 'succeeded';
        //state.data = action.payload?.caseData || state.data;
        if (action.payload?.caseData) {
          state.data.push(action.payload.caseData);  // ✅ Add new record into array
        }
      })
      .addCase(addQueryForm.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.data = [];
      })
      .addCase(updateManpowerStatus.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateManpowerStatus.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // state.data = action.payload;
      })
      .addCase(updateManpowerStatus.rejected, (state, action) => {
        state.status = 'failed';
        // state.error = action.payload;
        state.data = [];
      })
      //delete email function
      .addCase(deleteManpowerRequisition.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteManpowerRequisition.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(deleteManpowerRequisition.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.data = [];
      })
      .addCase(withdrawManpowerRequisition.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(withdrawManpowerRequisition.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = state.data.filter(item => item.id !== action.payload.manpowerId);
      })
      .addCase(withdrawManpowerRequisition.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(replyToQuery.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(replyToQuery.fulfilled, (state, action) => {
        state.status = 'succeeded';
      })
      .addCase(replyToQuery.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchMrfTrackingById.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        state.selectedRequisition = null;
      })
      .addCase(fetchMrfTrackingById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.selectedRequisition = action.payload;
      })
      .addCase(fetchMrfTrackingById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.selectedRequisition = null;
      })
      .addCase(fetchMrfTrackingList.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchMrfTrackingList.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchMrfTrackingList.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.data = [];
      })
      .addCase(fetchQuery.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchQuery.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.query = action.payload;
      })
      .addCase(fetchQuery.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export const { optimisticUpdateManpowerStatus, revertManpowerStatus } = manpowerrequisitionSlice.actions;
export default manpowerrequisitionSlice.reducer;