// frontend/src/App.jsx
import React, { use, useEffect } from "react";
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme'; 
import pastelTheme from './pastelTheme'; 
import warmTheme from './warmTheme'; 
import grayscaleTheme from './grayscaleTheme'; 
import neutralTheme from './neutralTheme'; 
import themeBlue from './themeBlue';
import themeLightBootstrap from'./themeLightBootstrap';
import themeArgon from'./themeArgon';


import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { jwtDecode } from 'jwt-decode';

import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Header from "./components/layout/Header";
import BreadcrumbBar from "./components/layout/BreadcrumbBar";
import Footer from "./components/layout/Footer";
import "./assets/css/Style.css";
import Add_Form from "./components/Add_Form";
import ManpowerRequisition from "./components/ManpowerRequisitionForm.jsx";
import ManpowerRequisitionView from "./components/ManpowerRequisitionView";
import ManpowerRequisitionByStatus from "./components/ManPowerRequestionFormByStatus.jsx";
import ManpowerRequisitionReport from "./components/ManpowerRequisitionReport.jsx";
import ManpowerRequisitionEdit from "./components/ManpowerRequisionEdit.jsx";
import Profile from "./components/Profile.jsx";
import FHReply from "./components/FHReply.jsx";
import { login } from "./redux/auth/authSlice.js";
import MRF_Status from "./components/MRF_Status.jsx";
import MRF_Status_Edit from "./components/Mrf_status_edit.jsx";




function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { token, user } = useSelector((state) => state.auth);
console.log(location.pathname,"location")
  const isLoginPage = location.pathname === "/login" || location.pathname === "/" || location.pathname === "/forgot-password" || location.pathname === "/reset-password" || location.pathname.startsWith("/fh-reply/");

  useEffect(() => {
    if (location.pathname.startsWith('/fh-reply/')) {
      const token = location.pathname.split('/fh-reply/')[1];
      if (token) {
      try {
        const decodedData = jwtDecode(token);
        dispatch(login({ emp_id: String(decodedData.user.created_by), emp_pass: decodedData.user.emp_pass }));
        navigate(`/fh-reply/${token}`);
      } catch (e) {
        console.error("Failed to decode or parse token from URL:", e);
      }
    }
  }}, []);


  useEffect(() => {
     if (location.pathname.startsWith("/manpower_requisition_edit/")) {
      console.log(location.pathname,"location")
      const id = location.pathname.split("/manpower_requisition_edit/")[1];
      console.log(id,"id")
      sessionStorage.setItem("MER_EDIT_ID", id)
     }
  }, []);


  return (
    <ThemeProvider theme={themeBlue}>
      <div className="min-h-screen flex flex-col bg-gray-100 text-gray-900">
        {!isLoginPage && <>
    <Header />
    {/* <BreadcrumbBar /> */}
  </>}

        <main className="container mx-auto mt-8 p-4 flex-grow">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />

           <Route path="/dashboard" element={<Dashboard />} />
           <Route path="/add-mrf" element={<Add_Form />} />

           <Route path="/mrf-list" element={<ManpowerRequisition />} />
           <Route path="/mrf-status" element={<MRF_Status />} />
           <Route path="/my-requisitions" element={<ManpowerRequisition />} />
           <Route path="/mrf-list/:param_status" element={<ManpowerRequisitionByStatus />} />

           <Route path="/manpower_requisition_view/:id" element={<ManpowerRequisitionView/>} />
           <Route path="/fh-reply/:id" element={<FHReply/>} />
           {/* <Route path="/manpower_requisition_edit/:id" element={<ManpowerRequisitionView/>} /> */}
            <Route path="/manpower_requisition_edit/:id" element={<ManpowerRequisitionEdit />} />
            <Route path="/mrf_status_edit/:id" element={<MRF_Status_Edit />} />
            
            <Route path="/reports" element={<ManpowerRequisitionReport/>} />
            <Route path="/profile" element={<Profile/>} />



          </Routes>
        </main>

        {!isLoginPage && <Footer />}
      </div>
    </ThemeProvider>
  );
}

export default App;