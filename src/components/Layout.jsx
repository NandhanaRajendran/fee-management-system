import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "../styles/mess.css";

export default function Layout({ children }) {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleMenu = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeMenu = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="layout">

      <Sidebar isOpen={sidebarOpen} closeMenu={closeMenu} />

      <div className="main">

        <Header toggleMenu={toggleMenu} />

        {children}

      </div>

      {/* overlay for mobile */}
      {sidebarOpen && (
        <div className="mobile-overlay" onClick={closeMenu}></div>
      )}

    </div>
  );
}