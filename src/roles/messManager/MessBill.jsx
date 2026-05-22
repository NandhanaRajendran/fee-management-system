import { useState, useEffect, useRef } from "react";
import Layout from "../../components/Layout";
import AlertToast from "../../components/Alerttoast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import API from "../../config/api";
//const API = "https://mess-management-system-q6us.onrender.com";
//const API = "http://localhost:8000";

// ─── MODERN SELECT (inline, no separate file) ──────────────
function ModernSelect({ value, onChange, options, style, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const selectedOpt =
    options.find((o) => String(o.value) === String(value)) || options[0];

  return (
    <div ref={containerRef} style={{ ...style, position: "relative", display: "inline-block" }}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          padding: "8px 14px", paddingRight: "32px", borderRadius: "8px",
          border: isOpen ? "1px solid #3b82f6" : "1px solid #e2e8f0",
          backgroundColor: disabled ? "#f1f5f9" : "#ffffff",
          color: disabled ? "#94a3b8" : "#334155",
          fontSize: "13px", fontWeight: "600",
          cursor: disabled ? "not-allowed" : "pointer",
          userSelect: "none",
          boxShadow: isOpen ? "0 0 0 3px rgba(59,130,246,0.1)" : "0 1px 2px rgba(0,0,0,0.05)",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", backgroundSize: "14px",
          opacity: disabled ? 0.65 : 1, width: "100%", boxSizing: "border-box", minHeight: "36px",
          display: "flex", alignItems: "center",
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selectedOpt ? selectedOpt.label : "Select"}
        </span>
      </div>

      {isOpen && !disabled && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0,
          width: "100%", minWidth: "120px", maxHeight: "250px", overflowY: "auto",
          backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px",
          boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
          zIndex: 9999, padding: "4px", boxSizing: "border-box",
        }}>
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => { onChange({ target: { value: opt.value } }); setIsOpen(false); }}
              onMouseEnter={(e) => { if (String(opt.value) !== String(value)) e.currentTarget.style.backgroundColor = "#f8fafc"; }}
              onMouseLeave={(e) => { if (String(opt.value) !== String(value)) e.currentTarget.style.backgroundColor = "transparent"; }}
              style={{
                padding: "8px 12px", fontSize: "13px", fontWeight: "500",
                color: String(opt.value) === String(value) ? "#1d4ed8" : "#334155",
                backgroundColor: String(opt.value) === String(value) ? "#eff6ff" : "transparent",
                borderRadius: "6px", cursor: "pointer", transition: "background-color 0.15s",
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MessBill() {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const [allStudents, setAllStudents] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [balance, setBalance] = useState({ prevBalance: 0, closingBalance: 0 });

  const [isDrafted, setIsDrafted] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [draftedAt, setDraftedAt] = useState(null);
  const [publishedAt, setPublishedAt] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "info") => setToast({ message, type });

  async function sendDraft() {
    // ── CLOSING BALANCE VALIDATION ─────────────────────────
    // Closing balance must not exceed total monthly expenses
    const closingBal = Number(balance.closingBalance || 0);
    if (closingBal > foodExpenses) {
      showToast(
        `Closing balance (₹${closingBal.toFixed(2)}) exceeds food expenses (₹${foodExpenses.toFixed(2)}). Update it in Expenses page first.`,
        "warning",
      );
      return;
    }

    // ── CONFIRM ───────────────────────────────────────────
    const confirm = window.confirm(
      `${isDrafted ? "Resend" : "Send"} draft bill for ${selectedMonth} to students?\n\nStudents will be able to view their estimated bill. You can still edit expenses until you publish.`,
    );
    if (!confirm) return;

    setActionLoading(true);
    try {
      const bills = allStudents
        .filter(student =>
          student.attendance?.some(r =>
            r.date.startsWith(selectedMonth)
          )
        )
        .map((student) => {

          const days = calculateAttendance(student);

          const foodBill = days * foodRatePerDay;

          const milkDays =
            student.attendance?.filter(
              (r) =>
                new Date(r.date)
                  .toISOString()
                  .startsWith(selectedMonth) &&
                r.milk
            ).length || 0;

          const milkCharge = milkDays * 8;

          const totalBill =
            foodBill +
            staffRatePerStudent +
            milkCharge;
          return {
            studentId: student._id,
            amount: Math.round(totalBill),

            days,
            foodBill: Math.round(foodBill),
            staffShare: Math.round(staffRatePerStudent),
            foodRatePerDay: Math.round(foodRatePerDay),

            milkDays,
            milkCharge
          };
        });
      const res = await fetch(`${API}/api/bill/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: selectedMonth,
          bills
        }),
      });
      if (!res.ok) throw new Error("Failed to send draft");
      const data = await res.json();
      setIsDrafted(true);
      setDraftedAt(data.draftedAt);
    } catch (err) {
      showToast("Error sending draft. Is the server running?", "error");
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  }

  // ─── PUBLISH BILL ──────────────────────────────────────────
  async function publishBill() {
    // Can only publish previous month's bill, not current month
    const currentMonthStr = `${nowY}-${String(nowM).padStart(2, "0")}`;
    if (selectedMonth === currentMonthStr) {
      showToast(
        `Cannot publish ${MONTHS[nowM - 1]} ${nowY} bill yet — wait until the month ends.`,
        "warning",
      );
      return;
    }
    const confirm = window.confirm(
      `Publish final mess bill for ${selectedMonth}?\n\n⚠️ Once published:\n• Expenses for this month will be frozen\n• Attendance for this month will be frozen\n• This cannot be undone`,
    );
    if (!confirm) return;

    setActionLoading(true);
    try {
      const bills = allStudents
        .filter(student => student.attendance?.some(r => r.date.startsWith(selectedMonth)))
        .map((student) => {
          const days = calculateAttendance(student);
          const foodBill = days * foodRatePerDay;

          const milkDays =
            student.attendance?.filter(
              (r) =>
                new Date(r.date)
                  .toISOString()
                  .startsWith(selectedMonth) &&
                r.milk
            ).length || 0;

          const milkCharge = milkDays * 8;

          const totalBill =
            foodBill +
            staffRatePerStudent +
            milkCharge;
          return {
            studentId: student._id,
            amount: Math.round(totalBill)
          };
        });

      const res = await fetch(`${API}/api/bill/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month: selectedMonth, bills }),
      });
      if (!res.ok) throw new Error("Failed to publish");
      const data = await res.json();
      setIsPublished(true);
      setPublishedAt(data.publishedAt);
    } catch (err) {
      showToast("Error publishing bill. Is the server running?", "error");
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  }

  // async function unpublishBill() {
  //   const confirm = window.confirm(
  //     `Unpublish ${selectedMonth} bill?`
  //   );

  //   if (!confirm) return;

  //   setActionLoading(true);

  //   try {
  //     const res = await fetch(`${API}/api/bill/unpublish`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         month: selectedMonth,
  //       }),
  //     });

  //     if (!res.ok) {
  //       throw new Error("Failed to unpublish");
  //     }

  //     setIsPublished(false);
  //     setPublishedAt(null);
  //     setIsDrafted(false);
  //     setDraftedAt(null);

  //     showToast("Bill unpublished successfully", "success");
  //   } catch (err) {
  //     console.error(err);
  //     showToast("Error unpublishing bill", "error");
  //   } finally {
  //     setActionLoading(false);
  //   }
  // }

  // // ─── REGENERATE DUES ───────────────────────────────────────
  // async function regenerateDues() {
  //   const confirm = window.confirm(
  //     `Regenerate mess dues for ${selectedMonth}?\n\n⚠️ This will delete existing unpaid mess dues for this month and recreate them based on current attendance and expense calculations.`
  //   );
  //   if (!confirm) return;

  //   setActionLoading(true);
  //   try {
  //     const bills = allStudents
  //       .filter(student => student.attendance?.some(r => r.date.startsWith(selectedMonth)))
  //       .map((student) => {
  //         const days = calculateAttendance(student);
  //         const foodBill = days * foodRatePerDay;
  //         const totalBill = foodBill + staffRatePerStudent;
  //         return {
  //           studentId: student._id,
  //           amount: Math.round(totalBill)
  //         };
  //       });

  //     const res = await fetch(`${API}/api/bill/regenerate-dues`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ month: selectedMonth, bills }),
  //     });
  //     if (!res.ok) throw new Error("Failed to regenerate dues");
  //     const data = await res.json();
  //     showToast(data.message, "success");
  //   } catch (err) {
  //     showToast("Error regenerating dues.", "error");
  //     console.error(err);
  //   } finally {
  //     setActionLoading(false);
  //   }
  // }

  // ─── FETCH ALL DATA ────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");



        const [studentsRes, expensesRes, balanceRes, billStatusRes] =
          await Promise.all([
            fetch(`${API}/api/students`),
            fetch(`${API}/api/expenses`),
            fetch(`${API}/api/balance/${selectedMonth}`),
            fetch(`${API}/api/bill/${selectedMonth}`),
          ]);

        if (!studentsRes.ok || !expensesRes.ok)
          throw new Error("Failed to fetch data");

        const studentsData = await studentsRes.json();
        const expensesData = await expensesRes.json();
        const balanceData = balanceRes.ok ? await balanceRes.json() : {};
        const billData = billStatusRes.ok ? await billStatusRes.json() : {};

        const hostelInmates = studentsData.filter(s => s.room && s.room.trim() !== "");
        setAllStudents(hostelInmates);
        setExpenses(expensesData);
        setBalance({
          prevBalance: balanceData?.prevBalance || 0,
          closingBalance: balanceData?.closingBalance || 0,
        });
        setIsDrafted(!!billData?.drafted);
        setIsPublished(!!billData?.published);
        setDraftedAt(billData?.draftedAt ?? null);
        setPublishedAt(billData?.publishedAt ?? null);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedMonth]);

  // ─── ATTENDANCE ALGORITHM ──────────────────────────────────
  function calculateAttendance(person) {
    const records = person.attendance || [];
    const month = selectedMonth;
    const [y, m] = month.split("-").map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();

    const todayStr = new Date().toISOString().split("T")[0];
    const [ty, tm, td] = todayStr.split("-").map(Number);
    const lastDay = y === ty && m === tm ? td : daysInMonth;

    const chains = [];
    let currentChain = null;

    for (let d = 1; d <= lastDay; d++) {
      const dateStr = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const rec = records.find(
        (r) => r.date?.slice(0, 10) === dateStr
      );

      if (!rec) {
        if (currentChain) { chains.push(currentChain); currentChain = null; }
        continue;
      }

      const present = rec.present;
      const messCut = rec.messCut;

      if (messCut) {
        if (!currentChain) currentChain = { days: [], hasAbsentCut: false };
        currentChain.days.push({ date: dateStr, present });
        if (!present) currentChain.hasAbsentCut = true;
      } else {
        if (currentChain) { chains.push(currentChain); currentChain = null; }
      }
    }
    if (currentChain) chains.push(currentChain);

    const skipped = new Set();
    for (const chain of chains) {
      if (chain.hasAbsentCut || chain.days.length >= 3) {
        chain.days.forEach((d) => skipped.add(d.date));
      }
    }

    let count = 0;
    for (let d = 1; d <= lastDay; d++) {
      const dateStr = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const rec = records.find(
        (r) => r.date?.slice(0, 10) === dateStr
      );
      if (
        rec &&
        rec.present &&
        !rec.messCut &&
        !skipped.has(dateStr)
      ) {
        count++;
      }
    }
    return count;
  }

  // ─── SPLIT EXPENSES ────────────────────────────────────────
  const monthlyAll = expenses.filter((exp) => exp.billMonth === selectedMonth);
  const foodExpenses = monthlyAll.filter((exp) => !exp.isStaff).reduce((sum, e) => sum + e.amount, 0);
  const staffExpenses = monthlyAll.filter((exp) => exp.isStaff).reduce((sum, e) => sum + e.amount, 0);

  const totalAttendance = allStudents.reduce((sum, s) => sum + calculateAttendance(s), 0);
  const totalStudents = allStudents.length;

  const netFoodAmount = foodExpenses + Number(balance.prevBalance || 0) - Number(balance.closingBalance || 0);
  const foodRatePerDay = totalAttendance > 0 ? netFoodAmount / totalAttendance : 0;
  const staffRatePerStudent = totalStudents > 0 ? staffExpenses / totalStudents : 0;

  // ─── DOWNLOAD PDF ──────────────────────────────────────────
  function downloadPDF() {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();   // 297 mm
    const pageH = doc.internal.pageSize.getHeight();  // 210 mm
    const margin = 14;
    const contentW = pageW - margin * 2;

    const monthLabel = PERIOD_OPTIONS.find((o) => o.value === selectedMonth)?.label || selectedMonth;
    const generatedOn = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

    // ── Header ──
    doc.setFillColor(30, 58, 138);
    doc.rect(0, 0, pageW, 28, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Mess Bill", margin, 13);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Period: ${monthLabel}`, margin, 22);
    doc.text(`Generated: ${generatedOn}`, pageW - margin, 22, { align: "right" });

    // ── Status badge ──
    doc.setTextColor(30, 58, 138);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    const status = isPublished ? "PUBLISHED" : isDrafted ? "DRAFT" : "PREVIEW";
    doc.text(`Status: ${status}`, margin, 37);

    // ── Summary box ──
    doc.setDrawColor(191, 219, 254);
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(margin, 42, contentW, 24, 3, 3, "FD");

    const summaryItems = [
      ["Food Expenses", `Rs.${foodExpenses.toFixed(2)}`],
      ["Staff Expenses", `Rs.${staffExpenses.toFixed(2)}`],
      ["Prev Balance", `Rs.${Number(balance.prevBalance).toFixed(2)}`],
      ["Closing Balance", `Rs.${Number(balance.closingBalance).toFixed(2)}`],
      ["Total Attendance", `${totalAttendance} days`],
      ["Food Rate/Day", `Rs.${foodRatePerDay.toFixed(2)}`],
      ["Staff/Student", `Rs.${staffRatePerStudent.toFixed(2)}`],
    ];

    const colW = contentW / summaryItems.length;
    summaryItems.forEach(([label, val], i) => {
      const x = margin + i * colW + colW / 2;
      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(label, x, 52, { align: "center" });
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.text(val, x, 61, { align: "center" });
    });

    // ── Student table ──
    const rows = allStudents.map((student) => {
      const days = calculateAttendance(student);
      const foodBill = days * foodRatePerDay;
      const milkDays =
        student.attendance?.filter(
          (r) =>
            new Date(r.date).toISOString().startsWith(selectedMonth) && r.milk
        ).length || 0;
      const milkCharge = milkDays * 8;
      const totalBill = foodBill + staffRatePerStudent + milkCharge;
      return [
        student.room,
        student.name,
        String(days),
        `Rs.${foodBill.toFixed(2)}`,
        String(milkDays),
        `Rs.${milkCharge.toFixed(2)}`,
        `Rs.${staffRatePerStudent.toFixed(2)}`,
        `Rs.${totalBill.toFixed(2)}`,
      ];
    });

    autoTable(doc, {
      startY: 82,
      head: [["Room", "Student", "Attendance", "Food Bill", "Milk Days", "Milk Charge", "Staff Share", "Total Bill"]],
      body: rows,
      styles: {
        fontSize: 9,
        cellPadding: {
          top: 3,
          right: 3,
          bottom: 3,
          left: 5,
        },
        font: "helvetica",
        overflow: "linebreak",
        valign: "middle",
      },
      headStyles: {
        fillColor: [30, 58, 138],
        textColor: 255,
        fontStyle: "bold",
        halign: "center",
        fontSize: 9.5,
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 22 },
        1: { cellWidth: 62, halign: "left" },          // was 70
        2: { halign: "center", cellWidth: 28 },
        3: { halign: "right", cellWidth: 32 },
        4: { halign: "center", cellWidth: 24 },
        5: { halign: "right", cellWidth: 30 },
        6: { halign: "right", cellWidth: 35 },
        7: { halign: "right", cellWidth: 36, fontStyle: "bold" }, // Total Bill
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      tableLineColor: [226, 232, 240],
      tableLineWidth: 0.3,
      margin: { left: margin, right: margin },
    });

    // ── Footer ──
    doc.setFillColor(248, 250, 252);
    doc.rect(0, pageH - 12, pageW, 12, "F");
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Generated by Mess Management System", pageW / 2, pageH - 4, { align: "center" });

    doc.save(`MessBill_${selectedMonth}.pdf`);
  }

  // ─── PERIOD PICKER ─────────────────────────────────────────
  const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const nowM = new Date().getMonth() + 1;
  const nowY = new Date().getFullYear();
  const prevM = nowM === 1 ? 12 : nowM - 1;
  const prevY = nowM === 1 ? nowY - 1 : nowY;

  const PERIOD_OPTIONS = [
    { label: `${MONTHS[prevM - 1]} ${prevY}`, value: `${prevY}-${String(prevM).padStart(2, "0")}` },
    { label: `${MONTHS[nowM - 1]} ${nowY}`, value: `${nowY}-${String(nowM).padStart(2, "0")}` },
  ];

  return (
    <Layout>
      <div className="expenses-container" style={{ paddingBottom: "80px" }}>

        {/* HEADER ROW */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: "16px", flexWrap: "wrap", gap: "10px",
        }}>
          <h2 style={{ margin: 0 }}>Mess Bill</h2>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>

            {/* Status badges */}
            {isDrafted && !isPublished && (
              <div style={{
                background: "#fef9c3", color: "#854d0e",
                border: "1px solid #fde047", borderRadius: "8px",
                padding: "6px 12px", fontSize: "12px", fontWeight: "600",
              }}>
                📋 Draft sent {draftedAt ? `on ${new Date(draftedAt).toLocaleDateString()}` : ""}
              </div>
            )}
            {isPublished && (
              <div style={{
                background: "#dcfce7", color: "#16a34a",
                border: "1px solid #86efac", borderRadius: "8px",
                padding: "6px 12px", fontSize: "12px", fontWeight: "600",
              }}>
                ✓ Published {publishedAt ? `on ${new Date(publishedAt).toLocaleDateString()}` : ""}
              </div>
            )}

            {/* Download PDF button */}
            <button
              onClick={downloadPDF}
              disabled={loading || allStudents.length === 0}
              style={{
                background: "linear-gradient(135deg, #10b981, #059669)",
                color: "white", border: "none", padding: "9px 18px",
                borderRadius: "8px", cursor: loading || allStudents.length === 0 ? "not-allowed" : "pointer",
                fontWeight: "700", fontSize: "13px",
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: "0 2px 8px rgba(16,185,129,0.35)",
                whiteSpace: "nowrap",
                opacity: loading || allStudents.length === 0 ? 0.5 : 1,
                display: "flex", alignItems: "center", gap: "6px",
              }}
            >
              ⬇ Download PDF
            </button>

            {/* Draft / Publish action button */}

            {!isPublished && (
              <button
                onClick={sendDraft}
                disabled={actionLoading || loading}
                style={
                  isDrafted
                    ? btnStyle("#0ea5e9", "#0284c7")
                    : btnStyle("#3b82f6", "#2563eb")
                }
              >
                {actionLoading
                  ? (isDrafted ? "Updating..." : "Sending...")
                  : (isDrafted ? "🔄 Resend Draft" : "📋 Send Draft")}
              </button>
            )}

            {isDrafted && !isPublished && (() => {
              const currentMonthStr =
                `${nowY}-${String(nowM).padStart(2, "0")}`;

              const isCurrentMonth =
                selectedMonth === currentMonthStr;

              return (
                <button
                  onClick={publishBill}
                  disabled={
                    actionLoading ||
                    loading ||
                    isCurrentMonth
                  }
                  title={
                    isCurrentMonth
                      ? `Cannot publish current month's bill`
                      : ""
                  }
                  style={{
                    ...btnStyle("#f59e0b", "#d97706"),
                    opacity: isCurrentMonth ? 0.45 : 1,
                    cursor: isCurrentMonth
                      ? "not-allowed"
                      : "pointer",
                  }}
                >
                  {actionLoading
                    ? "Publishing..."
                    : "📢 Publish Bill"}
                </button>
              );
            })()}
            {/* {isPublished && (
              <button
                onClick={unpublishBill}
                disabled={actionLoading || loading}
                style={btnStyle("#ef4444", "#dc2626")}
              >
                {actionLoading ? "Processing..." : "↩ Unpublish Bill"}
              </button>
            )} */}
            {/* {isPublished && (
              <button
                onClick={regenerateDues}
                disabled={actionLoading || loading}
                title="Re-calculate and re-create dues for this month"
                style={btnStyle("#ef4444", "#b91c1c")}
              >
                {actionLoading ? "Processing..." : "🔄 Regenerate Dues"}
              </button>
            )} */}
          </div>
        </div>

        {/* Period picker */}
        <div style={{ marginBottom: "15px", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <label><b>Month :</b></label>
          <ModernSelect
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            options={PERIOD_OPTIONS}
            style={{ minWidth: "160px" }}
          />
        </div>

        {/* Info — current month cannot be published */}
        {(() => {
          const currentMonthStr = `${nowY}-${String(nowM).padStart(2, "0")}`;
          return selectedMonth === currentMonthStr && isDrafted && !isPublished ? (
            <div style={{
              background: "#eff6ff", border: "1px solid #bfdbfe",
              color: "#1e40af", padding: "10px 16px", borderRadius: "8px",
              marginBottom: "14px", fontSize: "13px",
            }}>
              ℹ️ <b>{MONTHS[nowM - 1]} {nowY}</b> bill cannot be published until the month ends. Switch to <b>{MONTHS[prevM - 1]} {prevY}</b> to publish.
            </div>
          ) : null;
        })()}

        {/* TOAST */}
        {toast && <AlertToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        {error && (
          <div style={{
            color: "#dc2626", background: "#fee2e2",
            padding: "10px 14px", borderRadius: "8px",
            marginBottom: "14px", fontSize: "13px",
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Student bill table */}
        <div className="table-responsive" style={{ maxHeight: "calc(100vh - 280px)", overflowY: "auto" }}>
          <table className="expense-table">
            <thead>
              <tr>
                <th>Room</th>
                <th>Student</th>
                <th>Attendance Days</th>
                <th>Food Bill</th>
                <th>Rate/Day</th>
                <th>Milk</th>
                <th>Milk Charge</th>
                <th>Staff Share</th>
                <th>Total Bill</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="9" style={{ textAlign: "center", padding: "20px" }}>Loading...</td></tr>
              ) : allStudents.length === 0 ? (
                <tr><td colSpan="9" style={{ textAlign: "center", padding: "20px" }}>No students found.</td></tr>
              ) : (
                allStudents.map((student) => {
                  const days = calculateAttendance(student);
                  const foodBill = days * foodRatePerDay;

                  const milkDays =
                    student.attendance?.filter(
                      (r) =>
                        new Date(r.date)
                          .toISOString()
                          .startsWith(selectedMonth) &&
                        r.milk &&
                        r.present &&
                        !r.messCut
                    ).length || 0;

                  const milkCharge = milkDays * 8;

                  const totalBill =
                    foodBill +
                    staffRatePerStudent +
                    milkCharge;
                  return (
                    <tr key={student._id}>
                      <td>{student.room}</td>
                      <td>{student.name}</td>
                      <td>{days}</td>
                      <td>₹{foodBill.toFixed(2)}</td>
                      <td>₹{foodRatePerDay.toFixed(2)}</td>

                      <td>{milkDays}</td>

                      <td>₹{milkCharge.toFixed(2)}</td>

                      <td>₹{staffRatePerStudent.toFixed(2)}</td>

                      <td>
                        <b>₹{totalBill.toFixed(2)}</b>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FIXED SUMMARY BAR */}
      <div className="summary-card">
        {[0, 1].map((i) => (
          <div key={i} className="summary-card-track">
            {/*<div>Food: ₹{foodExpenses.toFixed(2)}</div>*/}
            <div>Staff: ₹{staffExpenses.toFixed(2)}</div>
            <div>Attendance: {totalAttendance} days</div>
            <div>Food Rate/Day: ₹{foodRatePerDay.toFixed(2)}</div>
            <div>Staff salary/Student: ₹{staffRatePerStudent.toFixed(2)}</div>
          </div>
        ))}
      </div>
    </Layout>
  );
}

// ─── BUTTON STYLE HELPER ───────────────────────────────────
function btnStyle(from, to) {
  return {
    background: `linear-gradient(135deg, ${from}, ${to})`,
    color: "white", border: "none", padding: "9px 22px",
    borderRadius: "8px", cursor: "pointer", fontWeight: "700",
    fontSize: "13px", fontFamily: "'DM Sans', sans-serif",
    boxShadow: `0 2px 8px ${from}55`, whiteSpace: "nowrap",
  };
}