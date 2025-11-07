import React, { useEffect, useState } from "react";
import "../css/MyAppointmentsPage.css";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config/api";

const MyAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [rating, setRating] = useState(0);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        console.log("🔍 Fetching appointments for user:", user?.email);
        
        const res = await fetch(
          `${API_BASE_URL}/api/appointments?email=${user?.email}`
        );
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        
        const data = await res.json();
        console.log("✅ Fetched appointments:", data);
        setAppointments(data);
      } catch (err) {
        console.error("❌ Failed to fetch appointments", err);
        alert("Failed to load appointments");
      } finally {
        setLoading(false);
      }
    };

    if (user?.email) {
      fetchAppointments();
    } else {
      console.warn("⚠️ No user email found");
      setLoading(false);
    }
  }, [user?.email]);

  const handleCancel = async (id) => {
    const confirm = window.confirm("Are you sure you want to cancel this appointment?");
    if (!confirm) return;

    try {
      console.log("🗑️ Cancelling appointment:", id);
      
      const response = await fetch(`http://localhost:5000/api/appointments/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to cancel appointment");
      }

      console.log("✅ Appointment cancelled successfully");
      setAppointments((prev) => prev.filter((a) => a._id !== id));
      alert("✅ Appointment cancelled successfully");
    } catch (err) {
      console.error("❌ Cancel failed:", err);
      alert("❌ Failed to cancel appointment");
    }
  };

  const handleReschedule = (appointment) => {
    console.log("🔄 Rescheduling appointment:", appointment);
    
    // Prepare data for rescheduling
    const rescheduleData = {
      rescheduleAppointment: {
        _id: appointment._id,
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        services: appointment.services,
        professionalId: appointment.professionalId
      },
      selectedServices: appointment.services.map(service => ({
        name: service.name,
        price: service.price,
        duration: service.duration || "30 minutes"
      })),
      selectedProfessional: appointment.professionalId,
      salon: appointment.salonId
    };

    console.log("📤 Navigating with reschedule data:", rescheduleData);
    
    // Store in localStorage as backup
    localStorage.setItem("rescheduleData", JSON.stringify(rescheduleData));
    localStorage.setItem("selectedServices", JSON.stringify(rescheduleData.selectedServices));
    localStorage.setItem("selectedProfessional", JSON.stringify(rescheduleData.selectedProfessional));
    localStorage.setItem("selectedSalon", JSON.stringify(rescheduleData.salon));
    
    // Navigate to SelectTimePage with reschedule state
    navigate("/select-time", { state: rescheduleData });
  };

  const openFeedbackPopup = (appointment) => {
    setSelectedAppointment(appointment);
    setShowPopup(true);
    setFeedbackText("");
    setRating(0);
  };

  const openReviewPopup = (appointment) => {
    setSelectedAppointment(appointment);
    setShowReviewPopup(true);
    setFeedbackText("");
    setRating(0);
  };

  const closeAllPopups = () => {
    setShowPopup(false);
    setShowReviewPopup(false);
    setFeedbackText("");
    setRating(0);
    setSelectedAppointment(null);
  };

  const submitFeedback = async () => {
    if (!rating) {
      alert("Please select a rating");
      return;
    }

    try {
      console.log("📤 Submitting feedback:", {
        appointmentId: selectedAppointment._id,
        rating,
        comment: feedbackText
      });

      const res = await fetch(`${API_BASE_URL}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: selectedAppointment._id,
          salonId: selectedAppointment.salonId._id,
          professionalId: selectedAppointment.professionalId?._id,
          userEmail: user.email,
          rating,
          comment: feedbackText,
        }),
      });

      if (res.ok) {
        console.log("✅ Feedback submitted successfully");
        alert("✅ Feedback submitted!");
        closeAllPopups();
      } else {
        throw new Error("Failed to submit feedback");
      }
    } catch (err) {
      console.error("❌ Error submitting feedback:", err);
      alert("❌ Error occurred while submitting feedback");
    }
  };

  const submitReview = async () => {
  if (!rating) {
    alert("Please select a rating");
    return;
  }

  try {
    const professionalId = selectedAppointment.professionalId?._id;
    const professionalName = selectedAppointment.professionalId?.name || "the professional";
    
    console.log("📤 Submitting review as feedback:", {
      appointmentId: selectedAppointment._id,
      professionalId,
      professionalName,
      rating,
      comment: feedbackText
    });

    // Use the same endpoint as feedback
    const res = await fetch("http://localhost:5000/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        appointmentId: selectedAppointment._id,
        salonId: selectedAppointment.salonId._id,
        professionalId: professionalId,
        userEmail: user.email,
        userName: user.name,
        rating,
        comment: feedbackText,
        reviewDate: new Date().toISOString(),
      }),
    });
    
    if (res.ok) {
      console.log("✅ Review submitted successfully");
      alert(`✅ Review submitted successfully for ${professionalName}!`);
      closeAllPopups();
      
      // Navigate to select-professional page with the specific professional ID
      navigate('/', { 
        state: { 
          salonId: selectedAppointment.salonId._id,
          professionalId: professionalId,
          showRatings: true,
          highlightProfessional: professionalId
        } 
      });
    } else {
      throw new Error("Failed to submit review");
    }
  } catch (err) {
    console.error("❌ Error submitting review:", err);
    alert("❌ Error occurred while submitting review");
  }
};

  // Calculate total amount safely
  const calculateTotal = (services) => {
    return services.reduce((total, s) => total + (parseFloat(s.price) || 0), 0);
  };

  // Render appointment status with appropriate styling
  const renderStatus = (status) => {
    const statusClass = 
      status === "confirmed" ? "status-confirmed" :
      status === "completed" ? "status-completed" :
      status === "cancelled" ? "status-cancelled" : "status-pending";
    
    return (
      <span className={statusClass}>
        {status || "Pending"}
      </span>
    );
  };

  // Render action buttons based on appointment status
  const renderActionButtons = (appointment) => {
    const status = appointment.status?.toLowerCase();
    
    if (status === "completed") {
      return (
        <button className="rate-btn" onClick={() => openFeedbackPopup(appointment)}>
          ⭐ Rate
        </button>
      );
    }
    
    if (status === "cancelled") {
      return <span className="cancelled-label">Cancelled</span>;
    }

    // For pending, confirmed, or other active statuses
    return (
      <>
        <button className="reschedule-btn" onClick={() => handleReschedule(appointment)}>
          🔁 Reschedule
        </button>
        <button className="review-btn" onClick={() => openReviewPopup(appointment)}>
          📝 Review
        </button>
        <button className="cancel-btn" onClick={() => handleCancel(appointment._id)}>
          ❌ Cancel
        </button>
      </>
    );
  };

  return (
    <div className="appointment-page-wrapper">
      <aside className="sidebar">
        <div className="logo" onClick={() => navigate("/", { replace: true })}>
          Salon
        </div>
        <div className="user-name">{user?.name}</div>
        <nav>
          <button
            className="nav-btn"
            onClick={() => navigate("/profile", { replace: true })}
          >
            👤 Profile
          </button>
          <button className="nav-btn active">📅 Appointments</button>
          <button
            className="nav-btn logout"
            onClick={() => {
              localStorage.clear();
              navigate("/login", { replace: true });
            }}
          >
            Log out
          </button>
        </nav>
      </aside>

      <div className="appointment-content">
        {/* Back Button */}
        <button
          className="back-btn"
          onClick={() => navigate("/", { replace: true })}
        >
          ← Back
        </button>

        <h2>📋 My Appointments</h2>

        {loading ? (
          <p className="no-data">Loading appointments...</p>
        ) : appointments.length === 0 ? (
          <p className="no-data">No appointments found.</p>
        ) : (
          appointments.map((appointment) => (
            <div className="appointment-card" key={appointment._id}>
              <div className="appointment-top">
                <img
                  src={
                    appointment.salonId?.image
                      ? appointment.salonId.image.startsWith("http")
                        ? appointment.salonId.image
                        : `http://localhost:5000/uploads/${appointment.salonId.image}`
                      : "https://via.placeholder.com/100"
                  }
                  alt={appointment.salonId?.name || "Salon"}
                />
                <div className="salon-info">
                  <h4>{appointment.salonId?.name || "Salon"}</h4>
                  <p>📍 {appointment.salonId?.location || "Location"}</p>
                  <p className="appt-date">
                    📅{" "}
                    {new Date(appointment.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </p>
                  <p className="appt-time">
                    🕒{" "}
                    {appointment.startTime && appointment.endTime
                      ? `${appointment.startTime} – ${appointment.endTime}`
                      : "Time pending"}
                  </p>
                  <p className="appt-status">
                    🔖 <strong>Status:</strong> {renderStatus(appointment.status)}
                  </p>
                </div>
              </div>
              
              <div className="service-info">
                {appointment.services && appointment.services.length > 0 ? (
                  <>
                    {appointment.services.map((service, index) => (
                      <div key={index} className="service-row">
                        <span>🧾 {service.name}</span>
                        <span>LKR {service.price}</span>
                      </div>
                    ))}
                    <div className="total-row">
                      <strong>Total</strong>
                      <strong>LKR {calculateTotal(appointment.services)}</strong>
                    </div>
                  </>
                ) : (
                  <p>No service details available</p>
                )}
              </div>
              
              <div className="action-buttons">
                {renderActionButtons(appointment)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Feedback Popup for Completed Appointments */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Rate {selectedAppointment?.salonId?.name}</h3>
            <textarea
              placeholder="Your feedback..."
              rows={4}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
            ></textarea>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`star ${star <= rating ? "filled" : ""}`}
                  onClick={() => setRating(star)}
                >
                  ★
                </span>
              ))}
            </div>
            <div className="popup-actions">
              <button className="btn-cancel" onClick={closeAllPopups}>
                Cancel
              </button>
              <button className="btn-save" onClick={submitFeedback}>
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Popup for Active Appointments */}
      {showReviewPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Review Your Experience</h3>
            <p>How was your experience at {selectedAppointment?.salonId?.name}?</p>
            
            <div className="rating-section">
              <label>Overall Rating:</label>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star ${star <= rating ? "filled" : ""}`}
                    onClick={() => setRating(star)}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <div className="review-textarea">
              <textarea
                placeholder="Share your experience... (What did you like? Any suggestions?)"
                rows={5}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
              ></textarea>
            </div>

            <div className="popup-actions">
              <button className="btn-cancel" onClick={closeAllPopups}>
                Cancel
              </button>
              <button className="btn-save" onClick={submitReview}>
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointmentsPage;