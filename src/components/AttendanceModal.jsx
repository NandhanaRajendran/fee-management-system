import { useState, useEffect } from "react";
import "../styles/mess.css"

export default function AttendanceModal({ onClose }) {

  const [month, setMonth] = useState(new Date().getMonth());
  const [data, setData] = useState([]);

  useEffect(() => {
    // 🔹 Dummy data (replace with backend later)
    const dummy = [
      {
        room: "1101",
        adno: "A101",
        name: "Anu",
        attendance: Array(31).fill({ present: true, messCut: false })
      },
      {
        room: "1102",
        adno: "A102",
        name: "Rahul",
        attendance: Array(31).fill({ present: false, messCut: true })
      }
    ];

    setData(dummy);
  }, [month]);

  // 🔹 Get number of days dynamically
  const getDaysInMonth = (month) => {
    return new Date(2026, month + 1, 0).getDate();
  };

  const days = getDaysInMonth(month);

  // 🔹 Cell color logic
  const getCellClass = (day) => {
    if (day.present && !day.messCut) return "cell-green";
    if (day.present && day.messCut) return "cell-purple";
    if (!day.present && !day.messCut) return "cell-yellow";
    return "cell-red";
  };

  return (
    <div className="attendance-overlay">

      <div className="attendance-modal">

        {/* HEADER */}
        <div className="attendance-modal-header">
          <h2>Monthly Attendance</h2>
          <button className="attendance-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* CONTROLS */}
        <div className="attendance-controls">

          {/* Month Selector */}
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {[
              "Jan","Feb","Mar","Apr","May","Jun",
              "Jul","Aug","Sep","Oct","Nov","Dec"
            ].map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>

          {/* LEGEND */}
          <div className="attendance-legend">

            <div className="legend-box">
              <div className="legend-color" style={{ background: "#2ecc71" }}></div>
              Present
            </div>

            <div className="legend-box">
              <div className="legend-color" style={{ background: "#ea00ff" }}></div>
              Present + Mess Cut
            </div>

            <div className="legend-box">
              <div className="legend-color" style={{ background: "#facc15" }}></div>
              Absent
            </div>

            <div className="legend-box">
              <div className="legend-color" style={{ background: "#ef4444" }}></div>
              Absent + Mess Cut
            </div>

          </div>

        </div>

        {/* TABLE */}
        <div className="attendance-table-wrapper">

          <table className="attendance-sheet">

            <thead>
              <tr>
                <th>Room</th>
                <th>Ad No</th>
                <th>Name</th>

                {[...Array(days)].map((_, i) => (
                  <th key={i}>{i + 1}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {data.map((student, index) => (
                <tr key={index}>

                  <td>{student.room}</td>
                  <td>{student.adno}</td>
                  <td>{student.name}</td>

                  {student.attendance.slice(0, days).map((day, i) => (
                    <td key={i} className={getCellClass(day)}></td>
                  ))}

                </tr>
              ))}
            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}