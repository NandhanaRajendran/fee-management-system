import React, { useState, useEffect } from "react";
import "../../styles/principle.css";
import { useNavigate } from "react-router-dom";
import API from "../../config/api";

const PrincipalDashboard = () => {

  const [students, setStudents] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [semester, setSemester] = useState("");
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("");
  const [deptOptions, setDeptOptions] = useState([]);
  const [semesterOptions, setSemesterOptions] = useState([]);
  const navigate = useNavigate();
  //const API = "https://mess-management-system-q6us.onrender.com"
  //const API = "http://localhost:8000"

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API}/api/principal/students`);
        if (!response.ok) {
          throw new Error("Failed to fetch students");
        }
        const data = await response.json();
        console.log("FULL API DATA:", data);
        console.log("STUDENTS:", data.students);
        console.log("FIRST STUDENT:", data.students?.[0]);
        setStudents(data.students || []);
        setColumns(data.columns || []);
        const uniqueDepartments = [
          ...new Set(
            (data.students || [])
              .map((s) => s.department)
              .filter(Boolean)
          ),
        ];

        setDeptOptions(uniqueDepartments);
        const uniqueSemesters = [
          ...new Set(
            data.students
              ?.filter((s) => s.className)
              ?.map((s) => s.className)
          ),
        ];

        console.log("SEMESTERS:", uniqueSemesters);

        setSemesterOptions(uniqueSemesters);
        console.log(
          "CLASS NAMES:",
          data.students.map((s) => s.className)
        );
      } catch (error) {
        console.error("Error fetching principal dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const filteredStudents = students.filter((student) => {
    return (
      (student.admission?.toLowerCase() || "")
        .includes(search.toLowerCase()) &&

      (student.department?.toLowerCase() || "")
        .includes(dept.toLowerCase()) &&

      (!semester || student.className === semester)
    );
  });

  const renderCell = (value) => {
    if (!value) return <span>-</span>;
    return <span className="due">₹{value.toLocaleString()}</span>;
  };

  const calculateTotal = (student) => {
    return columns.reduce((sum, col) => sum + (student[col] || 0), 0);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="dashboard">

      {/* NAVBAR */}
      <div className="navbar ">
        <div className="nav-left">
          <span className="logo">🎓 UNIPAY</span>
          <span className="role">Principal Dashboard</span>
        </div>

        <div className="nav-right">
          <div className="user-info">
            <span className="username">Principal</span>
            <small> - Full Access</small>
          </div>

          <div className="profile-icon">👤</div>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="dashboard-content">

        <h2>Student Fee Dues</h2>

        {/* FILTERS */}
        <div className="filters">

          <input
            type="text"
            placeholder="Search Admission No"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={dept}
            onChange={(e) => setDept(e.target.value)}
          >
            <option value="">All Department</option>

            {deptOptions.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>


          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
          >
            <option value="">All Semester</option>

            {semesterOptions.map((sem) => (
              <option key={sem} value={sem}>
                {sem}
              </option>
            ))}
          </select>


        </div>

        {/* TABLE */}
        <div className="table-container">
          <table>

            <thead>
              <tr>
                <th>Admission No</th>
                <th>Name</th>
                <th>Dept</th>
                {columns.map(c => <th key={c}>{c}</th>)}
                <th>Total</th>
              </tr>
            </thead>

            <tbody>

              {filteredStudents.length > 0 ? filteredStudents.map((student, index) => {

                const total = calculateTotal(student);

                return (
                  <tr key={index}>
                    <td>{student.admission}</td>
                    <td>{student.name}</td>
                    <td>{student.department}</td>
                    {columns.map(c => <td key={c}>{renderCell(student[c])}</td>)}
                    <td className="total">
                      ₹{total.toLocaleString()}
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={columns.length + 4} style={{ textAlign: "center", padding: "2rem" }}>
                    {loading ? "Loading dues..." : "No dues found"}
                  </td>
                </tr>
              )}

            </tbody>

          </table>
        </div>

      </div>

    </div>
  );
};

export default PrincipalDashboard;