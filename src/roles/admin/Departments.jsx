import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  X,
  Users,
  UserCheck,
  ChevronDown,
  PlusCircle,
} from "lucide-react";
import "../../styles/admin.css";
//import { useFaculty } from "../../context/FacultyContext";
import { useDepartments } from "../../context/DepartmentContext";

const ALL_SEMESTERS = ["S1", "S3", "S5", "S7"];

export default function Departments() {
  const [facultyList, setFacultyList] = useState([]);
  //const { departments, deleteDepartment, updateDepartment } =useDepartments();
  const { updateDepartment } = useDepartments();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "" });
  const [advisorPopup, setAdvisorPopup] = useState(null); // { deptId, semester }
  const [hodPopup, setHodPopup] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [editingDept, setEditingDept] = useState(null);
  const [hodCredentials, setHodCredentials] = useState({});

  useEffect(() => {
    fetch("http://localhost:5000/api/admin/departments")
      .then((res) => res.json())
      .then((data) => {
        console.log("Departments from DB:", data);
        setDepartments(data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/api/admin/faculty")
      .then((res) => res.json())
      .then((data) => {
        console.log("Faculty from DB:", data);
        setFacultyList(data);
      })
      .catch(console.error);
  }, []);
  /* ── helpers ── */

  const nextSemester = (dept) =>
    ALL_SEMESTERS.find((s) => !(dept.activeClasses || []).includes(s)) || null;

  const getAdvisorName = (dept, semester) => {
    const id = dept.advisors?.[semester];
    return id ? (facultyList.find((f) => f.id === id)?.name ?? null) : null;
  };

  /*
    Eligible for advisor popup:
    - same department as the card
    - NOT a HOD
    - not already assigned to another class
      (unless they are the current advisor of THIS specific slot)
  */
  const eligibleFaculty = (dept, semester) => {
    const currentId = dept.advisors?.[semester];

    return facultyList.filter(
      (f) =>
        f.department?._id?.toString() === dept._id?.toString() &&
        f.role !== "HOD" &&
        (!f.assignedClass || f.id === currentId),
    );
  };

  /* ── add class ── */

  const handleAddClass = (deptId) => {
    const dept = departments.find((d) => d._id === deptId);
    const next = nextSemester(dept);
    if (!next) return;
    updateDepartment({
      ...dept,
      activeClasses: [...(dept.activeClasses || []), next],
      advisors: { ...dept.advisors, [next]: null },
    });
  };

  /* Assign hod */
  const assignHod = async (deptId, facultyId) => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/assign-hod", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          departmentId: deptId,
          facultyId,
        }),
      });

      const data = await res.json();
      

      if (!res.ok) return alert(data.message);

      alert(
        `HOD Assigned!\nUsername: ${data.credentials.username}\nPassword: ${data.credentials.password}`,
      );

      // ✅ store credentials
      setHodCredentials({
        [deptId]: data.credentials,
      });

      // update UI
      setDepartments((prev) =>
        prev.map((d) => (d._id === deptId ? data.department : d)),
      );

      setHodPopup(null);
    } catch {
      alert("Error assigning HOD");
    }
  };

  /* ── assign / unassign advisor ── */

  const assignAdvisor = async (deptId, sem, facultyId) => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/admin/assign-advisor",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            departmentId: deptId,
            semester: sem,
            facultyId,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) return alert(data.message);

      // update UI
      setDepartments((prev) =>
        prev.map((d) => (d._id === deptId ? data.department : d)),
      );

      setAdvisorPopup(null);
    } catch {
      alert("Error assigning advisor");
    }
  };

  /* ── add department ── */

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSaveDepartment = async () => {
    if (!formData.name) {
      alert("Department name is required");
      return;
    }

    try {
      const url = editingDept
        ? "http://localhost:5000/api/admin/update-department"
        : "http://localhost:5000/api/admin/add-department";

      const body = editingDept
        ? { departmentId: editingDept._id, name: formData.name }
        : { name: formData.name };

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || data.error);
        return;
      }

      alert(
        editingDept ? "Updated successfully ✅" : "Created successfully ✅",
      );

      // ✅ update UI
      if (editingDept) {
        setDepartments((prev) =>
          prev.map((d) => (d._id === editingDept._id ? data.department : d)),
        );
      } else {
        setDepartments((prev) => [...prev, data.department]);
      }

      setShowModal(false);
      setEditingDept(null);
      setFormData({ name: "" });
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  const popupDept = advisorPopup
    ? departments.find((d) => d._id === advisorPopup.deptId)
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
          <div className="department-card" key={dept._id}>
            <div className="dept-top">
              <div className="dept-title">
                <div className="dept-icon">
                  <Users size={18} />
                </div>
                <div>
                  <h3>{dept.name}</h3>
                  <span>{dept.students} students</span>
                </div>
              </div>
              <div className="dept-actions">
                <Pencil
                  size={16}
                  className="action edit"
                  onClick={() => {
                    setFormData({ name: dept.name });
                    setEditingDept(dept);
                    setShowModal(true);
                  }}
                />
                {/* <Trash2
                  size={16}
                  className="action delete"
                  onClick={() => deleteDepartment(dept._id)}
                /> */}
              </div>
            </div>

            <div className="dept-section">
              <label>HEAD OF DEPARTMENT</label>
              <button
                className="advisor-trigger-btn"
                onClick={() => setHodPopup(dept._id)}
              >
                <UserCheck size={13} />
                <span>
                  {facultyList.find((f) => f._id === dept.hod)?.name ||
                    "Assign HOD"}
                </span>
                <ChevronDown size={12} />
              </button>
            </div>

            <div className="dept-login">
              <label>HOD LOGIN CREDENTIALS</label>
              <div className="login-box">
                <div>
                  <span>Username</span>
                  <p>
                    {hodCredentials[dept._id]?.username || dept.username || "-"}
                  </p>
                </div>
                <div>
                  <span>Password</span>
                  <p>
                    {hodCredentials[dept._id]?.password || dept.password || "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="dept-classes-section">
              <div className="dept-classes-header">
                <label>CLASS ADVISORS</label>
                {nextSemester(dept) && (
                  <button
                    className="add-class-btn"
                    onClick={() => handleAddClass(dept._id)}
                  >
                    <PlusCircle size={13} />
                    Add {nextSemester(dept)}
                  </button>
                )}
              </div>

              <div className="class-list">
                {(dept.activeClasses || []).map((sem) => {
                  const advisorName = getAdvisorName(dept, sem);
                  return (
                    <div key={sem} className="class-row">
                      <span className="class-sem-badge">{sem}</span>
                      <button
                        className="advisor-trigger-btn"
                        onClick={() =>
                          setAdvisorPopup({ deptId: dept._id, semester: sem })
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

      {/*HOD POPUP */}
      {hodPopup && (
        <div className="modal-overlay" onClick={() => setHodPopup(null)}>
          <div className="advisor-popup" onClick={(e) => e.stopPropagation()}>
            <div className="advisor-popup-header">
              <h3>Assign HOD</h3>
              <button onClick={() => setHodPopup(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="advisor-popup-list">
              {facultyList
                .filter(
                  (f) => f.department?._id?.toString() === hodPopup?.toString(),
                )
                .map((f) => (
                  <button
                    key={f._id}
                    className="advisor-option"
                    onClick={() => assignHod(hodPopup, f._id)}
                  >
                    <span>{f.name}</span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
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
              <button
                className="close-btn"
                onClick={() => setAdvisorPopup(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="advisor-popup-list">
              <button
                className="advisor-option unassign"
                onClick={() =>
                  assignAdvisor(
                    advisorPopup.deptId,
                    advisorPopup.semester,
                    null,
                  )
                }
              >
                <span className="advisor-option-avatar none">–</span>
                <span className="advisor-option-name">No Advisor</span>
              </button>

              {eligibleFaculty(popupDept, advisorPopup.semester).length ===
                0 && (
                <p className="advisor-empty">
                  No available faculty in {popupDept.name}
                </p>
              )}

              {eligibleFaculty(popupDept, advisorPopup.semester).map((f) => {
                const isCurrent =
                  popupDept.advisors[advisorPopup.semester] === f.id;
                return (
                  <button
                    key={f.id}
                    className={`advisor-option${isCurrent ? " selected" : ""}`}
                    onClick={() =>
                      assignAdvisor(
                        advisorPopup.deptId,
                        advisorPopup.semester,
                        f.id,
                      )
                    }
                  >
                    <span className="advisor-option-avatar">
                      {f.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="advisor-option-info">
                      <span className="advisor-option-name">{f.name}</span>
                      {/* show current assigned class if any, else dept */}
                      <span className="advisor-option-dept">
                        {isCurrent
                          ? `${advisorPopup.semester} Advisor`
                          : "Faculty"}
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
            </div>
            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => {
                  setShowModal(false);
                  setEditingDept(null);
                  setFormData({ name: "" });
                }}
              >
                Cancel
              </button>
              <button className="submit-btn" onClick={handleSaveDepartment}>
                {editingDept ? "Update Department" : "Add Department"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
