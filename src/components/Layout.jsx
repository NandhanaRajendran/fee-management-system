import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "../styles/main.css";

export default function Layout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="layout">
      {/* Overlay to close sidebar on mobile */}
      {isMobileMenuOpen && (
        <div className={`mobile-overlay`} onClick={closeMobileMenu}></div>
      )}

      <Sidebar isOpen={isMobileMenuOpen} closeMenu={closeMobileMenu} />

      <div className="main">
        <Header toggleMobileMenu={toggleMobileMenu} />
        {children}
      </div>
    </div>
  );
}
