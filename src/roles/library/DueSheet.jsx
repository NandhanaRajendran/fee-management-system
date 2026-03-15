import LibraryLayout from "./LibraryLayout";
import { useLibrary, getDaysOverdue, calculateFine, FINE_RATE } from "./LibraryContext";

export default function DueSheet() {
  const { records, markReturned } = useLibrary();

  const dueRecords = records.filter(
    (r) => !r.returned && getDaysOverdue(r.date) > 0
  );

  const totalFine = dueRecords.reduce(
    (sum, r) => sum + calculateFine(r.date), 0
  );

  return (
    <LibraryLayout>
      <div className="lib-container">

        <div className="lib-page-header">
          <div>
            <h2>Due Sheet</h2>
            <p>Students who have not returned the book after 30 days</p>
          </div>
          {dueRecords.length > 0 && (
            <div className="lib-due-count">{dueRecords.length} Overdue</div>
          )}
        </div>

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
                <th>Days Overdue</th>
                <th>Fine (₹{FINE_RATE}/day)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {dueRecords.length === 0 ? (
                <tr>
                  <td colSpan="10" className="lib-empty">🎉 No overdue records!</td>
                </tr>
              ) : dueRecords.map((r, i) => {
                const days = getDaysOverdue(r.date);
                const fine = calculateFine(r.date);
                return (
                  <tr key={r.id} className="lib-row-overdue">
                    <td>{i + 1}</td>
                    <td>{r.name}</td>
                    <td>{r.adno}</td>
                    <td>{r.cls}</td>
                    <td>{r.dept}</td>
                    <td>{r.book}</td>
                    <td>{r.date}</td>
                    <td>
                      <span className="lib-badge overdue">{days} days</span>
                    </td>
                    <td>
                      <span className="lib-fine-cell">₹{fine}</span>
                    </td>
                    <td>
                      <button className="lib-return-btn" onClick={() => markReturned(r.id)}>
                        Mark Returned
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {dueRecords.length > 0 && (
          <div className="lib-fine-total">
            Total Fine Pending: ₹{totalFine}
          </div>
        )}

      </div>
    </LibraryLayout>
  );
}