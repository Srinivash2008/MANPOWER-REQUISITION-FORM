// frontend/src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../redux/auth/authSlice';
import dashboardReducer from '../redux/dashboard/dashboardSlice';
import pendingCasesReducer from '../redux/cases/pendingCasesSlice';
import escalatedCasesReducer from '../redux/cases/escalatedCasesSlice';
import todayCasesReducer from '../redux/cases/todayCasesSlice';
import monthlyResolvedCasesReducer from '../redux/cases/monthlyResolvedCasesSlice';
import caseEntryReducer from '../redux/cases/caseEntrySlice';
import attendanceReducer from '../redux/attendance/attendanceSlice';
import emailTemplateReducer from '../redux/cases/emailTemplateSlice';
import systemUpdatesReducer from '../redux/systemUpdates/systemUpdateSlice'; // Import the new reducer
import reportReducer  from '../redux/cases/reportSlice';
import assessmentReducer from '../redux/cases/assessmentDataSlice';
import assementQuestionReducer from '../redux/cases/assementQuestionSlice';
import assementQuestionViewReducer from '../redux/cases/assementQuestionViewSlice';
import assementReponseUserReducer from '../redux/cases/assementReponseUserSlice';

 
import userRegisterReducer from '../redux/users/userSlice';
import profileReducer from '../redux/users/profileSlice';
import assessmentResponseCorrectionReducer from '../redux/cases/assessmentResponseCorrectionSlice';
import qualityReducer from '../redux/cases/qualitySlice';
import qualityApprovedReducer from '../redux/cases/qualityApprovedSlice'; 

import customerCaseReducer from './customerCases/customerCaseSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    pendingCases: pendingCasesReducer,
    escalatedCases: escalatedCasesReducer,
    todayCases: todayCasesReducer,
    monthlyResolvedCases: monthlyResolvedCasesReducer,
    caseEntry: caseEntryReducer,
    attendance: attendanceReducer,
    emailTemplate: emailTemplateReducer,
    systemUpdates: systemUpdatesReducer,
    report: reportReducer,
    assessmentData: assessmentReducer,
    assementQuestion: assementQuestionReducer,
    assementQuestionView:assementQuestionViewReducer,
    assementReponseUser:assementReponseUserReducer,
    users:userRegisterReducer,
    assessmentResponseCorrection:assessmentResponseCorrectionReducer,
    profile: profileReducer,
    qualityView: qualityReducer,
    qualityApproved: qualityApprovedReducer,
    customerCase: customerCaseReducer,
  },
});