import { Menu, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Header({ toggleMenu }) {

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="header-card">

      {/* Hamburger (Mobile only) */}
      <button className="menu-icon" onClick={toggleMenu}>
        <Menu size={20} />
      </button>

      {/* Profile Section */}
      <div className="profile-section">

        <div className="avatar"></div>

        <div className="profile-details">
          <p><b>Name:</b> Nandhana</p>
          <p><b>Admission no:</b> 12345</p>
          <p><b>Dept:</b> CSE</p>
          <p><b>Hostel:</b> Ladies Hostel</p>
        </div>

      </div>

      {/* Logout */}
      <button className="logout-btn" onClick={handleLogout}>
        <LogOut size={16}/>
        Logout
      </button>

    </div>
  );
}