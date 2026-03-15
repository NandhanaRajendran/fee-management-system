import { useState } from "react";
import { Plus, Search, Pencil, Trash2, X, ChevronDown, Check } from "lucide-react";
import "../../styles/admin.css";
import { useFaculty } from "../../context/FacultyContext";
import { useDepartments } from "../../context/DepartmentContext";

export default function Staff() {

  const { faculty, displayRole, addFaculty, deleteFaculty } = useFaculty();
  const { departments } = useDepartments();

  const [activeTab, setActiveTab]     = useState("All");
  const [search, setSearch]           = useState("");
  const [filterDept, setFilterDept]   = useState("");
  const [filterClass, setFilterClass] = useState("");

  // "dept" | "class" | "modal-dept" | null
  const [filterPopup, setFilterPopup] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData]   = useState({
    name: "", department: "", email: "", phone: "",
  });

  /* ── class options for selected filter dept ── */
  const filterDeptObj      = departments.find((d) => d.name === filterDept);
  const filterClassOptions = filterDeptObj ? filterDeptObj.activeClasses : [];

  /* ── extract semester from "DeptName-S1" → "S1" ── */
  const displayClass = (f) => {
    if (!f.assignedClass) return null;
    return f.assignedClass.split("-").pop();
  };

  /* ── protected: HOD or S1 advisor cannot be deleted ── */
  const isProtected = (f) => {
    if (f.role === "HOD") return true;
    if (f.assignedClass && f.assignedClass.endsWith("-S1")) return true;
    return false;
  };

  const handleDelete = (f) => {
    if (isProtected(f)) return;
    deleteFaculty(f.id);
  };

  /* ── filtering ── */
  const filteredFaculty = faculty.filter((f) => {
    const role = displayRole(f);
    const searchMatch = f.name.toLowerCase().includes(search.toLowerCase());
    const tabMatch =
      activeTab === "All" ||
      (activeTab === "HODs"           && role === "HOD") ||
      (activeTab === "Staff Advisors" && role === "Staff Advisor") ||
      (activeTab === "Faculty"        && role === "Faculty");
    const deptMatch  = !filterDept  || f.department === filterDept;
    const classMatch =
      !filterClass ||
      (f.assignedClass && f.assignedClass.split("-").pop() === filterClass);
    return searchMatch && tabMatch && deptMatch && classMatch;
  });

  /* ── add faculty ── */
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAddFaculty = () => {
    if (!formData.name || !formData.department) {
      alert("Name and Department are required");
      return;
    }
    const exists = faculty.some(
      (f) => f.name.toLowerCase() === formData.name.toLowerCase()
    );
    if (exists) { alert("Faculty already exists"); return; }
    addFaculty(formData);
    setShowModal(false);
    setFormData({ name: "", department: "", email: "", phone: "" });
  };

  /* ── open modal fresh ── */
  const openModal = () => {
    setFormData({ name: "", department: "", email: "", phone: "" });
    setFilterPopup(null);
    setShowModal(true);
  };

  /* ── role badge ── */
  const roleBadgeClass = (role) => {
    if (role === "HOD")           return "status hod";
    if (role === "Staff Advisor") return "status staff-advisor";
    return "status faculty";
  };

  return (
    <div>

      {/* HEADER */}
      <div className="students-header">
        <div>
          <h1>Staff & Faculty Management</h1>
          <p>Manage HODs and staff advisors</p>
        </div>
        <button className="add-student-btn" onClick={openModal}>
          <Plus size={16} /> Add Staff Member
        </button>
      </div>

      {/* TABS */}
      <div className="staff-tabs">
        {["All", "HODs", "Staff Advisors", "Faculty"].map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? "tab active" : "tab"}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "All" ? "All Members" : tab}
          </button>
        ))}
      </div>

      {/* FILTERS */}
      <div className="students-filters">

        <div className="search-box">
          <Search size={16} />
          <input
            placeholder="Search faculty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Department filter trigger */}
        <button
          className="filter-popup-trigger"
          onClick={() => setFilterPopup(filterPopup === "dept" ? null : "dept")}
        >
          <span>{filterDept || "All Departments"}</span>
          <ChevronDown size={14} />
          {filterDept && (
            <span
              className="filter-clear"
              onClick={(e) => { e.stopPropagation(); setFilterDept(""); setFilterClass(""); }}
            >
              <X size={11} />
            </span>
          )}
        </button>

        {/* Class filter trigger */}
        <button
          className={`filter-popup-trigger${!filterDept ? " disabled" : ""}`}
          onClick={() => filterDept && setFilterPopup(filterPopup === "class" ? null : "class")}
        >
          <span>{filterClass || "All Classes"}</span>
          <ChevronDown size={14} />
          {filterClass && (
            <span
              className="filter-clear"
              onClick={(e) => { e.stopPropagation(); setFilterClass(""); }}
            >
              <X size={11} />
            </span>
          )}
        </button>

        <span className="student-count">
          {filteredFaculty.length} member{filteredFaculty.length !== 1 ? "s" : ""}
        </span>

      </div>

      {/* TABLE */}
      <div className="students-table-wrapper">
        <table className="students-table">
          <thead>
            <tr>
              <th>NAME</th>
              <th>ROLE</th>
              <th>DEPARTMENT</th>
              <th>CLASS</th>
              <th>CONTACT</th>
              <th>LOGIN</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredFaculty.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", color: "#94a3b8", padding: "24px" }}>
                  No members found
                </td>
              </tr>
            ) : (
              filteredFaculty.map((f) => {
                const role       = displayRole(f);
                const sem        = displayClass(f);
                const protected_ = isProtected(f);
                return (
                  <tr key={f.id}>
                    <td>{f.name}</td>
                    <td><span className={roleBadgeClass(role)}>{role}</span></td>
                    <td>{f.department}</td>
                    <td>
                      {sem
                        ? <span className="class-sem-badge">{sem}</span>
                        : <span style={{ color: "#94a3b8" }}>–</span>}
                    </td>
                    <td>{f.email || "–"}<br />{f.phone || ""}</td>
                    <td style={{ fontSize: "12px" }}>{f.username}<br />{f.password}</td>
                    <td className="actions">
                      <Pencil size={16} className="action edit" />
                      {!protected_ && (
                        <Trash2
                          size={16}
                          className="action delete"
                          onClick={() => handleDelete(f)}
                        />
                      )}
                      {protected_ && (
                        <span className="protected-hint" title="Cannot delete — required role">🔒</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── DEPARTMENT FILTER POPUP ── */}
      {filterPopup === "dept" && (
        <div className="modal-overlay" onClick={() => setFilterPopup(null)}>
          <div className="filter-popup" onClick={(e) => e.stopPropagation()}>
            <div className="filter-popup-header">
              <h3>Filter by Department</h3>
              <button className="close-btn" onClick={() => setFilterPopup(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="filter-popup-list">
              <button
                className={`filter-popup-option${!filterDept ? " selected" : ""}`}
                onClick={() => { setFilterDept(""); setFilterClass(""); setFilterPopup(null); }}
              >
                <span>All Departments</span>
                {!filterDept && <Check size={14} />}
              </button>
              {departments.map((d) => (
                <button
                  key={d.id}
                  className={`filter-popup-option${filterDept === d.name ? " selected" : ""}`}
                  onClick={() => { setFilterDept(d.name); setFilterClass(""); setFilterPopup(null); }}
                >
                  <span>{d.name}</span>
                  {filterDept === d.name && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── CLASS FILTER POPUP ── */}
      {filterPopup === "class" && (
        <div className="modal-overlay" onClick={() => setFilterPopup(null)}>
          <div className="filter-popup" onClick={(e) => e.stopPropagation()}>
            <div className="filter-popup-header">
              <h3>Filter by Class</h3>
              <p className="filter-popup-sub">{filterDept}</p>
              <button className="close-btn" onClick={() => setFilterPopup(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="filter-popup-list">
              <button
                className={`filter-popup-option${!filterClass ? " selected" : ""}`}
                onClick={() => { setFilterClass(""); setFilterPopup(null); }}
              >
                <span>All Classes</span>
                {!filterClass && <Check size={14} />}
              </button>
              {filterClassOptions.map((sem) => (
                <button
                  key={sem}
                  className={`filter-popup-option${filterClass === sem ? " selected" : ""}`}
                  onClick={() => { setFilterClass(sem); setFilterPopup(null); }}
                >
                  <span className="class-sem-badge">{sem}</span>
                  {filterClass === sem && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── ADD STAFF MODAL ── */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add Staff Member</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">

              <label>Name</label>
              <input
                name="name"
                placeholder="Enter name"
                value={formData.name}
                onChange={handleChange}
              />

              <label>Department</label>
              {/* Trigger button — same style as filter triggers */}
              <button
                className="modal-dept-trigger"
                onClick={() => setFilterPopup("modal-dept")}
                type="button"
              >
                <span style={{ color: formData.department ? "#374151" : "#9ca3af" }}>
                  {formData.department || "Select Department"}
                </span>
                <ChevronDown size={14} />
              </button>

              <label>Email</label>
              <input
                name="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleChange}
              />

              <label>Phone</label>
              <input
                name="phone"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleChange}
              />

            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="submit-btn" onClick={handleAddFaculty}>Add Staff</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL DEPARTMENT PICKER (z-index above modal) ── */}
      {filterPopup === "modal-dept" && (
        <div
          className="modal-overlay"
          style={{ zIndex: 3000 }}
          onClick={() => setFilterPopup(null)}
        >
          <div className="filter-popup" onClick={(e) => e.stopPropagation()}>
            <div className="filter-popup-header">
              <h3>Select Department</h3>
              <button className="close-btn" onClick={() => setFilterPopup(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="filter-popup-list">
              {departments.length === 0 && (
                <p style={{ fontSize: "13px", color: "#94a3b8", textAlign: "center", padding: "16px 0" }}>
                  No departments available
                </p>
              )}
              {departments.map((d) => (
                <button
                  key={d.id}
                  className={`filter-popup-option${formData.department === d.name ? " selected" : ""}`}
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, department: d.name }));
                    setFilterPopup(null);
                  }}
                >
                  <span>{d.name}</span>
                  {formData.department === d.name && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}