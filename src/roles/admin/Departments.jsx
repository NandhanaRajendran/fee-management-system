import { useState } from "react";
import { Plus, Pencil, Trash2, X, Users, UserCheck, ChevronDown, PlusCircle } from "lucide-react";
import "../../styles/admin.css";
import { useFaculty } from "../../context/FacultyContext";
import { useDepartments } from "../../context/DepartmentContext";

const ALL_SEMESTERS = ["S1", "S3", "S5", "S7"];

export default function Departments() {

  const { faculty, setFacultyAssignment } = useFaculty();
  const { departments, addDepartment, deleteDepartment, updateDepartment } = useDepartments();

  const [showModal, setShowModal]       = useState(false);
  const [formData, setFormData]         = useState({ name: "", hod: "" });
  const [advisorPopup, setAdvisorPopup] = useState(null); // { deptId, semester }

  /* ── helpers ── */

  const nextSemester = (dept) =>
    ALL_SEMESTERS.find((s) => !dept.activeClasses.includes(s)) || null;

  const getAdvisorName = (dept, semester) => {
    const id = dept.advisors[semester];
    return id ? (faculty.find((f) => f.id === id)?.name ?? null) : null;
  };

  /*
    Eligible for advisor popup:
    - same department as the card
    - NOT a HOD
    - not already assigned to another class
      (unless they are the current advisor of THIS specific slot)
  */
  const eligibleFaculty = (dept, semester) => {
    const currentId = dept.advisors[semester];
    return faculty.filter(
      (f) =>
        f.department === dept.name &&
        f.role !== "HOD" &&
        (!f.assignedClass || f.id === currentId)
    );
  };

  /* ── add class ── */

  const handleAddClass = (deptId) => {
    const dept = departments.find((d) => d.id === deptId);
    const next = nextSemester(dept);
    if (!next) return;
    updateDepartment({
      ...dept,
      activeClasses: [...dept.activeClasses, next],
      advisors: { ...dept.advisors, [next]: null },
    });
  };

  /* ── assign / unassign advisor ── */

  const assignAdvisor = (deptId, semester, facultyId) => {
    const fid  = facultyId ? parseInt(facultyId) : null;
    const dept = departments.find((d) => d.id === deptId);

    // Release previous advisor → back to unassigned (Faculty)
    const oldId = dept.advisors[semester];
    if (oldId) setFacultyAssignment(oldId, null);

    // Mark new advisor → becomes Staff Advisor
    if (fid) setFacultyAssignment(fid, `${dept.name}-${semester}`);

    updateDepartment({
      ...dept,
      advisors: { ...dept.advisors, [semester]: fid },
    });

    setAdvisorPopup(null);
  };

  /* ── add department ── */

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAddDepartment = () => {
    const exists = departments.some(
      (d) => d.name.toLowerCase() === formData.name.toLowerCase()
    );
    if (exists) { alert("Department already exists!"); return; }
    if (!formData.name) { alert("Department name is required"); return; }

    addDepartment(formData);
    setFormData({ name: "", hod: "" });
    setShowModal(false);
  };

  const popupDept = advisorPopup
    ? departments.find((d) => d.id === advisorPopup.deptId)
    : null;

  return (
    <div className="departments-page">

      {/* HEADER */}
      <div className="students-header">
        <div>
          <h1>Department Management</h1>
          <p>Manage departments and their staff assignments</p>
        </div>
        <button className="add-student-btn" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Department
        </button>
      </div>

      {/* GRID */}
      <div className="department-grid">
        {departments.map((dept) => (
          <div className="department-card" key={dept.id}>

            <div className="dept-top">
              <div className="dept-title">
                <div className="dept-icon"><Users size={18} /></div>
                <div>
                  <h3>{dept.name}</h3>
                  <span>{dept.students} students</span>
                </div>
              </div>
              <div className="dept-actions">
                <Pencil size={16} className="action edit" />
                <Trash2
                  size={16}
                  className="action delete"
                  onClick={() => deleteDepartment(dept.id)}
                />
              </div>
            </div>

            <div className="dept-section">
              <label>HEAD OF DEPARTMENT</label>
              <p>{dept.hod}</p>
            </div>

            <div className="dept-login">
              <label>HOD LOGIN CREDENTIALS</label>
              <div className="login-box">
                <div>
                  <span>Username</span>
                  <p>{dept.username}</p>
                </div>
                <div>
                  <span>Password</span>
                  <p>{dept.password}</p>
                </div>
              </div>
            </div>

            <div className="dept-classes-section">
              <div className="dept-classes-header">
                <label>CLASS ADVISORS</label>
                {nextSemester(dept) && (
                  <button
                    className="add-class-btn"
                    onClick={() => handleAddClass(dept.id)}
                  >
                    <PlusCircle size={13} />
                    Add {nextSemester(dept)}
                  </button>
                )}
              </div>

              <div className="class-list">
                {dept.activeClasses.map((sem) => {
                  const advisorName = getAdvisorName(dept, sem);
                  return (
                    <div key={sem} className="class-row">
                      <span className="class-sem-badge">{sem}</span>
                      <button
                        className="advisor-trigger-btn"
                        onClick={() =>
                          setAdvisorPopup({ deptId: dept.id, semester: sem })
                        }
                      >
                        <UserCheck size={13} />
                        <span>{advisorName || "Assign Advisor"}</span>
                        <ChevronDown size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* ── ADVISOR POPUP ── */}
      {advisorPopup && popupDept && (
        <div className="modal-overlay" onClick={() => setAdvisorPopup(null)}>
          <div className="advisor-popup" onClick={(e) => e.stopPropagation()}>

            <div className="advisor-popup-header">
              <div>
                <h3>Assign Advisor</h3>
                <p className="advisor-popup-sub">
                  {popupDept.name} · {advisorPopup.semester}
                </p>
              </div>
              <button className="close-btn" onClick={() => setAdvisorPopup(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="advisor-popup-list">

              <button
                className="advisor-option unassign"
                onClick={() => assignAdvisor(advisorPopup.deptId, advisorPopup.semester, null)}
              >
                <span className="advisor-option-avatar none">–</span>
                <span className="advisor-option-name">No Advisor</span>
              </button>

              {eligibleFaculty(popupDept, advisorPopup.semester).length === 0 && (
                <p className="advisor-empty">
                  No available faculty in {popupDept.name}
                </p>
              )}

              {eligibleFaculty(popupDept, advisorPopup.semester).map((f) => {
                const isCurrent = popupDept.advisors[advisorPopup.semester] === f.id;
                return (
                  <button
                    key={f.id}
                    className={`advisor-option${isCurrent ? " selected" : ""}`}
                    onClick={() =>
                      assignAdvisor(advisorPopup.deptId, advisorPopup.semester, f.id)
                    }
                  >
                    <span className="advisor-option-avatar">
                      {f.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="advisor-option-info">
                      <span className="advisor-option-name">{f.name}</span>
                      {/* show current assigned class if any, else dept */}
                      <span className="advisor-option-dept">
                        {isCurrent ? `${advisorPopup.semester} Advisor` : "Faculty"}
                      </span>
                    </div>
                    {isCurrent && (
                      <span className="advisor-selected-badge">Current</span>
                    )}
                  </button>
                );
              })}

            </div>
          </div>
        </div>
      )}

      {/* ── ADD DEPARTMENT MODAL ── */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New Department</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <label>Department Name</label>
              <input
                name="name"
                placeholder="Enter department name"
                value={formData.name}
                onChange={handleChange}
              />
              <label>Head of Department (HOD) Name</label>
              <input
                name="hod"
                placeholder="Enter HOD name"
                value={formData.hod}
                onChange={handleChange}
              />
              <small>
                Starts with S1 only. Add S3, S5, S7 as batches progress each year.
              </small>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="submit-btn" onClick={handleAddDepartment}>Add Department</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}