import { useParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import Layout from "../../components/Layout";
import AlertToast from "../../components/Alerttoast";

//const API = "http://localhost:5000";
const API = "https://mess-management-system-q6us.onrender.com"; // ← uncomment for production

export default function Attendance() {
  const { roomId } = useParams();
  const today = new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(today);
  const [inmates, setInmates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "info") => setToast({ message, type });

  const selectedMonth = date.slice(0, 7);

  // ─── ALLOWED MONTHS: current and previous only ─────────────
  function isAllowedMonth(m) {
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7);
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonth = prev.toISOString().slice(0, 7);
    return m === currentMonth || m === prevMonth;
  }

  const isEditable = isAllowedMonth(selectedMonth) && !isPublished;

  // ─── FETCH STUDENTS ────────────────────────────────────────
  const fetchStudents = useCallback(async () => {
    try {
      const response = await fetch(`${API}/api/students/room/${roomId}`);
      if (!response.ok) throw new Error("Failed to fetch students");
      const data = await response.json();
      setInmates(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // ─── FETCH PUBLISH STATUS ──────────────────────────────────
  useEffect(() => {
    const checkPublished = async () => {
      try {
        const billRes = await fetch(`${API}/api/bill/${selectedMonth}`);
        const billData = billRes.ok ? await billRes.json() : {};
        setIsPublished(billData?.published || false);
      } catch (_) {
        setIsPublished(false);
      }
    };
    checkPublished();
  }, [selectedMonth]);

  // ─── DAILY RECORD ──────────────────────────────────────────
  function getDailyRecord(person) {
    const record = person.attendance?.find((r) => r.date === date);
    return {
      present: record?.present ?? false,
      messcut: record?.messCut ?? true,
    };
  }

  // ─── MONTHLY COUNT ─────────────────────────────────────────
  function calculateMonthlyAttendance(person) {
    return (person.attendance || []).filter(
      (r) => r.date.startsWith(selectedMonth) && r.messCut === false
    ).length;
  }

  // ─── UPDATE ATTENDANCE ─────────────────────────────────────
  async function updateAttendance(id, payload) {
    if (!isAllowedMonth(selectedMonth)) {
      showToast("You can only update attendance for the current or previous month.", "warning"); 
      return;
      
    }
    if (isPublished) {
      showToast("Attendance is frozen — bill has been published.", "warning"); 
      return;
    }
    try {
      const response = await fetch(`${API}/api/students/attendance/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to update");
      const updated = await response.json();
      setInmates((prev) =>
        prev.map((s) => (s._id === updated._id ? updated : s))
      );
    } catch (err) {
      console.error(err);
      showToast("Error updating record. Is the server running?", "error");
    }
  }

  function toggleAttendance(index) {
    const student = inmates[index];
    const { present, messcut } = getDailyRecord(student);
    updateAttendance(student._id, { date, present: !present, messCut: messcut });
  }

  function toggleMessCut(index) {
    const student = inmates[index];
    const { present, messcut } = getDailyRecord(student);
    updateAttendance(student._id, { date, present, messCut: !messcut });
  }

  // ─── DATE PICKER HELPERS ───────────────────────────────────
  const MONTHS = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const now       = new Date();
  const nowYear   = now.getFullYear();
  const nowMonth  = now.getMonth() + 1; // 1-based
  const prevMonth = nowMonth === 1 ? 12 : nowMonth - 1;
  const prevYear  = nowMonth === 1 ? nowYear - 1 : nowYear;

  // Only current year and previous year (deduplicated)
  const YEAR_OPTIONS = [...new Set([prevYear, nowYear])];

  const pickerYear  = parseInt(date.split("-")[0]);
  const pickerMonth = parseInt(date.split("-")[1]);
  const pickerDay   = parseInt(date.split("-")[2]);

  // Month options: only the two allowed months for selected year
  const MONTH_OPTIONS = MONTHS
    .map((name, i) => ({ name, num: i + 1 }))
    .filter(({ num }) => {
      if (pickerYear === nowYear && nowYear === prevYear) {
        return num === nowMonth || num === prevMonth;
      }
      if (pickerYear === nowYear)  return num === nowMonth;
      if (pickerYear === prevYear) return num === prevMonth;
      return false;
    });

  const daysInMonth = new Date(pickerYear, pickerMonth, 0).getDate();
  const DAYS = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  function handlePickerYear(y) {
    // Auto-select the correct allowed month for the chosen year
    let m = pickerMonth;
    if (y === nowYear && y !== prevYear)  m = nowMonth;
    if (y === prevYear && y !== nowYear)  m = prevMonth;
    const maxDay = new Date(y, m, 0).getDate();
    const d = Math.min(pickerDay, maxDay);
    setDate(`${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`);
  }

  function handlePickerMonth(m) {
    const maxDay = new Date(pickerYear, m, 0).getDate();
    const d = Math.min(pickerDay, maxDay);
    setDate(`${pickerYear}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`);
  }

  function handlePickerDay(d) {
    setDate(`${pickerYear}-${String(pickerMonth).padStart(2,"0")}-${String(d).padStart(2,"0")}`);
  }

  const selectStyle = {
    padding: "6px 10px", borderRadius: "8px",
    border: "1px solid #dde3ef", fontSize: "13px",
    fontFamily: "'DM Sans', sans-serif",
    background: "#f8faff", cursor: "pointer",
  };

  return (
    <Layout>
      <div className="attendance-container">
        <div className="attendance-header">
          <h2>Room {roomId}</h2>

          <div className="date-box">
            <label>Date :</label>
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>

              {/* Day */}
              <select
                value={pickerDay}
                onChange={(e) => handlePickerDay(Number(e.target.value))}
                style={{ ...selectStyle, width: "64px" }}
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>{String(d).padStart(2,"0")}</option>
                ))}
              </select>

              {/* Month — only allowed months for selected year */}
              <select
                value={pickerMonth}
                onChange={(e) => handlePickerMonth(Number(e.target.value))}
                style={{ ...selectStyle, minWidth: "110px" }}
              >
                {MONTH_OPTIONS.map(({ name, num }) => (
                  <option key={num} value={num}>{name}</option>
                ))}
              </select>

              {/* Year — current and prev only */}
              <select
                value={pickerYear}
                onChange={(e) => handlePickerYear(Number(e.target.value))}
                style={{ ...selectStyle, width: "80px" }}
              >
                {YEAR_OPTIONS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>

            </div>
          </div>
        </div>

        {isPublished && (
          <div style={{
            background: "#fef9c3", border: "1px solid #fde047",
            color: "#854d0e", padding: "10px 16px", borderRadius: "8px",
            marginBottom: "12px", fontSize: "13px", fontWeight: "600",
          }}>
            🔒 Bill published — attendance for {MONTHS[pickerMonth - 1]} {pickerYear} is frozen.
          </div>
        )}

        {error && (
          <div style={{ color: "red", padding: "10px" }}>Error: {error}</div>
        )}

        <div className="table-responsive">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Inmates</th>
                <th>Daily Attendance</th>
                <th>Mess Cut</th>
                <th>Monthly Attendance</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>Loading...</td>
                </tr>
              ) : inmates.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>No students found in this room.</td>
                </tr>
              ) : (
                inmates.map((person, index) => {
                  const { present, messcut } = getDailyRecord(person);
                  return (
                    <tr key={person._id}>
                      <td>{person.name}</td>
                      <td>
                        <button
                          disabled={!isEditable}
                          className={present ? "present" : "absent"}
                          onClick={() => toggleAttendance(index)}
                        >
                          {present ? "Present" : "Absent"}
                        </button>
                      </td>
                      <td>
                        <button
                          disabled={!isEditable}
                          className={messcut ? "messcut-on" : "messcut-off"}
                          onClick={() => toggleMessCut(index)}
                        >
                          {messcut ? "Cut" : "No Cut"}
                        </button>
                      </td>
                      <td>{calculateMonthlyAttendance(person)} Days</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* TOAST */}
      {toast && <AlertToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </Layout>
  );
}