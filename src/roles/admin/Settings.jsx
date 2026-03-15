import { useState } from "react";
import { UserCircle2, Lock, Database, ChevronDown, Check, X } from "lucide-react";
import "../../styles/admin.css";
import { useProfile } from "../../context/ProfileContext";

const ACADEMIC_YEARS = ["2025-2026", "2024-2025", "2023-2024", "2022-2023"];

export default function Settings() {

  const { profile, updateProfile } = useProfile();

  /* ── Profile ── */
  const [localProfile, setLocalProfile] = useState({ ...profile });
  const [profileSaved, setProfileSaved] = useState(false);

  const handleProfileChange = (e) =>
    setLocalProfile({ ...localProfile, [e.target.name]: e.target.value });

  const handleSaveProfile = () => {
    // Push changes into context → header updates instantly
    updateProfile({
      fullName: localProfile.fullName,
      email:    localProfile.email,
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  /* ── Security ── */
  const [passwords, setPasswords] = useState({
    current: "", newPass: "", confirm: "",
  });
  const [pwError, setPwError] = useState("");
  const [pwSaved, setPwSaved] = useState(false);

  const handlePwChange = (e) =>
    setPasswords({ ...passwords, [e.target.name]: e.target.value });

  const handleUpdatePassword = () => {
    setPwError("");
    if (!passwords.current) { setPwError("Current password is required"); return; }
    if (!passwords.newPass)  { setPwError("New password is required"); return; }
    if (passwords.newPass.length < 6) { setPwError("Password must be at least 6 characters"); return; }
    if (passwords.newPass !== passwords.confirm) { setPwError("Passwords do not match"); return; }
    setPasswords({ current: "", newPass: "", confirm: "" });
    setPwSaved(true);
    setTimeout(() => setPwSaved(false), 2500);
  };

  /* ── System ── */
  const [academicYear, setAcademicYear]     = useState("2025-2026");
  const [showYearPopup, setShowYearPopup]   = useState(false);
  const [systemSaved, setSystemSaved]       = useState(false);

  const handleSaveSystem = () => {
    setSystemSaved(true);
    setTimeout(() => setSystemSaved(false), 2500);
  };

  return (
    <div className="settings-page">

      {/* PAGE HEADER */}
      <div className="settings-page-header">
        <h1>Settings</h1>
        <p>Manage your account settings and preferences</p>
      </div>

      {/* ── PROFILE SETTINGS ── */}
      <div className="settings-card">
        <div className="settings-card-title">
          <div className="settings-icon" style={{ background: "#dbeafe" }}>
            <UserCircle2 size={18} color="#2563eb" />
          </div>
          <h2>Profile Settings</h2>
        </div>

        <div className="settings-row-2">
          <div className="settings-field">
            <label>Full Name</label>
            <input
              name="fullName"
              value={localProfile.fullName}
              onChange={handleProfileChange}
            />
          </div>
          <div className="settings-field">
            <label>Email</label>
            <input
              name="email"
              type="email"
              value={localProfile.email}
              onChange={handleProfileChange}
            />
          </div>
        </div>

        <div className="settings-field">
          <label>Role</label>
          <input
            value={profile.role}
            readOnly
            className="settings-readonly"
          />
        </div>

        <div className="settings-card-footer">
          <button className="settings-save-btn" onClick={handleSaveProfile}>
            Save Changes
          </button>
          {profileSaved && (
            <span className="settings-saved-msg">✓ Header updated successfully</span>
          )}
        </div>
      </div>

      {/* ── SECURITY ── */}
      <div className="settings-card">
        <div className="settings-card-title">
          <div className="settings-icon" style={{ background: "#f3e8ff" }}>
            <Lock size={18} color="#9333ea" />
          </div>
          <h2>Security</h2>
        </div>

        <div className="settings-field">
          <label>Current Password</label>
          <input
            name="current"
            type="password"
            value={passwords.current}
            onChange={handlePwChange}
          />
        </div>

        <div className="settings-row-2">
          <div className="settings-field">
            <label>New Password</label>
            <input
              name="newPass"
              type="password"
              value={passwords.newPass}
              onChange={handlePwChange}
            />
          </div>
          <div className="settings-field">
            <label>Confirm Password</label>
            <input
              name="confirm"
              type="password"
              value={passwords.confirm}
              onChange={handlePwChange}
            />
          </div>
        </div>

        {pwError && <p className="settings-error">{pwError}</p>}

        <div className="settings-card-footer">
          <button className="settings-pw-btn" onClick={handleUpdatePassword}>
            Update Password
          </button>
          {pwSaved && <span className="settings-saved-msg">✓ Password updated</span>}
        </div>
      </div>

      {/* ── SYSTEM SETTINGS ── */}
      <div className="settings-card">
        <div className="settings-card-title">
          <div className="settings-icon" style={{ background: "#fef3c7" }}>
            <Database size={18} color="#d97706" />
          </div>
          <h2>System Settings</h2>
        </div>

        <div className="settings-field">
          <label>Academic Year</label>
          <button
            className="settings-year-trigger"
            onClick={() => setShowYearPopup(true)}
            type="button"
          >
            <span>{academicYear}</span>
            <ChevronDown size={15} />
          </button>
        </div>

        <div className="settings-card-footer">
          <button className="settings-save-btn" onClick={handleSaveSystem}>
            Save Settings
          </button>
          {systemSaved && <span className="settings-saved-msg">✓ Settings saved</span>}
        </div>
      </div>

      {/* ── ACADEMIC YEAR POPUP ── */}
      {showYearPopup && (
        <div className="modal-overlay" onClick={() => setShowYearPopup(false)}>
          <div className="filter-popup settings-year-popup" onClick={(e) => e.stopPropagation()}>
            <div className="filter-popup-header">
              <div>
                <h3>Select Academic Year</h3>
                <p className="filter-popup-sub">Choose the current academic year</p>
              </div>
              <button className="close-btn" onClick={() => setShowYearPopup(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="filter-popup-list">
              {ACADEMIC_YEARS.map((year) => (
                <button
                  key={year}
                  className={`filter-popup-option settings-year-option${academicYear === year ? " selected" : ""}`}
                  onClick={() => { setAcademicYear(year); setShowYearPopup(false); }}
                >
                  <div className="settings-year-option-left">
                    <span className="settings-year-label">{year}</span>
                    {year === ACADEMIC_YEARS[0] && (
                      <span className="settings-year-current-tag">Current</span>
                    )}
                  </div>
                  {academicYear === year && <Check size={15} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}