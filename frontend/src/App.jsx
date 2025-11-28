// frontend/src/App.jsx
import React, { useEffect } from "react";
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



function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { token, user } = useSelector((state) => state.auth);

  const isLoginPage = location.pathname === "/login" || location.pathname === "/" || location.pathname === "/forgot-password" || location.pathname === "/reset-password";

  // This useEffect is now redundant and should be removed entirely
  // The logic is handled by the initial state of the authSlice.
  useEffect(() => {
    if (token && !user) {
      try {
        const decodedToken = jwtDecode(token);
        dispatch(
          setUserFromToken({
            emp_id: decodedToken.emp_id,
            emp_pos: decodedToken.emp_pos,
            emp_name: decodedToken.emp_name,
            emp_dept: decodedToken.emp_dept,
          })
        );
      } catch (error) {
        dispatch(logout());
        navigate("/login");
      }
    }
  }, [token, user, dispatch, navigate]);


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
           <Route path="/mrf-list/:param_status" element={<ManpowerRequisitionByStatus />} />

           <Route path="/manpower_requisition_view/:id" element={<ManpowerRequisitionView/>} />
           <Route path="/manpower_requisition_edit/:id" element={<ManpowerRequisitionView/>} />
            <Route path="/reports" element={<ManpowerRequisitionReport/>} />


          </Routes>
        </main>

        {!isLoginPage && <Footer />}
      </div>
    </ThemeProvider>
  );
}

export default App;