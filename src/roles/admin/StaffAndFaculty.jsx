import { useState } from "react";
import { Plus, Search, Pencil, Trash2, X } from "lucide-react";
import "../../styles/admin.css";

const initialFaculty = [
  {
    id: 1,
    name: "Dr. Rajesh Kumar",
    department: "Computer Science",
    role: "HOD",
    class: "-",
    email: "rajesh.kumar@college.edu",
    phone: "+91 98765 43210",
    username: "hod_cs",
    password: "hod@cs123",
  },
  {
    id: 2,
    name: "Prof. Meena Shah",
    department: "Computer Science",
    role: "Staff Advisor",
    class: "CS-A",
    email: "meena.shah@college.edu",
    phone: "+91 98765 43211",
    username: "advisor_csa",
    password: "adv@csa123",
  },
  {
    id: 3,
    name: "Prof. Suresh Rao",
    department: "Computer Science",
    role: "Staff Advisor",
    class: "CS-B",
    email: "suresh.rao@college.edu",
    phone: "+91 98765 43212",
    username: "advisor_csb",
    password: "adv@csb123",
  },
];

export default function Staff() {

  const [faculty, setFaculty] = useState(initialFaculty);

  const [activeTab, setActiveTab] = useState("All");

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    department: "",
    email: "",
    phone: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /* FILTER */

  const filteredFaculty = faculty.filter((f) => {

    const searchMatch = f.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const tabMatch =
      activeTab === "All" ||
      (activeTab === "HODs" && f.role === "HOD") ||
      (activeTab === "Staff Advisors" && f.role === "Staff Advisor");

    return searchMatch && tabMatch;
  });

  /* ADD FACULTY */

  const handleAddFaculty = () => {

    const newFaculty = {
      id: Date.now(),
      ...formData,
      role: "Faculty",
      class: "-",
      username: formData.name
        .toLowerCase()
        .replace(/\s/g, "_"),
      password: "default123",
    };

    setFaculty([...faculty, newFaculty]);

    setShowModal(false);

    setFormData({
      name: "",
      department: "",
      email: "",
      phone: "",
    });
  };

  const handleDelete = (id) => {
    setFaculty(faculty.filter((f) => f.id !== id));
  };

  return (
    <div>

      {/* HEADER */}

      <div className="students-header">

        <div>
          <h1>Staff & Faculty Management</h1>
          <p>Manage HODs and staff advisors</p>
        </div>

        <button
          className="add-student-btn"
          onClick={() => setShowModal(true)}
        >
          <Plus size={16} />
          Add Staff Member
        </button>

      </div>

      {/* TABS */}

      <div className="staff-tabs">

        <button
          className={activeTab === "All" ? "tab active" : "tab"}
          onClick={() => setActiveTab("All")}
        >
          All Faculty
        </button>

        <button
          className={activeTab === "HODs" ? "tab active" : "tab"}
          onClick={() => setActiveTab("HODs")}
        >
          HODs
        </button>

        <button
          className={
            activeTab === "Staff Advisors" ? "tab active" : "tab"
          }
          onClick={() => setActiveTab("Staff Advisors")}
        >
          Staff Advisors
        </button>

      </div>

      {/* SEARCH */}

      <div className="students-filters">

        <div className="search-box">
          <Search size={16} />
          <input
            placeholder="Search faculty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

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

            {filteredFaculty.map((f) => (

              <tr key={f.id}>

                <td>{f.name}</td>

                <td>
                  <span className={`status ${f.role.toLowerCase().replace(" ","-")}`}>
                    {f.role}
                  </span>
                </td>

                <td>{f.department}</td>

                <td>{f.class}</td>

                <td>
                  {f.email}
                  <br />
                  {f.phone}
                </td>

                <td>
                  User: {f.username}
                  <br />
                  Pass: {f.password}
                </td>

                <td className="actions">

                  <Pencil size={16} className="action edit" />

                  <Trash2
                    size={16}
                    className="action delete"
                    onClick={() => handleDelete(f.id)}
                  />

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* ADD FACULTY MODAL */}

      {showModal && (

        <div className="modal-overlay">

          <div className="modal">

            <div className="modal-header">

              <h3>Add Staff Member</h3>

              <button
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                <X size={18} />
              </button>

            </div>

            <div className="modal-body">

              <label>Name</label>
              <input
                name="name"
                placeholder="Enter name"
                onChange={handleChange}
              />

              <label>Department</label>
              <input
                name="department"
                placeholder="Enter department"
                onChange={handleChange}
              />

              <label>Email</label>
              <input
                name="email"
                placeholder="Enter email"
                onChange={handleChange}
              />

              <label>Phone</label>
              <input
                name="phone"
                placeholder="Enter phone number"
                onChange={handleChange}
              />

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
                onClick={handleAddFaculty}
              >
                Add Staff
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}