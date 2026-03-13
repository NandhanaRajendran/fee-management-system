import { useState, useEffect } from "react";
import Layout from "../components/Layout";

export default function MessBill() {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const [allStudents, setAllStudents] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [studentsRes, expensesRes] = await Promise.all([
          fetch("https://mess-management-system-q6us.onrender.com/api/students"),
          fetch("https://mess-management-system-q6us.onrender.com/api/expenses")
        ]);

        if (!studentsRes.ok || !expensesRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const studentsData = await studentsRes.json();
        const expensesData = await expensesRes.json();

        setAllStudents(studentsData);
        setExpenses(expensesData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* calculate attendance days */
  function calculateAttendance(person) {
    if (!person.attendanceRecords) return 0;

    let total = 0;

    Object.keys(person.attendanceRecords).forEach((date) => {
      const messcut = person.messCutRecords?.[date] ?? false;

      if (!messcut && date.startsWith(selectedMonth)) {
        total++;
      }
    });

    return total;
  }

  /* monthly mess expense */
  const monthlyExpense = expenses
    .filter((exp) => exp.billMonth === selectedMonth)
    .reduce((sum, exp) => sum + exp.amount, 0);

  /* total attendance */
  const totalAttendance = allStudents.reduce(
    (sum, student) => sum + calculateAttendance(student),
    0,
  );

  /* mess rate per day */
  const messRate = totalAttendance ? monthlyExpense / totalAttendance : 0;

  return (
    <Layout>
      <div className="expenses-container">
        <h2>Mess Bill</h2>

        <div style={{ marginBottom: "15px" }}>
          <label>
            <b>Month :</b>
          </label>

          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
        </div>

        {error && <div style={{ color: "red", padding: "10px" }}>Error: {error}</div>}

        {/* Scrollable table */}
        <div className="table-responsive" style={{ maxHeight: "400px", overflowY: "auto" }}>
          <table className="expense-table">
            <thead>
              <tr>
                <th>Room</th>
                <th>Student</th>
                <th>Attendance Days</th>
                <th>Mess Bill</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>Loading...</td>
                </tr>
              ) : allStudents.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>No students found in the database.</td>
                </tr>
              ) : allStudents.map((student) => {
                const days = calculateAttendance(student);
                const bill = (days * messRate).toFixed(2);

                return (
                  <tr key={student._id}>
                    <td>{student.room}</td>
                    <td>{student.name}</td>
                    <td>{days}</td>
                    <td>₹{bill}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="expense-total">
          Total Mess Expense : ₹{monthlyExpense}
          <br />
          Total Attendance : {totalAttendance}
          <br />
          Mess Rate Per Day : ₹{messRate.toFixed(2)}
        </div>
      </div>
    </Layout>
  );
}
