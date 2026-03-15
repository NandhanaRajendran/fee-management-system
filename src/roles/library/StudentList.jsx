import { useState } from "react";
import LibraryLayout from "./LibraryLayout";
import { useLibrary, getDaysSinceTaken, getDaysOverdue, calculateFine, DUE_DAYS } from "./LibraryContext";

export default function StudentList() {
  const { records, addRecord, markReturned } = useLibrary();
  const today = new Date().toISOString().split("T")[0];

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", adno: "", cls: "", dept: "", book: "", date: today,
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleAdd(e) {
    e.preventDefault();
    addRecord(form);
    setForm({ name: "", adno: "", cls: "", dept: "", book: "", date: today });
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
                  <input name="name" value={form.name} onChange={handleChange}
                    placeholder="e.g. Arun Kumar" required />
                </div>

                <div className="lib-field">
                  <label>Admission No</label>
                  <input name="adno" value={form.adno} onChange={handleChange}
                    placeholder="e.g. 4001" required />
                </div>

                <div className="lib-field">
                  <label>Class</label>
                  <input name="cls" value={form.cls} onChange={handleChange}
                    placeholder="e.g. S5" required />
                </div>

                <div className="lib-field">
                  <label>Department</label>
                  <input name="dept" value={form.dept} onChange={handleChange}
                    placeholder="e.g. CSE" required />
                </div>

                <div className="lib-field">
                  <label>Book Name</label>
                  <input name="book" value={form.book} onChange={handleChange}
                    placeholder="e.g. Data Structures" required />
                </div>

                <div className="lib-field">
                  <label>Issue Date</label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    max={today}
                    onChange={handleChange}
                    required
                    className="lib-date-input"
                  />
                </div>

              </div>

              <p className="lib-due-note">
                ℹ️ Due date is automatically set to <b>{DUE_DAYS} days</b> from issue date.
                Fine of <b>₹10/day</b> applies after that.
              </p>

              <div className="lib-form-footer">
                <button type="button" className="lib-cancel-btn"
                  onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="lib-submit-btn">Add Record</button>
              </div>
            </form>
          </div>
        )}

        <div className="lib-table-wrap">
          <table className="lib-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Adm No</th>
                <th>Class</th>
                <th>Dept</th>
                <th>Book</th>
                <th>Issue Date</th>
                <th>Days Held</th>
                <th>Status</th>
                <th>Fine</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan="11" className="lib-empty">
                    No records yet. Click "+ Add Record" to add.
                  </td>
                </tr>
              ) : records.map((r, i) => {
                const days     = getDaysSinceTaken(r.date);
                const overdue  = !r.returned && getDaysOverdue(r.date) > 0;
                const fine     = overdue ? calculateFine(r.date) : 0;
                return (
                  <tr key={r.id} className={overdue ? "lib-row-overdue" : ""}>
                    <td>{i + 1}</td>
                    <td>{r.name}</td>
                    <td>{r.adno}</td>
                    <td>{r.cls}</td>
                    <td>{r.dept}</td>
                    <td>{r.book}</td>
                    <td>{r.date}</td>
                    <td>{r.returned ? "—" : `${days} days`}</td>
                    <td>
                      {r.returned ? (
                        <span className="lib-badge returned">Returned {r.returnedDate}</span>
                      ) : overdue ? (
                        <span className="lib-badge overdue">Overdue</span>
                      ) : (
                        <span className="lib-badge active">Active</span>
                      )}
                    </td>
                    <td>
                      {overdue
                        ? <span className="lib-fine-cell">₹{fine}</span>
                        : <span className="lib-fine-nil">—</span>
                      }
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