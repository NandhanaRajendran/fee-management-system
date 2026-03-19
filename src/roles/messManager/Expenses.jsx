import { useState, useEffect, useRef, useCallback } from "react";
import Layout from "../../components/Layout";
import AlertToast from "../../components/Alerttoast";

// ─── CHANGE THIS ONE LINE TO SWITCH BETWEEN LOCAL AND PRODUCTION ───────────
//const API = "http://localhost:5000";
const API = "https://mess-management-system-q6us.onrender.com"; // ← uncomment for production
// ──────────────────────────────────────────────────────────────────────────

export default function Expenses() {
  const today = new Date().toISOString().split("T")[0];
  const currentMonth = new Date().toISOString().slice(0, 7);

  // ─── CONSTANTS (defined early so functions can use them) ───
  const MONTHS = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  //const currentYear = new Date().getFullYear();
  //const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const fileInputRef = useRef();

  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today);
  const [quantity, setQuantity] = useState("");

  const [bill, setBill] = useState(null);
  const [selectedBill, setSelectedBill] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const [prevBalance, setPrevBalance] = useState("");
  const [prevMonth, setPrevMonth] = useState("");
  const [closingBalance, setClosingBalance] = useState("");

  const [staffType, setStaffType] = useState("");
  const [staffAmount, setStaffAmount] = useState("");
  const [staffSaving, setStaffSaving] = useState(false);

  const [isLocked, setIsLocked] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  // Combined freeze — disable everything if either locked or published
  const isFrozen = isLocked || isPublished;

  const [toast, setToast] = useState(null);
  const showToast = (message, type = "info") => setToast({ message, type });

  // ─── FETCH EXPENSES ────────────────────────────────────────
  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await fetch(`${API}/api/expenses`);
      if (!response.ok) throw new Error("Failed to fetch expenses");
      const data = await response.json();
      setExpenses(data);
    } catch (err) {
      setError("Could not load expenses. Is the server running?");
      console.error(err);
    }
  };

  // ─── COMPUTE PREVIOUS MONTH KEY ────────────────────────────
  const getPrevMonthKey = (monthStr) => {
    const d = new Date(monthStr + "-01");
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 7);
  };

  // ─── FETCH BALANCE ─────────────────────────────────────────
  const fetchBalance = useCallback(async () => {
    try {
      const prevMonthKey = getPrevMonthKey(selectedMonth);
      setPrevMonth(prevMonthKey);

      const res = await fetch(`${API}/api/balance/${selectedMonth}`);
      const data = await res.json();
      setClosingBalance(data?.closingBalance || "");

      const prevRes = await fetch(`${API}/api/balance/${prevMonthKey}`);
      const prevData = await prevRes.json();
      setPrevBalance(prevData?.closingBalance || "");

      const [selYear, selMon] = selectedMonth.split("-").map(Number);
      const [curYear, curMon] = currentMonth.split("-").map(Number);
      const monthsDiff = (curYear - selYear) * 12 + (curMon - selMon);
      const alreadySaved = Number(data?.closingBalance || 0) > 0;
      setIsLocked(monthsDiff >= 2 && alreadySaved);

      setSaveStatus("");

      // Check publish status
      try {
        const billRes = await fetch(`${API}/api/bill/${selectedMonth}`);
        const billData = billRes.ok ? await billRes.json() : {};
        setIsPublished(billData?.published || false);
      } catch (_) {
        setIsPublished(false);
      }
    } catch (err) {
      console.error("Balance fetch error:", err);
    }
  }, [selectedMonth, currentMonth]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // ─── SAVE CLOSING BALANCE ──────────────────────────────────
  const saveBalance = async () => {
    if (isFrozen) return;

    setSaveStatus("saving");
    try {
      const res = await fetch(`${API}/api/balance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: selectedMonth,
          prevBalance: Number(prevBalance || 0),
          closingBalance: Number(closingBalance || 0),
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      setSaveStatus("saved");

      const [selYear, selMon] = selectedMonth.split("-").map(Number);
      const [curYear, curMon] = currentMonth.split("-").map(Number);
      const monthsDiff = (curYear - selYear) * 12 + (curMon - selMon);
      if (monthsDiff >= 2 && Number(closingBalance) > 0) {
        setIsLocked(true);
      }

      setTimeout(() => setSaveStatus(""), 2500);
    } catch (err) {
      console.error("Save balance error:", err);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(""), 2500);
    }
  };

  const handleViewBill = (expense) => {
    setSelectedBill(expense);
  };

  // ─── ADD EXPENSE ───────────────────────────────────────────
  async function addExpense() {
    if (isPublished) {
      showToast(`Bill for ${selectedMonth} is published. Expenses cannot be added.`, "warning");
      return;
    }

    if (!title || !amount || !bill) {
      showToast("Please fill all fields and upload bill.", "warning");
      return;
    }
    if (Number(amount) <= 0) {
      showToast("Amount must be greater than 0.", "warning");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("amount", Number(amount));
    formData.append("date", date);
    formData.append("billMonth", selectedMonth);
    formData.append("quantity", quantity);
    formData.append("bill", bill);
    formData.append("isStaff", "false");

    try {
      const response = await fetch(`${API}/api/expenses`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to add expense");

      const savedExpense = await response.json();
      setExpenses([...expenses, savedExpense]);

      setTitle("");
      setAmount("");
      setDate(today);
      setBill(null);
      setQuantity("");
      fileInputRef.current.value = "";
    } catch (err) {
      console.error(err);
      showToast("Error adding expense. Is the server running?", "error");
    }
  }

  // ─── ADD STAFF CHARGE ──────────────────────────────────────
  async function addStaffCharge() {
    if (isPublished) {
      showToast(`Bill for ${selectedMonth} is published. Staff charges cannot be added.`, "warning"); 
      return;
    }

    if (!staffType || !staffAmount || Number(staffAmount) <= 0) return;

    const alreadyAdded = expenses.some(
      (exp) =>
        exp.isStaff &&
        exp.billMonth === selectedMonth &&
        exp.title === staffType
    );
    if (alreadyAdded) {
      showToast(`"${staffType}" already added for ${selectedMonth}. Delete it first to change.`, "warning"); 
      return;
    }

    setStaffSaving(true);
    try {
      const response = await fetch(`${API}/api/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: staffType,
          amount: Number(staffAmount),
          date: today,
          billMonth: selectedMonth,
          quantity: "",
          isStaff: true,
        }),
      });

      if (!response.ok) throw new Error("Failed to add staff charge");

      const saved = await response.json();
      setExpenses([...expenses, saved]);
      setStaffType("");
      setStaffAmount("");
    } catch (err) {
      console.error(err);
      showToast("Error saving staff charge. Is the server running?", "error");
    } finally {
      setStaffSaving(false);
    }
  }

  // ─── DELETE EXPENSE ────────────────────────────────────────
  async function deleteExpense(id) {
    if (isPublished) {
      showToast(`Bill for ${selectedMonth} is published. Expenses cannot be deleted.`, "warning");
      return;
    }
    try {
      await fetch(`${API}/api/expenses/${id}`, { method: "DELETE" });
      setExpenses(expenses.filter((exp) => exp._id !== id));
    } catch (err) {
      console.error(err);
      showToast("Error deleting expense.", "error");
    }
  }

  // ─── SPLIT expenses vs staff ───────────────────────────────
  const monthlyAll = expenses.filter((exp) => exp.billMonth === selectedMonth);
  const monthlyExpenses = monthlyAll.filter((exp) => !exp.isStaff);
  const monthlyStaff = monthlyAll.filter((exp) => exp.isStaff);

  const expenseTotal = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
  const staffTotal = monthlyStaff.reduce((sum, s) => sum + s.amount, 0);
  const finalTotal =
    expenseTotal +
    staffTotal +
    Number(prevBalance || 0) -
    Number(closingBalance || 0);


  // ─── MONTH / YEAR PICKER HELPERS ──────────────────────────
  // MONTHS/YEARS defined at top of component

  // Period picker — only current month and previous month
  const nowM = new Date().getMonth() + 1;
  const nowY = new Date().getFullYear();
  const prevM = nowM === 1 ? 12 : nowM - 1;
  const prevY = nowM === 1 ? nowY - 1 : nowY;

  const PERIOD_OPTIONS = [
    { label: `${MONTHS[prevM - 1]} ${prevY}`, value: `${prevY}-${String(prevM).padStart(2,"0")}` },
    { label: `${MONTHS[nowM - 1]} ${nowY}`,   value: `${nowY}-${String(nowM).padStart(2,"0")}` },
  ];

  function handleMonthChange(val) {
    setSelectedMonth(val);
    setDate(today); // bill date always = today
  }



  return (
    <Layout>
      {/* Ensure browser respects cursor:not-allowed on disabled elements */}
      <style>{`
        .expenses-container input:disabled,
        .expenses-container select:disabled,
        .expenses-container button:disabled {
          cursor: not-allowed !important;
          opacity: 0.65;
        }
      `}</style>
      <div className="expenses-container">
        <h2>Mess Expenses</h2>

        {/* TOP CONTROLS */}
        <div className="top-controls">
          <div>
            <label>Period</label>
            <select
              value={selectedMonth}
              onChange={(e) => handleMonthChange(e.target.value)}
              style={{ width: "100%" }}
            >
              {PERIOD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Prev balance — always read-only */}
          <div>
            <label>Closing Balance of {prevMonth}</label>
            <input
              type="number"
              value={prevBalance}
              disabled
              style={{ background: "#f1f5f9", cursor: "not-allowed", color: "#64748b" }}
            />
          </div>

          {/* Closing balance — disabled if locked OR published */}
          <div>
            <label>
              Closing Balance of {selectedMonth}
              {isLocked && !isPublished && (
                <span style={{ color: "#ef4444", fontSize: "11px", marginLeft: "6px" }}>
                  🔒 Locked
                </span>
              )}
              {isPublished && (
                <span style={{ color: "#ef4444", fontSize: "11px", marginLeft: "6px" }}>
                  🔒 Published
                </span>
              )}
            </label>
            <input
              type="number"
              value={closingBalance}
              disabled={isFrozen}
              placeholder="Enter closing balance"
              style={isFrozen ? { background: "#f1f5f9", cursor: "not-allowed", color: "#64748b" } : {}}
              onChange={(e) => {
                setClosingBalance(e.target.value);
                setSaveStatus("");
              }}
            />
          </div>

          {/* Save button — hidden when frozen */}
          {!isFrozen && (
            <div style={{ alignSelf: "flex-end" }}>
              <button
                onClick={saveBalance}
                disabled={saveStatus === "saving"}
                style={{
                  background:
                    saveStatus === "saved"
                      ? "linear-gradient(135deg,#22c55e,#16a34a)"
                      : saveStatus === "error"
                      ? "linear-gradient(135deg,#ef4444,#dc2626)"
                      : "linear-gradient(135deg,#2f6bff,#1d4fd8)",
                  color: "white",
                  border: "none",
                  padding: "9px 20px",
                  borderRadius: "8px",
                  cursor: saveStatus === "saving" ? "not-allowed" : "pointer",
                  fontWeight: "600",
                  fontSize: "13px",
                  fontFamily: "'DM Sans', sans-serif",
                  boxShadow: "0 2px 8px rgba(47,107,255,0.28)",
                  whiteSpace: "nowrap",
                  height: "38px",
                  opacity: saveStatus === "saving" ? 0.75 : 1,
                  transition: "background 0.3s",
                }}
              >
                {saveStatus === "saving" ? "Saving..."
                  : saveStatus === "saved" ? "✓ Saved"
                  : saveStatus === "error" ? "✗ Failed"
                  : "Save Balance"}
              </button>
            </div>
          )}
        </div>

        {/* Published banner */}
        {isPublished && (
          <div style={{
            background: "#fef9c3", border: "1px solid #fde047",
            color: "#854d0e", padding: "10px 16px", borderRadius: "8px",
            marginBottom: "14px", fontSize: "13px", fontWeight: "600",
          }}>
            🔒 Bill for {selectedMonth} has been published. All fields are frozen and cannot be modified.
          </div>
        )}

        {error && (
          <div style={{
            color: "#dc2626", background: "#fee2e2",
            padding: "10px 14px", borderRadius: "8px",
            marginBottom: "14px", fontSize: "13px",
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* ADD EXPENSE FORM */}
        <div className="card">
          <h4>Add Expense</h4>

          <div className="form-row">
            <input
              placeholder="Expense title"
              value={title}
              disabled={isPublished}
              style={isPublished ? { cursor: "not-allowed", background: "#f1f5f9", color: "#94a3b8" } : {}}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              placeholder="Quantity"
              value={quantity}
              disabled={isPublished}
              style={isPublished ? { cursor: "not-allowed", background: "#f1f5f9", color: "#94a3b8" } : {}}
              onChange={(e) => setQuantity(e.target.value)}
            />
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              min="0.01"
              step="0.01"
              disabled={isPublished}
              style={isPublished ? { cursor: "not-allowed", background: "#f1f5f9", color: "#94a3b8" } : {}}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || Number(val) > 0) setAmount(val);
              }}
            />

          </div>

          <div className="form-row">
            <input
              type="file"
              ref={fileInputRef}
              disabled={isPublished}
              style={isPublished ? { cursor: "not-allowed", opacity: 0.5 } : {}}
              onChange={(e) => setBill(e.target.files[0])}
            />
            <button onClick={addExpense} disabled={isPublished} style={isPublished ? { cursor: "not-allowed", opacity: 0.5 } : {}}>
              Add Expense
            </button>
          </div>
        </div>

        {/* STAFF CHARGES */}
        <div className="card">
          <h4>Staff Charges</h4>

          <div className="form-row">
            <select
              value={staffType}
              disabled={isPublished}
              style={isPublished ? { cursor: "not-allowed", background: "#f1f5f9", color: "#94a3b8" } : {}}
              onChange={(e) => setStaffType(e.target.value)}
            >
              <option value="">Select Staff</option>
              <option>Cook Salary</option>
              <option>Matron Salary</option>
              <option>Temporary Staff</option>
            </select>
            <input
              type="number"
              placeholder="Amount"
              value={staffAmount}
              min="0.01"
              disabled={isPublished}
              style={isPublished ? { cursor: "not-allowed", background: "#f1f5f9", color: "#94a3b8" } : {}}
              onChange={(e) => setStaffAmount(e.target.value)}
            />
            <button onClick={addStaffCharge} disabled={staffSaving || isPublished} style={isPublished ? { cursor: "not-allowed", opacity: 0.5 } : {}}>
              {staffSaving ? "Saving..." : "Add"}
            </button>
          </div>

          {monthlyStaff.map((s) => (
            <div key={s._id} className="staff-item">
              {s.title} — ₹{s.amount}
              {!isPublished && (
                <button
                  onClick={() => deleteExpense(s._id)}
                  style={{
                    marginLeft: "10px",
                    background: "#fee2e2",
                    color: "#dc2626",
                    border: "none",
                    padding: "2px 8px",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontSize: "11px",
                    fontWeight: "600",
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        {/* EXPENSE TABLE */}
        <div className="card">
          <table className="expense-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Qty</th>
                <th>Amount</th>
                <th>Action</th>
                <th>Bill</th>
              </tr>
            </thead>
            <tbody>
              {monthlyExpenses.map((exp) => (
                <tr key={exp._id}>
                  <td>{new Date(exp.date).toLocaleDateString()}</td>
                  <td>{exp.title}</td>
                  <td>{exp.quantity || "-"}</td>
                  <td>₹{exp.amount}</td>
                  <td>
                    {!isPublished ? (
                      <button onClick={() => deleteExpense(exp._id)}>Delete</button>
                    ) : (
                      <span style={{ color: "#94a3b8", fontSize: "12px" }}>—</span>
                    )}
                  </td>
                  <td>
                    {exp.bill ? (
                      <button onClick={() => handleViewBill(exp)}>View</button>
                    ) : "-"}
                  </td>
                </tr>
              ))}

              {monthlyStaff.map((s) => (
                <tr key={s._id}>
                  <td>{new Date(s.date).toLocaleDateString()}</td>
                  <td style={{ color: "#9333ea", fontWeight: "600" }}>{s.title}</td>
                  <td>-</td>
                  <td>₹{s.amount}</td>
                  <td>
                    {!isPublished ? (
                      <button onClick={() => deleteExpense(s._id)}>Delete</button>
                    ) : (
                      <span style={{ color: "#94a3b8", fontSize: "12px" }}>—</span>
                    )}
                  </td>
                  <td>-</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SUMMARY */}
        <div className="summary-card">
          <div>Expenses: ₹{expenseTotal}</div>
          <div>Staff: ₹{staffTotal}</div>
          <div>+ Prev Balance ({prevMonth}): ₹{prevBalance || 0}</div>
          <div>- Closing ({selectedMonth}): ₹{closingBalance || 0}</div>
          <div className="final">Final: ₹{finalTotal}</div>
        </div>
      </div>

      {/* TOAST */}
      {toast && <AlertToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* BILL MODAL */}
      {selectedBill && (
        <div className="bill-overlay">
          <div className="bill-modal">
            <button onClick={() => setSelectedBill(null)}>✕</button>
            {selectedBill.bill.endsWith(".pdf") ? (
              <iframe
                src={selectedBill.bill}
                title="Bill"
              />
            ) : (
              <img
                src={selectedBill.bill}
                alt="Bill"
              />
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}