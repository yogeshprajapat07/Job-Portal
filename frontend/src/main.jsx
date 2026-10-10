import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import Application from "./application.jsx";
import Login from "./Login.jsx";
import Signup from "./Signup.jsx";
import Profile from "./Profile.jsx";
import MyApplications from "./MyApplication.jsx";
import AdminLogin from "./AdminLogin.jsx";


function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.replace("/");
    return null;
  }

  return children;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
  path="/jobs"
  element={
    <ProtectedRoute>
      <App />
    </ProtectedRoute>
  }
/>
        <Route path="/apply" element={<Application />} />
        <Route path="/signup" element={<Signup />} />
        <Route
  path="/profile"
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  }
/>
<Route
  path="/my-applications"
  element={
    <ProtectedRoute>
      <MyApplications />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin-login"
  element={<AdminLogin />}
/>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);