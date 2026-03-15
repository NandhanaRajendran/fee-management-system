import { useNavigate } from "react-router-dom";

export default function Sidebar({ isOpen, closeMenu }) {

  const navigate = useNavigate();

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>

      <div className="sidebar-header">
        <h2 className="logo">Hostel</h2>

        {/* close button only mobile */}
        <button className="mobile-close-btn" onClick={closeMenu}>
          ×
        </button>
      </div>

      <nav>
        <button onClick={() => { navigate("/mess/dashboard"); closeMenu(); }}>
          Attendance
        </button>

        <button onClick={() => { navigate("/mess/expenses"); closeMenu(); }}>
          Expenses
        </button>

        <button onClick={() => { navigate("/mess/messbill"); closeMenu(); }}>
          Mess Bill
        </button>
      </nav>

    </div>
  );
}