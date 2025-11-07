import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/AdminLogin.css";
import logo from "../assets/logo.png";
import axios from "axios";

// Import Firebase auth
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { initializeApp } from "firebase/app";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBmuXSVsyUdtyJN8ze3Euii0H6Yeae6_bU",
  authDomain: "saloon-booking-system-7ee3f.firebaseapp.com",
  projectId: "saloon-booking-system-7ee3f",
  storageBucket: "saloon-booking-system-7ee3f.firebasestorage.app",
  messagingSenderId: "194406605053",
  appId: "1:194406605053:web:7dbe58c13b680227d19e94",
  measurementId: "G-2XKJWVXY0Z"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState("email"); // email, google

  // Check for Google redirect result
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          const user = result.user;
          await saveGoogleAdminToBackend(user);
        }
      } catch (error) {
        console.error("Redirect result error:", error);
        setError("Google login failed. Please try again.");
      }
    };

    handleRedirectResult();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/admin/login`, formData);
      localStorage.setItem("adminUser", JSON.stringify(res.data.admin));
      navigate("/admin-dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      setLoading(false);
      console.error("Google login error:", error);
      setError("Google login failed. Please try again.");
    }
  };

  const saveGoogleAdminToBackend = async (user) => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/admin/google-login`, {
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      });

      localStorage.setItem("adminUser", JSON.stringify(res.data));
      navigate("/admin-dashboard");
    } catch (error) {
      console.error("Backend save error:", error);
      setError("Failed to save admin data. Please try again.");
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <img src={logo} alt="Logo" className="admin-logo" />
          <h2 className="admin-login-title">Admin Dashboard</h2>
          <p className="admin-login-subtitle">Manage the entire salon platform</p>
        </div>

        {/* Auth Method Selector */}
        <div className="auth-method-selector">
          <button 
            className={`auth-method-btn ${authMethod === 'email' ? 'active' : ''}`}
            onClick={() => setAuthMethod('email')}
          >
            <i className="fas fa-envelope"></i>
            Email
          </button>
          <button 
            className={`auth-method-btn ${authMethod === 'google' ? 'active' : ''}`}
            onClick={() => setAuthMethod('google')}
          >
            <i className="fab fa-google"></i>
            Google
          </button>
        </div>

        {/* Email Login Form */}
        {authMethod === 'email' && (
          <form className="admin-login-form" onSubmit={handleEmailLogin}>
            <div className="input-group">
              <i className="fas fa-envelope input-icon"></i>
              <input
                type="email"
                name="email"
                placeholder="Admin Email"
                className="admin-login-input"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <i className="fas fa-lock input-icon"></i>
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="admin-login-input"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="admin-login-button">
              <i className="fas fa-sign-in-alt"></i>
              Login as Admin
            </button>
          </form>
        )}

        {/* Google Login */}
        {authMethod === 'google' && (
          <div className="google-login-section">
            <button 
              className="google-login-btn" 
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <img
                src="https://www.svgrepo.com/show/355037/google.svg"
                alt="Google"
                className="google-icon"
              />
              {loading ? "Redirecting..." : "Continue with Google"}
            </button>
            <p className="google-note">
              <i className="fas fa-info-circle"></i>
              Use your admin Google account
            </p>
          </div>
        )}

        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-triangle"></i>
            {error}
          </div>
        )}

        <div className="admin-login-footer">
          <p>
            <i className="fas fa-shield-alt"></i>
            Secure Admin Access Only
          </p>
          <div className="login-links">
            <a href="http://localhost:3000/login/customer" className="login-link">
              Customer Login
            </a>
            <span>•</span>
            <a href="http://localhost:3001" className="login-link">
              Business Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;