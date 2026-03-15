import { useState } from "react";
import { Search, Pencil, Trash2, Plus, X, ChevronDown, Check } from "lucide-react";
import "../../styles/admin.css";
import { useStudents } from "../../context/StudentsContext";

const DEPARTMENTS = ["Computer Science", "IT", "Mechanical", "ECE", "EEE", "Robotics & AI"];
const CLASSES     = ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"];
const BATCHES     = ["2025", "2024", "2023", "2022"];

export default function Students() {

  const { students, addStudent, deleteStudent } = useStudents();

  const [search, setSearch]                     = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [classFilter, setClassFilter]           = useState("");
  const [filterPopup, setFilterPopup]           = useState(null);
  const [showModal, setShowModal]               = useState(false);
  const [formData, setFormData]                 = useState({
    name: "", admission: "", department: "", class: "", batch: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const filteredStudents = students.filter((s) => {
    const searchMatch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.admission.toLowerCase().includes(search.toLowerCase());
    const deptMatch  = !departmentFilter || s.department === departmentFilter;
    const classMatch = !classFilter      || s.class === classFilter;
    return searchMatch && deptMatch && classMatch;
  });

  const handleAddStudent = () => {
    if (!formData.admission) { alert("Admission number is required"); return; }
    if (students.some((s) => s.admission === formData.admission)) {
      alert("Admission number already exists!"); return;
    }
    addStudent(formData);
    setFormData({ name: "", admission: "", department: "", class: "", batch: "" });
    setShowModal(false);
  };

  const handleDelete = (id) => deleteStudent(id);

  return (
    <div className="students-page">

      <div className="students-header">
        <div>
          <h1>Student Management</h1>
          <p>Manage student information and enrollments</p>
        </div>
        <button className="add-student-btn" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Student
        </button>
      </div>

      <div className="students-filters">
        <div className="search-box">
          <Search size={16} />
          <input
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button
          className="filter-popup-trigger"
          onClick={() => setFilterPopup(filterPopup === "dept" ? null : "dept")}
        >
          <span>{departmentFilter || "All Departments"}</span>
          <ChevronDown size={14} />
          {departmentFilter && (
            <span className="filter-clear" onClick={(e) => { e.stopPropagation(); setDepartmentFilter(""); }}>
              <X size={11} />
            </span>
          )}
        </button>

        <button
          className="filter-popup-trigger"
          onClick={() => setFilterPopup(filterPopup === "class" ? null : "class")}
        >
          <span>{classFilter || "All Classes"}</span>
          <ChevronDown size={14} />
          {classFilter && (
            <span className="filter-clear" onClick={(e) => { e.stopPropagation(); setClassFilter(""); }}>
              <X size={11} />
            </span>
          )}
        </button>

        <span className="student-count">{filteredStudents.length} students found</span>
      </div>

      <div className="students-table-wrapper">
        <table className="students-table">
          <thead>
            <tr>
              <th>STUDENT NAME</th>
              <th>ADMISSION NUMBER</th>
              <th>DEPARTMENT</th>
              <th>BATCH</th>
              <th>CLASS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", color: "#94a3b8", padding: "24px" }}>
                  No students found
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.admission}</td>
                  <td>{student.department}</td>
                  <td>{student.batch}</td>
                  <td>{student.class}</td>
                  <td className="actions">
                    <Pencil size={16} className="action edit" />
                    <Trash2 size={16} className="action delete" onClick={() => handleDelete(student.id)} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* DEPT FILTER POPUP */}
      {filterPopup === "dept" && (
        <div className="modal-overlay" onClick={() => setFilterPopup(null)}>
          <div className="filter-popup" onClick={(e) => e.stopPropagation()}>
            <div className="filter-popup-header">
              <h3>Filter by Department</h3>
              <button className="close-btn" onClick={() => setFilterPopup(null)}><X size={18} /></button>
            </div>
            <div className="filter-popup-list">
              <button className={`filter-popup-option${!departmentFilter ? " selected" : ""}`}
                onClick={() => { setDepartmentFilter(""); setFilterPopup(null); }}>
                <span>All Departments</span>{!departmentFilter && <Check size={14} />}
              </button>
              {DEPARTMENTS.map((d) => (
                <button key={d}
                  className={`filter-popup-option${departmentFilter === d ? " selected" : ""}`}
                  onClick={() => { setDepartmentFilter(d); setFilterPopup(null); }}>
                  <span>{d}</span>{departmentFilter === d && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CLASS FILTER POPUP */}
      {filterPopup === "class" && (
        <div className="modal-overlay" onClick={() => setFilterPopup(null)}>
          <div className="filter-popup" onClick={(e) => e.stopPropagation()}>
            <div className="filter-popup-header">
              <h3>Filter by Class</h3>
              <button className="close-btn" onClick={() => setFilterPopup(null)}><X size={18} /></button>
            </div>
            <div className="filter-popup-list">
              <button className={`filter-popup-option${!classFilter ? " selected" : ""}`}
                onClick={() => { setClassFilter(""); setFilterPopup(null); }}>
                <span>All Classes</span>{!classFilter && <Check size={14} />}
              </button>
              {CLASSES.map((c) => (
                <button key={c}
                  className={`filter-popup-option${classFilter === c ? " selected" : ""}`}
                  onClick={() => { setClassFilter(c); setFilterPopup(null); }}>
                  <span className="class-sem-badge">{c}</span>{classFilter === c && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ADD STUDENT MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New Student</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <label>Student Name</label>
              <input name="name" placeholder="Enter student name" onChange={handleChange} />
              <label>Admission Number</label>
              <input name="admission" placeholder="Enter admission number" onChange={handleChange} />
              <label>Department</label>
              <select name="department" onChange={handleChange}>
                <option value="">Select department</option>
                {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </select>
              <label>Batch</label>
              <select name="batch" onChange={handleChange}>
                <option value="">Select batch</option>
                {BATCHES.map((b) => <option key={b}>{b}</option>)}
              </select>
              <label>Class</label>
              <select name="class" onChange={handleChange}>
                <option value="">Select class</option>
                {CLASSES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="submit-btn" onClick={handleAddStudent}>Add Student</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}