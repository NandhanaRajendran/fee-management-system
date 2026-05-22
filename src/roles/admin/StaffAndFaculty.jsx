import { useState, useEffect } from "react";
import { Plus, Search, Trash2, X, ChevronDown, Check } from "lucide-react";
import "../../styles/admin.css";
import API from "../../config/api";

export default function Staff() {
  const [faculty, setFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterPopup, setFilterPopup] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    facultyId: "",
    name: "",
    department: "",
    email: "",
    phone: "",
    gender: "",
  });

  //const API = "https://mess-management-system-q6us.onrender.com"
  //const API = "http://localhost:8000"

  const fetchFaculty = () => {
    fetch(`${API}/api/admin/faculty`, {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Faculty from backend:", data); // debug
        setFaculty(data);
      })
      .catch(console.error);
  };

  // ✅ FETCH FACULTY
  useEffect(() => {
    fetchFaculty();
  }, []);

  // ✅ FETCH DEPARTMENTS
  useEffect(() => {
    fetch(`${API}/api/admin/departments`)
      .then((res) => res.json())
      .then((data) => setDepartments(data))
      .catch(console.error);
  }, []);

  const displayRole = (f) => f.role || "Faculty";

  // ✅ FILTER LOGIC (SEARCH + DEPT)
  const filteredFaculty = faculty.filter((f) => {
    const searchMatch = f.name.toLowerCase().includes(search.toLowerCase());

    const deptMatch =
      !filterDept ||
      f.department?.name === filterDept ||
      f.department === filterDept;

    return searchMatch && deptMatch;
  });

  // DELETE
  const handleDelete = async (f) => {
    try {
      console.log(f);

      const res = await fetch(
        `${API}/api/admin/delete-faculty`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ facultyId: f.facultyId }),
        },
      );

      const data = await res.json();
      console.log("DELETE RESPONSE:", data); // 👈 ADD THIS

      if (!res.ok) {
        alert(data.message || data.error);
        return;
      }

      alert("Deleted successfully ✅");

      setFaculty((prev) => prev.filter((x) => x._id !== f._id));
    } catch (err) {
      console.log("DELETE ERROR:", err); // 👈 ADD THIS
      alert("Delete failed");
    }
  };

  // FORM
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ADD FACULTY
  const handleAddFaculty = async () => {

      console.log("Frontend gender:", formData.gender);
    if (!formData.name || !formData.department || !formData.gender) {
      alert("Name, Department, and Gender are required");
      return;
    }

    try {
      const selectedDept = departments.find(
        (d) => d.name === formData.department,
      );

      const res = await fetch(`${API}/api/admin/add-faculty`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          facultyId: formData.facultyId,
          name: formData.name,
          department: selectedDept?._id,
          email: formData.email,
          phone: formData.phone,
          gender: formData.gender,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || data.error);
        return;
      }

      alert(`Faculty added successfully ✅`);
      fetchFaculty();
      setShowModal(false);
    } catch {
      alert("Server error");
    }
  };

  const openModal = () => {
    setFormData({ facultyId: "", name: "", department: "", email: "", phone: "", gender: "" });
    setShowModal(true);
  };

  return (
    <div>
      {/* HEADER */}
      <div className="students-header">
        <div>
          <h1>Staff & Faculty Management</h1>
          <p>Manage faculty members</p>
        </div>
        <button className="add-student-btn" onClick={openModal}>
          <Plus size={16} /> Add Staff Member
        </button>
      </div>

      {/* SEARCH + FILTER */}
      <div className="students-filters">
        <div className="search-box">
          <Search size={16} />
          <input
            placeholder="Search faculty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* DEPARTMENT FILTER */}
        <button
          className="filter-popup-trigger"
          onClick={() => setFilterPopup(filterPopup === "dept" ? null : "dept")}
        >
          <span>{filterDept || "All Departments"}</span>
          <ChevronDown size={14} />
          {filterDept && (
            <span
              className="filter-clear"
              onClick={(e) => {
                e.stopPropagation();
                setFilterDept("");
              }}
            >
              <X size={11} />
            </span>
          )}
        </button>

        <span className="student-count">{filteredFaculty.length} members</span>
      </div>

      {/* TABLE */}
      <div className="students-table-wrapper">
        <table className="students-table">
          <thead>
            <tr>
              <th>Faculty ID</th>
              <th>NAME</th>
              <th>GENDER</th>
              <th>ROLE</th>
              <th>DEPARTMENT</th>
              <th>CONTACT</th>
              <th>ACTIONS</th>
            </tr>
          </thead>

          <tbody>
            {filteredFaculty.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center" }}>
                  No members found
                </td>
              </tr>
            ) : (
              filteredFaculty.map((f) => (
                <tr key={f._id}>
                  <td>{f.facultyId || "N/A"}</td>
                  <td>{f.name}</td>
                  <td>{f.gender ? f.gender.charAt(0).toUpperCase() + f.gender.slice(1) : "Other"}</td>
                  <td>{displayRole(f)}</td>
                  <td>{f.department?.name || f.department}</td>
                  <td>
                    {f.email}
                    <br />
                    {f.phone}
                  </td>
                  <td>
                    <Trash2
                      size={16}
                      onClick={() => handleDelete(f)}
                      className="action delete"
                    />
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
            {departments.map((d) => (
              <button
                key={d._id}
                className={`filter-popup-option${filterDept === d.name ? " selected" : ""}`}
                onClick={() => {
                  setFilterDept(d.name);
                  setFilterPopup(null);
                }}
              >
                <span>{d.name}</span>
                {filterDept === d.name && <Check size={14} />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add Staff Member</h3>
              <button onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <label>Faculty ID</label>
              <input name="facultyId" onChange={handleChange} />

              <label>Name</label>
              <input name="name" onChange={handleChange} />

              <label>Department</label>
              <button
                className="modal-dept-trigger"
                onClick={() => setFilterPopup("modal-dept")}
                type="button"
              >
                <span
                  style={{ color: formData.department ? "#374151" : "#9ca3af" }}
                >
                  {formData.department || "Select Department"}
                </span>
                <ChevronDown size={14} />
              </button>

              <label>Email</label>
              <input name="email" onChange={handleChange} />

              <label>Phone</label>
              <input name="phone" onChange={handleChange} />

              <label>Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "white", marginTop: "5px" }}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className="submit-btn" onClick={handleAddFaculty}>
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DEPT PICKER */}
      {filterPopup === "modal-dept" && (
        <div className="modal-overlay" onClick={() => setFilterPopup(null)}>
          <div className="filter-popup" onClick={(e) => e.stopPropagation()}>
            {departments.map((d) => (
              <button
                key={d._id}
                onClick={() => {
                  setFormData((prev) => ({ ...prev, department: d.name }));
                  setFilterPopup(null);
                }}
              >
                {d.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
