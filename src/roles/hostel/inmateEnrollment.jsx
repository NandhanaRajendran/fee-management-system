import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/hostel.css";

function Enrollment() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("Student enrolled successfully!");
  };

  return (
    <div className="hostelPage">
      <div className="formPage">
        <div className="formCard">
          <div className="formHeader">
            <button
              className="backBtn"
              onClick={() => navigate("/hostel/dashboard")}
            >
              Back
            </button>

            <h2>Enroll New Inmate</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <input placeholder="Admission Number" required />
            <input placeholder="Student Name" required />

            <select required>
              <option value="">Select Department</option>
              <option value="CSE">Computer Science</option>
              <option value="ECE">Electronics</option>
              <option value="EEE">Electrical</option>
              <option value="ME">Mechanical</option>
              <option value="CE">Civil</option>
            </select>

            <select required>
              <option value="">Select Semester</option>
              <option value="S1">Semester 1</option>
              <option value="S2">Semester 2</option>
              <option value="S3">Semester 3</option>
              <option value="S4">Semester 4</option>
              <option value="S5">Semester 5</option>
              <option value="S6">Semester 6</option>
              <option value="S7">Semester 7</option>
              <option value="S8">Semester 8</option>
            </select>

            <input placeholder="Hostel Name" required />
            <input placeholder="Room Number" required />

            <button className="submitBtn">Enroll Student</button>
          </form>

          {message && <p className="successMsg">{message}</p>}
        </div>
      </div>
    </div>
  );
}

export default Enrollment;
