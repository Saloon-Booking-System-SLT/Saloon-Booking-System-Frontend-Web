// firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";

// ✅ Your new Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBmuXSVsyUdtyJN8ze3Euii0H6Yeae6_bU",
  authDomain: "saloon-booking-system-7ee3f.firebaseapp.com",
  projectId: "saloon-booking-system-7ee3f",
  storageBucket: "saloon-booking-system-7ee3f.firebasestorage.app",
  messagingSenderId: "194406605053",
  appId: "1:194406605053:web:7dbe58c13b680227d19e94",
  measurementId: "G-2XKJWVXY0Z"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// ✅ Auth and Providers
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// ✅ Optional: Limit login to session only (not persisted after close)
setPersistence(auth, browserSessionPersistence)
  .then(() => console.log("✅ Session-only login enabled"))
  .catch((err) => console.error("❌ Auth persistence error:", err));

// ✅ Recaptcha Setup Function
const setupRecaptcha = (containerId = "recaptcha-container") => {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(
      containerId,
      {
        size: "invisible",
        callback: (response) => {
          console.log("reCAPTCHA solved:", response);
        },
      },
      auth
    );
  }
  return window.recaptchaVerifier;
};

// ✅ Export everything needed
export {
  auth,
  googleProvider,
  signInWithPhoneNumber,
  setupRecaptcha,
  analytics,
};
