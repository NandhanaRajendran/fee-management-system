import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/hostel.css";

function ViewRent() {
  const navigate = useNavigate();

  const [students] = useState([
    { id: "S101", name: "Anu", month: "March", rent: 4500, status: "Pending" },
    { id: "S102", name: "Rahul", month: "March", rent: 4500, status: "Pending" },
    { id: "S103", name: "Meera", month: "March", rent: 4500, status: "Paid" },
  ]);

  const downloadCSV = () => {
    const headers = ["ID", "Name", "Month", "Amount", "Status"];

    const rows = students.map((s) => [
      s.id,
      s.name,
      s.month,
      s.rent,
      s.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((row) => row.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);

    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "rent_dues.csv");

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="hostelPage">
      <div className="formPage">
        <div className="formCard" style={{ width: "650px" }}>
          <div className="formHeader">
            <button
              className="backBtn"
              onClick={() => navigate("/hostel/dashboard")}
            >
              ← Back
            </button>

            <h2>View Rent Due</h2>
          </div>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Month</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {students.map((student, index) => (
                <tr key={index}>
                  <td>{student.id}</td>
                  <td>{student.name}</td>
                  <td>{student.month}</td>
                  <td>₹{student.rent}</td>

                  <td><span className="due">{student.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>

          <button className="submitBtn" onClick={downloadCSV}>
            Download
          </button>
        </div>
      </div>
    </div>
  );
}

export default ViewRent;