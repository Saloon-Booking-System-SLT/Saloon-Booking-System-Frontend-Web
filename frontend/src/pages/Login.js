import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider } from "../firebase";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";
import haircutImage from "../assets/hairdresser.jpg";
import "../css/Login.css";
import API_BASE_URL from "../config/api";

export default function CustomerLogin() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check for redirect result on component mount
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          const user = result.user;
          await saveUserToBackend(user);
        }
      } catch (error) {
        console.error("Redirect result error:", error);
        alert("Login failed. Please try again.");
      }
    };

    handleRedirectResult();
  }, []);

  const saveUserToBackend = async (user) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save user");
      }
      
      const savedUser = await res.json();
      localStorage.setItem("user", JSON.stringify(savedUser));
      
      // Redirect to customer dashboard (My Appointments page)
      navigate("/appointments");
    } catch (error) {
      console.error("Backend save error:", error);
      alert("Failed to save user data. Please try again.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      // Use redirect instead of popup to avoid COOP issues
      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      setLoading(false);
      console.error("Google login error:", error);
      
      // Handle specific Firebase auth errors
      if (error.code === 'auth/unauthorized-domain') {
        alert("This domain is not authorized for Google login. Please contact support.");
      } else {
        alert("Google login failed. Please try again.");
      }
    }
  };

  const setupRecaptcha = () => {
    window.recaptchaVerifier = new RecaptchaVerifier(
      "recaptcha-container",
      { size: "invisible" },
      auth
    );
  };

  const sendOtp = async () => {
    if (!phone.startsWith("+94")) {
      return alert("Use format: +94771234567");
    }
    setupRecaptcha();
    try {
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phone, appVerifier);
      setConfirmationResult(result);
      setShowOtp(true);
      alert("OTP sent");
    } catch {
      alert("Failed to send OTP");
    }
  };

  const verifyOtp = async () => {
    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      
      // Save phone user to backend
      const phoneUser = await savePhoneUserToBackend(user);
      
      navigate("/appointments");
    } catch (error) {
      console.error("OTP verification error:", error);
      alert("Invalid OTP");
    }
  };

  const savePhoneUserToBackend = async (user) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/phone-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: user.phoneNumber,
          name: "Phone User"
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save phone user");
      }
      
      const savedUser = await res.json();
      localStorage.setItem("user", JSON.stringify(savedUser));
      return savedUser;
    } catch (error) {
      console.error("Backend save error:", error);
      // Even if backend fails, create local user for session
      const localUser = {
        name: "Phone User",
        phone: user.phoneNumber,
        email: "",
        photoURL: "",
      };
      localStorage.setItem("user", JSON.stringify(localUser));
      return localUser;
    }
  };

  const handleGuestContinue = async () => {
    try {
      // Create guest session with backend
      const res = await fetch(`${API_BASE_URL}/api/users/guest-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        const guestUser = await res.json();
        localStorage.setItem("user", JSON.stringify(guestUser));
      } else {
        // Fallback to local guest user
        const guestUser = {
          _id: 'guest_' + Date.now(),
          name: 'Guest User',
          email: '',
          phone: '',
          photoURL: '',
          isGuest: true
        };
        localStorage.setItem("user", JSON.stringify(guestUser));
      }
      
      navigate("/");
    } catch (error) {
      console.error("Guest login error:", error);
      // Always allow guest access as fallback
      const guestUser = {
        _id: 'guest_' + Date.now(),
        name: 'Guest User',
        email: '',
        phone: '',
        photoURL: '',
        isGuest: true
      };
      localStorage.setItem("user", JSON.stringify(guestUser));
      navigate("/");
    }
  };

  return (
    <div className="login-container">
      <div className="form-section">
        <h2 className="login-title1">Welcome to Salon</h2>
        <p className="login-subtext1">
          Log in to book top salon services easily and quickly.
        </p>

        <button 
          className="google-btn" 
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

        <div className="divider">
          <hr className="line" />
          <span className="or-text">OR</span>
          <hr className="line" />
        </div>

        <input
          type="tel"
          className="input"
          placeholder="Enter phone (+94...)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        {showOtp && (
          <input
            type="text"
            className="input"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
        )}
        <button
          className="continue-btn"
          onClick={showOtp ? verifyOtp : sendOtp}
        >
          {showOtp ? "Verify OTP" : "Send OTP"}
        </button>

        <button className="guest-btn" onClick={handleGuestContinue}>
          🎉 Continue as Guest
        </button>

        <div id="recaptcha-container"></div>

        <p className="business-link">
          Are you a salon owner?{" "}
          <a href="/login/business" className="sign-in-link">
            Login here
          </a>
        </p>
      </div>

      <div className="image-section">
        <img src={haircutImage} alt="Salon" className="login-image" />
      </div>
    </div>
  );
}
