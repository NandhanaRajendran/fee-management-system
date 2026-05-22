import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { Search, AlertCircle, Users, IndianRupee, BookOpen } from "lucide-react";
import API from "../../config/api";
//const API = "http://localhost:8000";
// const API = "https://mess-management-system-q6us.onrender.com";


export default function DueSheet() {
  const [dues, setDues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/api/bill/dues/list?month=${selectedMonth}`)
      .then((res) => res.json())
      .then((data) => {
        setDues(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedMonth]);

  const filteredDues = dues.filter((due) =>
    (due.student?.name?.toLowerCase()?.includes(search.toLowerCase()) || false) ||
    (due.student?.admissionNo?.toLowerCase()?.includes(search.toLowerCase()) || false) ||
    (due.student?.room?.toLowerCase()?.includes(search.toLowerCase()) || false) ||
    (due.student?.className?.toLowerCase()?.includes(search.toLowerCase()) || false)
  );

  // ─── Summary stats ─────────────────────────────────────────
  const totalUnpaid = filteredDues.length;
  const totalDueAmount = filteredDues.reduce((sum, d) => sum + (d.amount || 0), 0);
  const uniqueClasses = [...new Set(filteredDues.map(d => d.student?.className).filter(Boolean))].length;

  // ─── Month label ────────────────────────────────────────────
  const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const getMonthLabel = (monthStr) => {
    if (!monthStr) return "";
    const [y, m] = monthStr.split("-").map(Number);
    return `${MONTHS[m - 1]} ${y}`;
  };

  return (
    <Layout>
      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", paddingBottom: "30px" }}>

        {/* ─── HEADER ────────────────────────────────────────── */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          marginBottom: "20px", flexWrap: "wrap", gap: "12px",
        }}>
          <div>
            <h2 style={{
              margin: 0, fontSize: "22px", fontWeight: "700", color: "#0a1f5c",
              display: "flex", alignItems: "center", gap: "8px",
            }}>
              <AlertCircle size={22} color="#dc2626" />
              Mess Due Sheet
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
              Students who have <b>not paid</b> their mess bill for <b>{getMonthLabel(selectedMonth)}</b>
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            {/* Search */}
            <div style={{
              display: "flex", alignItems: "center", background: "#fff",
              border: "1px solid #e2e8f0", borderRadius: "8px", padding: "6px 12px",
            }}>
              <Search size={16} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search name, adm, room, class..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ border: "none", outline: "none", marginLeft: "8px", fontSize: "13px", width: "200px", fontFamily: "inherit" }}
              />
            </div>

            {/* Month picker */}
            <div style={{
              display: "flex", alignItems: "center", background: "#fff",
              border: "1px solid #e2e8f0", borderRadius: "8px", padding: "6px 12px",
            }}>
              <label style={{ fontSize: "13px", color: "#64748b", fontWeight: "600", marginRight: "8px" }}>Month:</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                style={{ border: "none", outline: "none", fontSize: "13px", color: "#1e293b", fontFamily: "inherit" }}
              />
            </div>
          </div>
        </div>

        {/* ─── SUMMARY CARDS ─────────────────────────────────── */}
        {!loading && (
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px", marginBottom: "20px",
          }}>
            {/* Unpaid Students */}
            <div style={{
              background: "linear-gradient(135deg, #fef2f2, #fff1f2)",
              border: "1px solid #fecaca", borderRadius: "12px",
              padding: "16px 20px", display: "flex", alignItems: "center", gap: "14px",
            }}>
              <div style={{
                width: "42px", height: "42px", borderRadius: "10px",
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <Users size={20} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: "24px", fontWeight: "700", color: "#991b1b", lineHeight: 1 }}>
                  {totalUnpaid}
                </div>
                <div style={{ fontSize: "11px", fontWeight: "600", color: "#b91c1c", opacity: 0.75, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "2px" }}>
                  Unpaid Students
                </div>
              </div>
            </div>

            {/* Total Due Amount */}
            <div style={{
              background: "linear-gradient(135deg, #fffbeb, #fef3c7)",
              border: "1px solid #fde68a", borderRadius: "12px",
              padding: "16px 20px", display: "flex", alignItems: "center", gap: "14px",
            }}>
              <div style={{
                width: "42px", height: "42px", borderRadius: "10px",
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <IndianRupee size={20} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: "24px", fontWeight: "700", color: "#92400e", lineHeight: 1 }}>
                  ₹{totalDueAmount.toLocaleString()}
                </div>
                <div style={{ fontSize: "11px", fontWeight: "600", color: "#a16207", opacity: 0.75, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "2px" }}>
                  Total Due Amount
                </div>
              </div>
            </div>

            {/* Classes Affected */}
            <div style={{
              background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
              border: "1px solid #bfdbfe", borderRadius: "12px",
              padding: "16px 20px", display: "flex", alignItems: "center", gap: "14px",
            }}>
              <div style={{
                width: "42px", height: "42px", borderRadius: "10px",
                background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <BookOpen size={20} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: "24px", fontWeight: "700", color: "#1e40af", lineHeight: 1 }}>
                  {uniqueClasses}
                </div>
                <div style={{ fontSize: "11px", fontWeight: "600", color: "#1d4ed8", opacity: 0.75, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "2px" }}>
                  Classes Affected
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TABLE ──────────────────────────────────────────── */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
          <table className="expense-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#f8fafc" }}>
              <tr>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Room</th>
                <th style={thStyle}>Adm No</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Class</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Due Amount</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "#94a3b8", fontSize: "14px" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                      <div style={{
                        width: "32px", height: "32px", border: "3px solid #e2e8f0",
                        borderTop: "3px solid #3b82f6", borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                      }} />
                      Loading dues...
                    </div>
                  </td>
                </tr>
              ) : filteredDues.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "50px 20px" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                      <div style={{
                        width: "56px", height: "56px", borderRadius: "50%",
                        background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <span style={{ fontSize: "28px" }}>✅</span>
                      </div>
                      <div style={{ fontSize: "15px", fontWeight: "600", color: "#16a34a" }}>
                        No pending dues!
                      </div>
                      <div style={{ fontSize: "12px", color: "#94a3b8", maxWidth: "280px" }}>
                        {dues.length === 0
                          ? `No mess bill has been published for ${getMonthLabel(selectedMonth)} yet, or all students have paid.`
                          : "No students match your search filter."
                        }
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDues.map((due, index) => (
                  <tr
                    key={due._id}
                    style={{
                      borderTop: "1px solid #f1f5f9",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#fefce8"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ ...tdStyle, color: "#94a3b8", fontWeight: "500", width: "40px" }}>{index + 1}</td>
                    <td style={tdStyle}>
                      <span style={{
                        background: "#f1f5f9", padding: "3px 10px", borderRadius: "6px",
                        fontSize: "12px", fontWeight: "600", color: "#475569",
                      }}>
                        {due.student?.room || "—"}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, fontFamily: "'DM Mono', monospace", fontWeight: "500", color: "#475569" }}>
                      {due.student?.admissionNo || "—"}
                    </td>
                    <td style={{ ...tdStyle, fontWeight: "600", color: "#1e293b" }}>
                      {due.student?.name || "—"}
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        background: "#eff6ff", color: "#1d4ed8", padding: "3px 10px",
                        borderRadius: "6px", fontSize: "12px", fontWeight: "600",
                      }}>
                        {due.student?.className || "—"}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right", fontWeight: "700", color: "#dc2626", fontSize: "14px" }}>
                      ₹{due.amount?.toLocaleString() || 0}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "center" }}>
                      <span style={{
                        background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca",
                        padding: "4px 12px", borderRadius: "20px",
                        fontSize: "11px", fontWeight: "700", textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}>
                        Unpaid
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ─── FOOTER INFO ────────────────────────────────────── */}
        {!loading && filteredDues.length > 0 && (
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginTop: "12px", padding: "0 4px", flexWrap: "wrap", gap: "8px",
          }}>
            <span style={{ fontSize: "12px", color: "#94a3b8" }}>
              Showing {filteredDues.length} of {dues.length} unpaid student{dues.length !== 1 ? "s" : ""}
            </span>
            <span style={{ fontSize: "12px", color: "#94a3b8" }}>
              Period: {getMonthLabel(selectedMonth)}
            </span>
          </div>
        )}
      </div>

      {/* ─── SPINNER KEYFRAMES ────────────────────────────────── */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Layout>
  );
}

// ─── STYLE HELPERS ──────────────────────────────────────────
const thStyle = {
  padding: "12px 16px",
  textAlign: "left",
  fontSize: "11px",
  fontWeight: "700",
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  borderBottom: "2px solid #e2e8f0",
};

const tdStyle = {
  padding: "12px 16px",
  fontSize: "13px",
};
