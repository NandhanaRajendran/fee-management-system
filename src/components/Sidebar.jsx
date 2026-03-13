import { useNavigate } from "react-router-dom";

export default function Sidebar({ isOpen, closeMenu }) {
  const navigate = useNavigate();

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <h2 className="logo">Hostel</h2>
        <button className="mobile-close-btn" onClick={closeMenu}>
          &times;
        </button>
      </div>

      <nav>
        <button onClick={() => { navigate("/"); closeMenu && closeMenu(); }}>
          Attendance
        </button>
        <button onClick={() => { navigate("/expenses"); closeMenu && closeMenu(); }}>
          Expenses
        </button>
        <button onClick={() => { navigate("/messbill"); closeMenu && closeMenu(); }}>
          Mess Bill
        </button>
      </nav>

      <button className="logout">
        Logout
      </button>
    </div>
  );
}