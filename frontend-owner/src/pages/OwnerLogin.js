import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../css/OwnerLogin.css";
import loginImage from "../assets/login-image.jpg";
import axios from "axios";

// Import Firebase auth
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
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

const OwnerLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState("email"); // email, google, phone

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

  const saveGoogleUserToBackend = useCallback(async (user) => {
    try {
      console.log("Attempting Google login with:", user);
      const res = await axios.post(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/salons/google-login`, {
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      });

      console.log("Google login response:", res.data);
      
      if (res.data.salon) {
        localStorage.setItem("salonUser", JSON.stringify(res.data.salon));
        console.log("Google user saved to localStorage:", res.data.salon);
        navigate("/dashboard");
      } else {
        setError("Invalid response from server");
      }
    } catch (error) {
      console.error("Backend save error:", error);
      setError("Failed to save user data. Please try again.");
    }
  }, [navigate]);

  // Check for Google redirect result
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          const user = result.user;
          await saveGoogleUserToBackend(user);
        }
      } catch (error) {
        console.error("Redirect result error:", error);
        setError("Google login failed. Please try again.");
      }
    };

    handleRedirectResult();
  }, [saveGoogleUserToBackend]);

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
      console.log("Attempting email login with:", formData);
      const res = await axios.post(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/salons/login`, formData);
      console.log("Login response:", res.data);
      
      if (res.data.salon) {
        localStorage.setItem("salonUser", JSON.stringify(res.data.salon));
        console.log("User saved to localStorage:", res.data.salon);
        navigate("/dashboard");
      } else {
        setError("Invalid response from server");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Login failed");
    }
  };

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        "recaptcha-container",
        { size: "invisible" },
        auth
      );
    }
  };

  const sendOtp = async () => {
    if (!phone.startsWith("+94")) {
      return setError("Please use Sri Lankan format: +94771234567");
    }
    
    setupRecaptcha();
    try {
      setError("");
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phone, appVerifier);
      setConfirmationResult(result);
      setShowOtp(true);
      alert("OTP sent to your phone");
    } catch (error) {
      console.error("OTP send error:", error);
      setError("Failed to send OTP. Please try again.");
    }
  };

  const verifyOtp = async () => {
    try {
      setError("");
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      
      // Save phone user to backend
      const res = await axios.post(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/salons/phone-login`, {
        phone: user.phoneNumber,
        name: "Phone Owner"
      });

      localStorage.setItem("salonUser", JSON.stringify(res.data.salon));
      navigate("/dashboard");
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("Invalid OTP. Please try again.");
    }
  };

  return (
    <div className="owner-login-container">
      <div className="owner-login-left">
        <div className="owner-logo-bar">
          
        </div>

        <h2 className="owner-login-title">Login to Your Salon</h2>
        <p className="owner-login-subtitle">Manage appointments & services</p>

        {/* Auth Method Selector */}
        <div className="auth-method-selector">
          <button 
            className={`auth-method-btn ${authMethod === 'email' ? 'active' : ''}`}
            onClick={() => setAuthMethod('email')}
          >
            Email
          </button>
          <button 
            className={`auth-method-btn ${authMethod === 'google' ? 'active' : ''}`}
            onClick={() => setAuthMethod('google')}
          >
            Google
          </button>
          <button 
            className={`auth-method-btn ${authMethod === 'phone' ? 'active' : ''}`}
            onClick={() => setAuthMethod('phone')}
          >
            Phone
          </button>
        </div>

        {/* Email Login Form */}
        {authMethod === 'email' && (
          <form className="owner-login-form" onSubmit={handleEmailLogin}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="owner-login-input"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="owner-login-input"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button type="submit" className="owner-login-button">
              Login with Email
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
          </div>
        )}

        {/* Phone Login */}
        {authMethod === 'phone' && (
          <div className="phone-login-section">
            <input
              type="tel"
              className="owner-login-input"
              placeholder="Enter phone (+94...)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {showOtp && (
              <input
                type="text"
                className="owner-login-input"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            )}
            <button
              className="owner-login-button"
              onClick={showOtp ? verifyOtp : sendOtp}
            >
              {showOtp ? "Verify OTP" : "Send OTP"}
            </button>
          </div>
        )}

        {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}

        <div id="recaptcha-container"></div>

        <p className="owner-redirect-text">
          Not registered yet? <a href="/register" className="owner-redirect-link">Register here</a>
        </p>
      </div>

      <div className="owner-login-right">
        <img src={loginImage} alt="Salon" className="owner-login-image" />
      </div>
    </div>
  );
};

export default OwnerLogin;
