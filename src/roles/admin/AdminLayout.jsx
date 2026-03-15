import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "../../styles/admin.css";

import {
  LayoutDashboard,
  Users,
  Building2,
  UserCog,
  Receipt,
  Upload,
  Settings,
  Menu,
  X,
} from "lucide-react";

export default function AdminLayout() {

  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const navigation = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Students", path: "/admin/students", icon: Users },
    { name: "Departments", path: "/admin/departments", icon: Building2 },
    { name: "Staff & Faculty", path: "/admin/staff", icon: UserCog },
    { name: "Fee Sections", path: "/admin/fee-sections", icon: Receipt },
    { name: "Bulk Enrollment", path: "/admin/bulk-enrollment", icon: Upload },
    { name: "Settings", path: "/admin/settings", icon: Settings },
  ];

  const logout = () => {
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="admin-layout">

      {/* SIDEBAR */}

      <aside className={`admin-sidebar ${open ? "open" : ""}`}>

        <div className="admin-logo">Enrollment Manager</div>

        <nav>
          {navigation.map((item, index) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={index}
                to={item.path}
                className="admin-link"
                onClick={() => setOpen(false)}
              >
                <Icon size={18} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

      </aside>


      {/* MAIN AREA */}

      <div className="admin-main">

        {/* TOPBAR */}

        <header className="admin-topbar">

          {/* Hamburger */}

          <button
            className="menu-btn"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20}/> : <Menu size={20}/>}
          </button>


          {/* PROFILE */}

          <div className="admin-profile">

            <div className="admin-avatar"></div>

            <div className="admin-info">
              <p><b>Admin Manager</b></p>
              <p>Enrollment Manager</p>
            </div>

          </div>


          {/* LOGOUT */}

          <button
            className="admin-logout"
            onClick={logout}
          >
            Logout
          </button>

        </header>


        {/* PAGE CONTENT */}

        <main className="admin-page">
          <Outlet />
        </main>

      </div>


      {/* MOBILE OVERLAY */}

      {open && (
        <div
          className="mobile-overlay"
          onClick={() => setOpen(false)}
        ></div>
      )}

    </div>
  );
}