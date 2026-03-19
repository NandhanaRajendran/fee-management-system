// src/components/AlertToast.jsx
import { useEffect } from "react";

// type: "success" | "error" | "warning" | "info"
export default function AlertToast({ message, type = "info", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: { bg: "#f0fdf4", border: "#86efac", color: "#166534", icon: "✓" },
    error:   { bg: "#fef2f2", border: "#fca5a5", color: "#991b1b", icon: "✕" },
    warning: { bg: "#fffbeb", border: "#fcd34d", color: "#92400e", icon: "⚠" },
    info:    { bg: "#eff6ff", border: "#93c5fd", color: "#1e40af", icon: "ℹ" },
  };

  const s = styles[type] || styles.info;

  return (
    <div style={{
      position: "fixed",
      top: "24px",
      right: "24px",
      zIndex: 9999,
      display: "flex",
      alignItems: "flex-start",
      gap: "12px",
      background: s.bg,
      border: `1px solid ${s.border}`,
      color: s.color,
      padding: "14px 18px",
      borderRadius: "12px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
      maxWidth: "380px",
      fontSize: "13px",
      fontFamily: "'DM Sans', sans-serif",
      fontWeight: "500",
      lineHeight: "1.5",
      animation: "toastSlideIn 0.25s cubic-bezier(0.22,1,0.36,1)",
    }}>
      <span style={{
        fontSize: "16px", fontWeight: "700",
        flexShrink: 0, marginTop: "1px",
      }}>
        {s.icon}
      </span>
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: "none", border: "none",
          cursor: "pointer", color: s.color,
          fontSize: "16px", padding: "0",
          flexShrink: 0, opacity: 0.6,
          lineHeight: 1,
        }}
      >✕</button>

      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(40px) scale(0.95); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
    </div>
  );
}