// socketManager.js
const socketIo = require('socket.io');

let io;

const initializeSocketIO = (server) => {
    // This is the function that initializes Socket.IO
    io = socketIo(server, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            methods: ["GET", "POST", "PUT", "DELETE"],
            credentials: true
        }
    });

    // You can add your connection logic here
    io.on('connection', (socket) => {
        //console.log('A user connected via Socket.IO:', socket.id);
        // ... (rest of your connection logic)
    });

    return io; // It's good practice to return the io instance
};

const getSocketIo = () => {
    if (!io) {
        throw new Error('Socket.IO not initialized! Call initializeSocketIO first.');
    }
    return io;
};

const emitDashboardRefresh = () => {
  if (io) {
    //console.log('[Socket] Emitting dashboard-refresh event.');
    io.emit('dashboard-refresh');
  }
};
const emitToDepartment = (department, event, data) => {
  if (io) {
    //console.log(`[Socket] Emitting event '${event}' to department '${department}'.`);
    io.to(department).emit(event, data);
  }
};

const emitEmailTemplateRefresh = () => {
  if(io) {
    //console.log('[Socket] Emitting emailtemplate-refresh event.');
    io.emit('emailtemplate-refresh');
  }
};

// Specific-purpose system update emitter
const emitSystemUpdate = (data) => {
  if (io) {
    //console.log('[Socket] Emitting system-update event.');
    io.emit('system-update', data);
  }
};

const emitAssessmentDataRefresh = (data) => {
  if (io) {
    //console.log('[Socket] Emitting assessmentData-refresh event.');
    io.emit('assessmentData-refresh', data);
  }
};
const emitAssessmentDataShowRefresh = (data) => {
  if (io) {
    //console.log('[Socket] Emitting assessmentData-Show-refresh event.');
    io.emit('assessmentData-Show-refresh', data);
  }
};

const emitAssessmentQuestionDataRefresh = (data) => {
  if (io) {
    //console.log('[Socket] Emitting assessmentQuestionData-refresh event.');
    io.emit('assessmentQuestionData-refresh', data);
  }
};

const emitAssessmentSubmitDataRefresh = (data) => {
  if (io) {
    //console.log('[Socket] Emitting assessmentViewData-refresh event.');
    io.emit('assessmentViewData-refresh', data);
  }
};

const emitAssessmentCorrectionSubmitDataRefresh = (data) => {
  if (io) {
    //console.log('[Socket] Emitting assessmentCorrectionViewData-refresh event.');
    io.emit('assessmentCorrectionViewData-refresh', data);
  }
};

// Case Entry Socket Functions
const emitCaseEntryCreated = (data) => {
  if (io) {
    //console.log('[Socket] Emitting case-entry-created event.');
    io.emit('case-entry-created', data);
  }
};

const emitCaseEntryUpdated = (caseData) => {
  if (io) {
    //console.log('[Socket] Emitting case-entry-updated event.');
    io.emit('case-entry-updated', caseData);
  }
};

const emitCaseEntryDeleted = (entryId) => {
  if (io) {
    //console.log('[Socket] Emitting case-entry-deleted event.');
    io.emit('case-entry-deleted', entryId);
  }
};

const emitCaseEntryBatchCreated = (batchData) => {
  if (io) {
    //console.log('[Socket] Emitting case-entry-batch-created event.');
    io.emit('case-entry-batch-created', batchData);
  }
};

const emitDiscussionRead = (payload) => {
  if (!io) return;
  io.emit("discussion-read", payload);
};
const emitDashboardRefreshCaseEntry = () => {
  if (io) {
    //console.log('[Socket] Emitting dashboard-refresh event.');
    io.emit('dashboard-case-entry-refresh');
  }
};

const emitQualityDiscussionMessage = () => {
  if(io) {
     //console.log('[Socket] Emitting quality-discussion-refresh event.');
     io.emit('quality-discussion-refresh');
  }
};
const emitQualityView = () => {
  if(io) {
     //console.log('[Socket] Emitting quality-view event.');
     io.emit('quality-view');
  }
};

const emitQualityApproved = () => {
   if(io) {
     //console.log('[Socket] Emitting quality-approved-view event.');
     io.emit('quality-approved-view');
   }
};

const emitQualityApproveDiscussionMessage = () => {
  if(io) {
     //console.log('[Socket] Emitting quality-discussion-refresh event.');
     io.emit('quality-approve-discussion-refresh');
  }
};

// Export the functions that need to be used in other files
module.exports = {
    initializeSocketIO,
    getSocketIo, emitDashboardRefresh, emitToDepartment, emitEmailTemplateRefresh, emitSystemUpdate, emitAssessmentDataRefresh, emitAssessmentQuestionDataRefresh, emitAssessmentSubmitDataRefresh,
    emitAssessmentCorrectionSubmitDataRefresh,emitAssessmentDataShowRefresh,emitCaseEntryCreated, emitCaseEntryUpdated, emitCaseEntryDeleted, emitCaseEntryBatchCreated, emitDiscussionRead,emitDashboardRefreshCaseEntry, emitQualityDiscussionMessage,emitQualityView,emitQualityApproved,emitQualityApproveDiscussionMessage
};