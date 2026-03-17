import { useState } from "react";


import Layout from "../../components/Layout";
import RoomCard from "../../components/RoomCard";
import AttendanceModal from "../../components/AttendanceModal"; // create this

export default function Dashboard() {
  const [showAttendance, setShowAttendance] = useState(false);

  const rooms = [
    1101, 1102, 1103, 1104, 1105, 1106, 1107, 1108, 1109, 1110, 1111, 1112,
    1113, 1114,
  ];

  return (
    <Layout>
      {/* 👁 Button BELOW NAVBAR (Correct position) */}
      <div className="attendance-btn-container">
        <button
          onClick={() => setShowAttendance(true)}
          className="attendance-btn"
        >
          
          <span>View</span>
        </button>
      </div>

      {/* Rooms */}
      <div className="rooms">
        {rooms.map((room, index) => (
          <RoomCard key={index} room={room} />
        ))}
      </div>

      {/* Modal */}
      {showAttendance && (
        <AttendanceModal onClose={() => setShowAttendance(false)} />
      )}
    </Layout>
  );
}
