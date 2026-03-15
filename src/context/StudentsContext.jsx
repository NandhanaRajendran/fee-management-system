import { createContext, useContext, useState } from "react";

const StudentsContext = createContext(null);

const initialStudents = [
  { id: 1, name: "Aarav Sharma",  admission: "4001", department: "Computer Science",       batch: "2023", class: "S5" },
  { id: 2, name: "Diya Patel",    admission: "4936", department: "EEE",                    batch: "2024", class: "S3" },
];

export function StudentsProvider({ children }) {
  const [students, setStudents] = useState(initialStudents);

  const addStudent = (student) => {
    setStudents((prev) => [...prev, { id: Date.now() + Math.random(), ...student }]);
  };

  // Bulk add — skips duplicates by admission number
  const bulkAddStudents = (incoming) => {
    setStudents((prev) => {
      const existingAdmissions = new Set(prev.map((s) => s.admission.toLowerCase()));
      const fresh = incoming.filter(
        (s) => s.admission && !existingAdmissions.has(s.admission.toLowerCase())
      );
      return [
        ...prev,
        ...fresh.map((s, i) => ({ id: Date.now() + i, ...s })),
      ];
    });
  };

  const deleteStudent = (id) =>
    setStudents((prev) => prev.filter((s) => s.id !== id));

  return (
    <StudentsContext.Provider value={{ students, addStudent, bulkAddStudents, deleteStudent, setStudents }}>
      {children}
    </StudentsContext.Provider>
  );
}

export function useStudents() {
  return useContext(StudentsContext);
}