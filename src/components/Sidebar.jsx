import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar({ isOpen, closeMenu }) {
  const navigate  = useNavigate();
  const location  = useLocation();

  const navItems = [
    { label: "Dashboard",   path: "/mess/dashboard"  },
    { label: "Attendance",  path: "/mess/attendance" },
    { label: "Expenses",    path: "/mess/expenses"   },
    { label: "Mess Bill",   path: "/mess/messbill"   },
  ];

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <h2 className="logo">Hostel</h2>
        <button className="mobile-close-btn" onClick={closeMenu}>×</button>
      </div>
      <nav>
        {navItems.map(({ label, path }) => (
          <button
            key={path}
            onClick={() => { navigate(path); closeMenu(); }}
            style={location.pathname === path ? {
              background: "#2f6bff",
              color: "white",
            } : {}}
          >
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}