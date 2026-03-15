import { useState } from "react";
import { Plus, Pencil, Trash2, X, Users } from "lucide-react";
import "../../styles/admin.css";

const initialDepartments = [
  {
    id: 1,
    name: "Computer Science",
    hod: "Dr. Rajesh Kumar",
    students: 245,
    username: "hod_cs",
    password: "hod@cs123",
  },
  {
    id: 2,
    name: "Electrical Engineering",
    hod: "Dr. Priya Desai",
    students: 198,
    username: "hod_ee",
    password: "hod@ee123",
  },
  {
    id: 3,
    name: "Mechanical Engineering",
    hod: "Dr. Vikram Singh",
    students: 210,
    username: "hod_me",
    password: "hod@me123",
  },
  {
    id: 4,
    name: "Civil Engineering",
    hod: "Dr. Anita Reddy",
    students: 156,
    username: "hod_ce",
    password: "hod@ce123",
  },
];

export default function Departments() {
  const [departments, setDepartments] = useState(initialDepartments);

  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    hod: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddDepartment = () => {

  const departmentExists = departments.some(
    (d) => d.name.toLowerCase() === formData.name.toLowerCase()
  );

  if (departmentExists) {
    alert("Department already exists!");
    return;
  }

  const username =
    "hod_" + formData.name.toLowerCase().replace(/\s/g, "");

  const password =
    "hod@" + formData.name.toLowerCase().replace(/\s/g, "") + "123";

  const newDepartment = {
    id: Date.now(),
    name: formData.name,
    hod: formData.hod,
    students: 0,
    username,
    password,
  };

  setDepartments([...departments, newDepartment]);

  setFormData({
    name: "",
    hod: "",
  });

  setShowModal(false);
};

  const handleDelete = (id) => {
    setDepartments(departments.filter((d) => d.id !== id));
  };

  return (
    <div className="departments-page">

      {/* HEADER */}

      <div className="students-header">
        <div>
          <h1>Department Management</h1>
          <p>Manage departments and their staff assignments</p>
        </div>

        <button
          className="add-student-btn"
          onClick={() => setShowModal(true)}
        >
          <Plus size={16} />
          Add Department
        </button>
      </div>

      {/* GRID */}

      <div className="department-grid">

        {departments.map((dept) => (
          <div className="department-card" key={dept.id}>

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

                <Pencil size={16} className="action edit" />

                <Trash2
                  size={16}
                  className="action delete"
                  onClick={() => handleDelete(dept.id)}
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

          </div>
        ))}

      </div>

      {/* MODAL */}

      {showModal && (
        <div className="modal-overlay">

          <div className="modal">

            <div className="modal-header">

              <h3>Add New Department</h3>

              <button
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                <X size={18} />
              </button>

            </div>

            <div className="modal-body">

              <label>Department Name</label>

              <input
                name="name"
                placeholder="Enter department name"
                onChange={handleChange}
              />

              <label>Head of Department (HOD) Name</label>

              <input
                name="hod"
                placeholder="Enter HOD name"
                onChange={handleChange}
              />

              <small>
                Login credentials will be generated automatically
              </small>

            </div>

            <div className="modal-footer">

              <button
                className="cancel-btn"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              <button
                className="submit-btn"
                onClick={handleAddDepartment}
              >
                Add Department
              </button>

            </div>

          </div>

        </div>
      )}
    </div>
  );
}