import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/hostel.css";
import API from "../../config/api";

function Enrollment() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("Student");

  // Dynamic States
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  const [gender,setGender] = useState("Female");
  const [isAutoFilled, setIsAutoFilled] = useState(false);

  // Dropdown list states
  const [femaleStudents, setFemaleStudents] = useState([]);
  const [femaleFaculty, setFemaleFaculty] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [searchText, setSearchText] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  //const API = "https://mess-management-system-q6us.onrender.com";

  // Fetch departments
  useEffect(() => {
    fetch(`${API}/api/admin/departments`)
      .then(res => res.json())
      .then(data => setDepartments(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error fetching departments:", err));
  }, []);

  // Fetch female students
  useEffect(() => {
    if (category === "Student") {
      setSelectedId("");
      setName("");
      setDepartment("");
      setSemester("");
      setIsAutoFilled(false);
      fetch(`${API}/api/admin/all-students`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      })
        .then(res => res.json())
        .then(data => {
          const females = Array.isArray(data)
            ? data.filter(s => s.gender === "Female")
            : [];
          setFemaleStudents(females);
        })
        .catch(console.error);
    }
  }, [category]);

  // Fetch female faculty
  useEffect(() => {
    if (category === "Faculty") {
      setSelectedId("");
      setName("");
      setDepartment("");
      setSemester("");
      setIsAutoFilled(false);
      fetch(`${API}/api/admin/faculty`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      })
        .then(res => res.json())
        .then(data => {
          const females = Array.isArray(data)
            ? data.filter(f => f.gender === "Female")
            : [];
          setFemaleFaculty(females);
        })
        .catch(console.error);
    }
  }, [category]);

  // Get matching list based on category + search
  const getFilteredList = () => {
    const list = category === "Student" ? femaleStudents : femaleFaculty;
    if (!searchText) return list;
    const q = searchText.toLowerCase();
    return list.filter(
      item =>
        item.name.toLowerCase().includes(q) ||
        (
          item.admissionNo ||
          item.admission ||
          item.facultyId ||
          ""
        )
          .toLowerCase()
          .includes(q)
    );
  };

  const handleSelect = (item) => {
    const id =
      item.admissionNo ||
      item.admission ||
      item.facultyId ||
      "";
    setSelectedId(id);
    setSearchText(item.name + (id ? ` (${id})` : ""));
    setShowDropdown(false);
    setName(item.name || "");
    setDepartment(item.department?._id || item.department || "");
    setSemester(item.className || "");
    setGender("Female");
    setIsAutoFilled(true);
    setMessage("");
  };

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    setCategory(val);
    setName("");
    setDepartment("");
    setSemester("");
    setGender("Female");
    setIsAutoFilled(false);
    setSelectedId("");
    setSearchText("");
    setShowDropdown(false);
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const room = formData.get("room");

    if (category === "Inmate type") {
      setMessage("Error: Please select a valid Inmate Type.");
      return;
    }

    if ((category === "Student" || category === "Faculty") && !selectedId) {
      setMessage("Error: Please select a person from the dropdown.");
      return;
    }

    try {
      // Check room capacity
      const resCount = await fetch(`${API}/api/students`);
      const allStudents = await resCount.json();
      if (Array.isArray(allStudents)) {
        const inRoom = allStudents.filter(s => String(s.room) === String(room));
        if (inRoom.length >= 4) {
          setMessage("Error: Maximum 4 people allowed in this room.");
          return;
        }
      }

      const alreadyExists = allStudents.find(
        s =>
          String(s.admissionNo || s.admission) === String(selectedId) &&
          s.hostelName && s.hostelName.trim() !== ""
      );
      
      if (alreadyExists) {
        setMessage("Error: This inmate is already enrolled.");
        return;
      }

      const finalAdmission = selectedId || Math.floor(Math.random() * 90000000) + 10000000;
      const finalName = category === "Student" ? name : `${category}: ${name}`;

      const newInmate = {
        admission: finalAdmission,
        name: finalName,
        room: room,
        category: category,
        department: department,
        className: semester,
        gender: "Female",
        hostelName: formData.get("hostelName") || ""
      };

      const res = await fetch(`${API}/api/students/enroll-hostel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newInmate)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Inmate enrolled successfully!");
        e.target.reset();
        setName("");
        setDepartment("");
        setSemester("");
        setGender("Female");
        setIsAutoFilled(false);
        setSelectedId("");
        setSearchText("");
      } else {
        setMessage(`Error: ${data.message || "Failed to enroll."}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("Error: Server connection failed.");
    }
  };

  const showPersonSelect = category === "Student" || category === "Faculty";
  const personList = getFilteredList();

  return (
    <div className="hostelPage" style={{ userSelect: "none" }}>
      <div className="formPage">
        <div className="formCard">
          <div className="formHeader">
            <button
              className="backBtn"
              onClick={() => navigate("/hostel/dashboard")}
              onMouseDown={(e) => e.preventDefault()}
            >
              Back
            </button>
            <h2>Enroll New Inmate</h2>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Category Selector */}
            <select
              name="category"
              value={category}
              onChange={handleCategoryChange}
              required
              style={{ marginBottom: "15px" }}
            >
              <option value="Inmate type">Inmate type</option>
              <option value="Student">Student</option>
              <option value="Faculty">Faculty</option>
              <option value="Staff">Staff</option>
              <option value="Guest">Guest</option>
              <option value="Supple Exam">Supplementary Exam</option>
            </select>

            {/* Searchable Female Person Dropdown */}
            {showPersonSelect && (
              <div style={{ position: "relative", marginBottom: "15px" }}>
                <input
                  type="text"
                  placeholder={`Search female ${category === "Faculty" ? "faculty" : "student"} by name or ID…`}
                  value={searchText}
                  onChange={(e) => {
                    setSearchText(e.target.value);
                    setShowDropdown(true);
                    setIsAutoFilled(false);
                    setSelectedId("");
                  }}
                  onFocus={() => setShowDropdown(true)}
                  autoComplete="off"
                  style={{ width: "100%", boxSizing: "border-box" }}
                />
                {showDropdown && searchText && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      background: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                      zIndex: 999,
                      maxHeight: "220px",
                      overflowY: "auto",
                    }}
                  >
                    {personList.length === 0 ? (
                      <div style={{ padding: "12px 16px", color: "#94a3b8", fontSize: "0.9rem" }}>
                        No female {category === "Faculty" ? "faculty" : "students"} found
                      </div>
                    ) : (
                      personList.map((item) => {
                        const id = item.admissionNo || item.admission || item.facultyId || "";
                        return (
                          <div
                            key={item._id}
                            onMouseDown={() => handleSelect(item)}
                            style={{
                              padding: "10px 16px",
                              cursor: "pointer",
                              borderBottom: "1px solid #f1f5f9",
                              fontSize: "0.9rem",
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}
                          >
                            <span style={{ fontWeight: 500 }}>{item.name}</span>
                            <span style={{ color: "#64748b" }}>{id}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Name (auto-filled, read-only after selection) */}
            <input
              name="name"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              readOnly={isAutoFilled}
              required
            />

            {/* Gender: always Female for hostel, just display it */}
            <div style={{ marginBottom: "15px", color: "#64748b", fontSize: "0.9rem" }}>
              Gender: <strong style={{ color: "#ec4899" }}>Female</strong>
            </div>

            {/* Department */}
            {showPersonSelect && (
              <select
                name="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                disabled={isAutoFilled}
                required
              >
                <option value="">Select Department</option>
                {departments.map(d => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            )}

            {/* Semester (students only) */}
            {category === "Student" && (
              <select
                name="semester"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                disabled={isAutoFilled}
                required
              >
                <option value="">Select Semester</option>
                {["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"].map(s => (
                  <option key={s} value={s}>Semester {s.slice(1)}</option>
                ))}
              </select>
            )}

            {/* Hostel Selector */}
            <select name="hostelName" required style={{ marginBottom: "15px" }}>
              <option value="">Select Hostel</option>
              <option value="Nila Ladies Hostel">Nila Ladies Hostel</option>
            </select>

            <input
              name="enrollmentDate"
              placeholder="Enrollment Date"
              type="text"
              onFocus={(e) => (e.target.type = "date")}
              onBlur={(e) => (e.target.type = "text")}
              required
              style={{ marginTop: "15px" }}
            />
            <input name="room" placeholder="Room Number" required />

            <button className="submitBtn" onMouseDown={(e) => e.preventDefault()}>
              Enroll Inmate
            </button>
          </form>

          {message && (
            <p
              className="successMsg"
              style={{ color: message.includes("Error") ? "red" : "green" }}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Enrollment;
