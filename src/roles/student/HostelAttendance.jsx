import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import StudentLayout from "./StudentLayout";
import API from "../config/api";

// API endpoint (local)
//const API = "https://mess-management-system-q6us.onrender.com";

function HostelAttendance() {
  const { studentId } = useParams(); // expecting route like /student/:studentId/attendance
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  // generate days for the selected month (default to current month)
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  useEffect(() => {
    async function fetchAttendance() {
      try {
        const token = sessionStorage.getItem("token");
        const res = await fetch(`${API}/api/students/${studentId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error("Failed to fetch student");
        const student = await res.json();
        setAttendance(student.attendance || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (studentId) fetchAttendance();
  }, [studentId]);

  const getStatus = (dateStr) => {

    const rec = attendance.find(
      a => a.date?.slice(0, 10) === dateStr
    );

    if (!rec) {
      return {
        label: "Absent+Cut",
        bg: "#E24B4A",
        color: "#fff"
      };
    }

    if (rec.present && !rec.messCut) {
      return {
        label: "Present",
        bg: "#1D9E75",
        color: "#fff"
      };
    }

    if (rec.present && rec.messCut) {
      return {
        label: "Present+Cut",
        bg: "#7F77DD",
        color: "#fff"
      };
    }

    if (!rec.present && !rec.messCut) {
      return {
        label: "Absent",
        bg: "#EF9F27",
        color: "#fff"
      };
    }

    return {
      label: "Absent+Cut",
      bg: "#E24B4A",
      color: "#fff"
    };
  };

  return (
    <StudentLayout>
      <h2>Hostel Attendance</h2>
      {loading ? (
        <p>Loading attendance...</p>
      ) : (
        <div className="calendar" style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px" }}>
          {days.map(d => {
            const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            const status = getStatus(dateStr);
            return (
              <div key={d} style={{ padding: "8px", background: status.bg, color: status.color, borderRadius: "6px", textAlign: "center" }}>
                <strong>{d}</strong><br />{status.label}
              </div>
            );
          })}
        </div>
      )}
    </StudentLayout>
  );
}

export default HostelAttendance;