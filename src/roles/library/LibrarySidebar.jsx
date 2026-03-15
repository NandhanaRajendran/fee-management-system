import { useState } from "react";
import LibraryLayout from "./LibraryLayout";
import { useLibrary, getDaysOverdue, FINE_RATE } from "./LibraryContext";

export default function StudentList() {
  const { records, addRecord, markReturned } = useLibrary();
  const today = new Date().toISOString().split("T")[0];
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", adno: "", class: "", dept: "",
    book: "", date: today, returnDate: "",
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleAdd(e) {
    e.preventDefault();
    addRecord(form);
    setForm({ name: "", adno: "", class: "", dept: "", book: "", date: today, returnDate: "" });
    setShowForm(false);
  }

  return (
    <LibraryLayout>
      <div className="lib-container">

        <div className="lib-page-header">
          <div>
            <h2>Student List</h2>
            <p>Books currently issued from the library</p>
          </div>
          <button className="lib-add-btn" onClick={() => setShowForm(!showForm)}>
            + Add Record
          </button>
        </div>

        {showForm && (
          <div className="lib-form-card">
            <h3>New Book Issue</h3>
            <form onSubmit={handleAdd}>
              <div className="lib-form-grid">
                <div className="lib-field">
                  <label>Student Name</label>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Arun Kumar" required />
                </div>
                <div className="lib-field">
                  <label>Admission No</label>
                  <input name="adno" value={form.adno} onChange={handleChange} placeholder="e.g. 4001" required />
                </div>
                <div className="lib-field">
                  <label>Class</label>
                  <input name="class" value={form.class} onChange={handleChange} placeholder="e.g. S5" required />
                </div>
                <div className="lib-field">
                  <label>Department</label>
                  <input name="dept" value={form.dept} onChange={handleChange} placeholder="e.g. CSE" required />
                </div>
                <div className="lib-field">
                  <label>Book Name</label>
                  <input name="book" value={form.book} onChange={handleChange} placeholder="e.g. Data Structures" required />
                </div>
                <div className="lib-field">
                  <label>Issue Date</label>
                  <input type="date" name="date" value={form.date} onChange={handleChange} required />
                </div>
                <div className="lib-field">
                  <label>Return Date</label>
                  <input type="date" name="returnDate" value={form.returnDate} onChange={handleChange} required />
                </div>
              </div>
              <div className="lib-form-footer">
                <button type="button" className="lib-cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="lib-submit-btn">Add Record</button>
              </div>
            </form>
          </div>
        )}

        <div className="lib-table-wrap">
          <table className="lib-table">
            <thead>
              <tr>
                <th>#</th><th>Name</th><th>Adm No</th><th>Class</th>
                <th>Dept</th><th>Book</th><th>Issue Date</th>
                <th>Return Date</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan="10" className="lib-empty">No records yet. Click "+ Add Record" to add.</td>
                </tr>
              ) : records.map((r, i) => {
                const days = getDaysOverdue(r.returnDate);
                const overdue = !r.returned && days > 0;
                const fine = days * FINE_RATE;
                return (
                  <tr key={r.id} className={overdue ? "lib-row-overdue" : ""}>
                    <td>{i + 1}</td>
                    <td>{r.name}</td>
                    <td>{r.adno}</td>
                    <td>{r.class}</td>
                    <td>{r.dept}</td>
                    <td>{r.book}</td>
                    <td>{r.date}</td>
                    <td>{r.returnDate}</td>
                    <td>
                      {r.returned ? (
                        <span className="lib-badge returned">Returned</span>
                      ) : overdue ? (
                        <span className="lib-badge overdue">Overdue · ₹{fine}</span>
                      ) : (
                        <span className="lib-badge active">Active</span>
                      )}
                    </td>
                    <td>
                      {!r.returned && (
                        <button className="lib-return-btn" onClick={() => markReturned(r.id)}>
                          Mark Returned
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </LibraryLayout>
  );
}