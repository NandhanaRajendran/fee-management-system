import { createContext, useContext, useState } from "react";

const FacultyContext = createContext(null);

/*
  Role rules:
  - "HOD"     → set explicitly, never changes, never becomes Staff Advisor
  - "Faculty" → default for everyone added via Staff page
  - "Staff Advisor" → NOT stored; it is DERIVED at render time:
      if f.assignedClass is set AND f.role !== "HOD"  →  display role as "Staff Advisor"

  assignedClass stores "DeptName-Semester", e.g. "Computer Science-S1"
*/

const initialFaculty = [
  {
    id: 1,
    name: "Dr. Rajesh Kumar",
    department: "Computer Science",
    role: "HOD",               // HODs are fixed
    assignedClass: null,
    email: "rajesh.kumar@college.edu",
    phone: "+91 98765 43210",
    username: "hod_cs",
    password: "hod@cs123",
  },
  {
    id: 2,
    name: "Prof. Meena Shah",
    department: "Computer Science",
    role: "Faculty",           // starts as Faculty, becomes Staff Advisor when assigned
    assignedClass: null,
    email: "meena.shah@college.edu",
    phone: "+91 98765 43211",
    username: "faculty_meena",
    password: "fac@meena123",
  },
  {
    id: 3,
    name: "Prof. Suresh Rao",
    department: "Computer Science",
    role: "Faculty",
    assignedClass: null,
    email: "suresh.rao@college.edu",
    phone: "+91 98765 43212",
    username: "faculty_suresh",
    password: "fac@suresh123",
  },
  {
    id: 4,
    name: "Dr. Priya Desai",
    department: "Electrical Engineering",
    role: "HOD",
    assignedClass: null,
    email: "priya.desai@college.edu",
    phone: "+91 98765 43213",
    username: "hod_ee",
    password: "hod@ee123",
  },
  {
    id: 5,
    name: "Prof. Anand Nair",
    department: "Electrical Engineering",
    role: "Faculty",
    assignedClass: null,
    email: "anand.nair@college.edu",
    phone: "+91 98765 43214",
    username: "faculty_anand",
    password: "fac@anand123",
  },
];

export function FacultyProvider({ children }) {
  const [faculty, setFaculty] = useState(initialFaculty);

  /* Derive the display role — call this wherever you render role */
  const displayRole = (f) => {
    if (f.role === "HOD") return "HOD";
    if (f.assignedClass)  return "Staff Advisor";
    return "Faculty";
  };

  const addFaculty = (member) => {
    const newMember = {
      id: Date.now(),
      name: member.name,
      department: member.department,
      email: member.email || "",
      phone: member.phone || "",
      role: "Faculty",          // always starts as Faculty
      assignedClass: null,
      username: member.name.toLowerCase().replace(/\s+/g, "_"),
      password: "default123",
    };
    setFaculty((prev) => [...prev, newMember]);
  };

  const deleteFaculty = (id) => {
    setFaculty((prev) => prev.filter((f) => f.id !== id));
  };

  /*
    Called by Departments when assigning or unassigning an advisor slot.
    assignedClass: "DeptName-Semester"  |  null (to unassign)
  */
  const setFacultyAssignment = (facultyId, assignedClass) => {
    setFaculty((prev) =>
      prev.map((f) =>
        f.id === facultyId ? { ...f, assignedClass } : f
      )
    );
  };

  return (
    <FacultyContext.Provider
      value={{ faculty, displayRole, addFaculty, deleteFaculty, setFacultyAssignment }}
    >
      {children}
    </FacultyContext.Provider>
  );
}

export function useFaculty() {
  return useContext(FacultyContext);
}