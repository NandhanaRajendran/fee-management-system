import { HOSTEL_SEQ } from "./constants";

export function buildMonthPills(fees) {
  const monthSet = new Set(fees.map(f => f.month));
  const months = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec",
  ];
  // Only parse months that follow the "Mon YYYY" format
  const years = [...new Set(
    fees.map(f => f.month).filter(m => m && m.includes(" ")).map(m => m.split(" ")[1])
  )].sort();
  if (years.length === 0) {
    // Fallback: show just the raw unique months found
    const pills = [{ label: "All", val: "all" }];
    [...monthSet].forEach(m => { if(m) pills.push({ label: m, val: m }); });
    return pills;
  }
  const pills = [{ label: "All", val: "all" }];
  years.forEach(yr => {
    months.forEach(mo => {
      const val = `${mo} ${yr}`;
      if (monthSet.has(val)) {
        pills.push({ label: val, val });
      } else {
        pills.push({ label: val, val, empty: true });
      }
    });
  });
  return pills;
}

export function resolveStatus(f) {
  if (f.status === "paid") return "paid";
  if (f.status === "pending_verification") return "pending_verification";
  if (f.status === "overdue") return "overdue";
  // If dueDate parsing is available, check it
  if (f.due) {
    const parts = f.due.split("/");
    if (parts.length === 3) {
      const dueDate = new Date(+parts[2], +parts[1] - 1, +parts[0]);
      if (Date.now() > dueDate.getTime()) return "overdue";
    }
  }
  return f.status || "notpaid";
}

export function genAttendance(year, month) {
  const days = new Date(year, month + 1, 0).getDate();
  const data = {};
  for (let d = 1; d <= days; d++) {
    data[d] = HOSTEL_SEQ[(d + month * 7 + year) % HOSTEL_SEQ.length];
  }
  return data;
}

export function fmtCurrency(n) { 
  return `₹${n.toLocaleString("en-IN")}`; 
}
