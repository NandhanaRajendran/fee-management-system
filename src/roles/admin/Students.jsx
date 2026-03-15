import { useState } from "react";
import { Search, Pencil, Trash2, Plus, X } from "lucide-react";
import "../../styles/admin.css";

const initialStudents = [
  {
    id: 1,
    name: "Aarav Sharma",
    admission: "4001",
    department: "Computer Science",
    class: "S5",
    batch: "2023",
    status: "Active",
  },
  {
    id: 2,
    name: "Diya Patel",
    admission: "4936",
    department: "EEE",
    class: "S3",
    batch: "2024",
    status: "Inactive",
  },
];

export default function Students() {
  const [students, setStudents] = useState(initialStudents);

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [classFilter, setClassFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    admission: "",
    department: "",
    class: "",
    batch: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /* FILTER LOGIC */

  const filteredStudents = students.filter((student) => {
    const searchMatch =
      student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.admission.toLowerCase().includes(search.toLowerCase());

    const departmentMatch =
      departmentFilter === "All" || student.department === departmentFilter;

    const classMatch = classFilter === "All" || student.class === classFilter;

    const statusMatch =
      statusFilter === "All" || student.status === statusFilter;

    return searchMatch && departmentMatch && classMatch && statusMatch;
  });

  /* ADD STUDENT */
  const handleAddStudent = () => {
    if (!formData.admission) {
      alert("Admission number is required");
      return;
    }

    const admissionExists = students.some(
      (s) => s.admission.toLowerCase() === formData.admission.toLowerCase(),
    );

    if (admissionExists) {
      alert("Admission number already exists!");
      return;
    }

    const newStudent = {
      id: Date.now(),
      ...formData,
      status: "Active",
    };

    setStudents([...students, newStudent]);

    setFormData({
      name: "",
      admission: "",
      department: "",
      class: "",
      batch: "",
    });

    setShowModal(false);
  };

  /* DELETE -> make inactive */

  const handleDelete = (id) => {
    setStudents(
      students.map((s) => (s.id === id ? { ...s, status: "Inactive" } : s)),
    );
  };

  return (
    <div className="students-page">
      {/* HEADER */}

      <div className="students-header">
        <div>
          <h1>Student Management</h1>
          <p>Manage student information and enrollments</p>
        </div>

        <button className="add-student-btn" onClick={() => setShowModal(true)}>
          <Plus size={16} />
          Add Student
        </button>
      </div>

      {/* SEARCH + FILTER */}

      <div className="students-filters">
        <div className="search-box">
          <Search size={16} />
          <input
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
        >
          <option value="All">All Departments</option>
          <option>Computer Science</option>
          <option>IT</option>
          <option>Mechanical</option>
          <option>ECE</option>
          <option>EEE</option>
          <option>Robotics & AI</option>
        </select>

        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
        >
          <option value="All">All Classes</option>
          <option>S1</option>
          <option>S2</option>
          <option>S3</option>
          <option>S4</option>
          <option>S5</option>
          <option>S6</option>
          <option>S7</option>
          <option>S8</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Status</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>

        <span className="student-count">
          {filteredStudents.length} students found
        </span>
      </div>

      {/* TABLE */}

      <div className="students-table-wrapper">
        <table className="students-table">
          <thead>
            <tr>
              <th>STUDENT NAME</th>
              <th>ADMISSION NUMBER</th>
              <th>DEPARTMENT</th>
              <th>BATCH</th>
              <th>CLASS</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>

          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.id}>
                <td>{student.name}</td>
                <td>{student.admission}</td>
                <td>{student.department}</td>
                <td>{student.batch}</td>
                <td>{student.class}</td>

                <td>
                  <span className={`status ${student.status.toLowerCase()}`}>
                    {student.status}
                  </span>
                </td>

                <td className="actions">
                  <Pencil size={16} className="action edit" />

                  <Trash2
                    size={16}
                    className="action delete"
                    onClick={() => handleDelete(student.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD STUDENT MODAL */}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New Student</h3>

              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <label>Student Name</label>
              <input
                name="name"
                placeholder="Enter student name"
                onChange={handleChange}
              />

              <label>Admission Number</label>
              <input
                name="admission"
                placeholder="Enter admission number"
                onChange={handleChange}
              />

              <label>Department</label>
              <select name="department" onChange={handleChange}>
                <option>Select department</option>
                <option>Computer Science</option>
                <option>IT</option>
                <option>Mechanical</option>
                <option>ECE</option>
                <option>EEE</option>
                <option>Robotics & AI</option>
              </select>

              <label>Batch</label>
              <select name="batch" onChange={handleChange}>
                <option>Select batch</option>
                <option>2024</option>
                <option>2023</option>
                <option>2022</option>
              </select>

              <label>Class</label>
              <select name="class" onChange={handleChange}>
                <option>Select class</option>
                <option>S1</option>
                <option>S2</option>
                <option>S3</option>
                <option>S4</option>
                <option>S5</option>
                <option>S6</option>
                <option>S7</option>
                <option>S8</option>
              </select>
            </div>

            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              <button className="submit-btn" onClick={handleAddStudent}>
                Add Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
