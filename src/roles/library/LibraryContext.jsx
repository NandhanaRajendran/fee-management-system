import { createContext, useContext, useState } from "react";

const LibraryContext = createContext(null);

export const FINE_RATE = 1;
export const DUE_DAYS  = 30;

export function getDaysSinceTaken(takenDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const taken = new Date(takenDate);
  taken.setHours(0, 0, 0, 0);
  return Math.floor((today - taken) / (1000 * 60 * 60 * 24));
}

export function getDaysOverdue(takenDate) {
  const elapsed = getDaysSinceTaken(takenDate);
  return elapsed > DUE_DAYS ? elapsed - DUE_DAYS : 0;
}

export function calculateFine(takenDate) {
  return getDaysOverdue(takenDate) * FINE_RATE;
}

export function isOverdue(record) {
  return !record.returned && getDaysOverdue(record.date) > 0;
}

export function LibraryProvider({ children }) {
  const [records, setRecords] = useState([]);

  function addRecord(record) {
    setRecords((prev) => [
      ...prev,
      { id: Date.now(), ...record, returned: false, returnedDate: null },
    ]);
  }

  function markReturned(id) {
    const today = new Date().toISOString().split("T")[0];
    setRecords((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, returned: true, returnedDate: today } : r
      )
    );
  }

  return (
    <LibraryContext.Provider value={{ records, addRecord, markReturned }}>
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used inside LibraryProvider");
  return ctx;
}