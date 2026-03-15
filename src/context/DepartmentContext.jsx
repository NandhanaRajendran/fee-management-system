import { createContext, useContext, useState } from "react";

const DepartmentContext = createContext(null);

const initialDepartments = [
  {
    id: 1,
    name: "Computer Science",
    hod: "Dr. Rajesh Kumar",
    students: 245,
    username: "hod_cs",
    password: "hod@cs123",
    activeClasses: ["S1", "S3", "S5", "S7"],
    advisors: { S1: null, S3: null, S5: null, S7: null },
  },
  {
    id: 2,
    name: "Electrical Engineering",
    hod: "Dr. Priya Desai",
    students: 198,
    username: "hod_ee",
    password: "hod@ee123",
    activeClasses: ["S1", "S3"],
    advisors: { S1: null, S3: null },
  },
  {
    id: 3,
    name: "Robotics",
    hod: "Dr. Vikram Singh",
    students: 60,
    username: "hod_rb",
    password: "hod@rb123",
    activeClasses: ["S1"],
    advisors: { S1: null },
  },
];

export function DepartmentProvider({ children }) {
  const [departments, setDepartments] = useState(initialDepartments);

  const addDepartment = (dept) => {
    const slug = dept.name.toLowerCase().replace(/\s/g, "");
    const newDept = {
      id: Date.now(),
      name: dept.name,
      hod: dept.hod,
      students: 0,
      username: `hod_${slug}`,
      password: `hod@${slug}123`,
      activeClasses: ["S1"],
      advisors: { S1: null },
    };
    setDepartments((prev) => [...prev, newDept]);
  };

  const deleteDepartment = (id) => {
    setDepartments((prev) => prev.filter((d) => d.id !== id));
  };

  const updateDepartment = (updated) => {
    setDepartments((prev) =>
      prev.map((d) => (d.id === updated.id ? updated : d))
    );
  };

  return (
    <DepartmentContext.Provider
      value={{ departments, addDepartment, deleteDepartment, updateDepartment, setDepartments }}
    >
      {children}
    </DepartmentContext.Provider>
  );
}

export function useDepartments() {
  return useContext(DepartmentContext);
}