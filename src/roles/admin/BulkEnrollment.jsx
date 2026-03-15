import { useState, useRef } from "react";
import { Download, Upload, FileSpreadsheet, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import * as XLSX from "xlsx";
import "../../styles/admin.css";
import { useStudents } from "../../context/StudentsContext";

/*
  Expected Excel columns (case-insensitive, order doesn't matter):
  Name | Admission Number | Department | Batch | Class
*/

const REQUIRED_FIELDS = ["name", "admission number", "department", "batch", "class"];

const normalizeKey = (key) => key?.toString().trim().toLowerCase();

// Map a raw row object (keys = header names) to our student shape
const mapRow = (raw) => {
  const get = (label) => {
    const key = Object.keys(raw).find((k) => normalizeKey(k) === label);
    return key ? raw[key]?.toString().trim() : "";
  };
  return {
    name:       get("name"),
    admission:  get("admission number"),
    department: get("department"),
    batch:      get("batch"),
    class:      get("class"),
  };
};

// Validate a mapped row — returns array of error messages
const validateRow = (row) => {
  const errors = [];
  if (!row.name)       errors.push("Name missing");
  if (!row.admission)  errors.push("Admission number missing");
  if (!row.department) errors.push("Department missing");
  if (!row.batch)      errors.push("Batch missing");
  if (!row.class)      errors.push("Class missing");
  return errors;
};

const SAMPLE_ROWS = [
  ["Name", "Admission Number", "Department", "Batch", "Class"],
  ["Arjun Nair",   "5001", "Computer Science",       "2025", "S1"],
  ["Priya Menon",  "5002", "Electrical Engineering", "2025", "S1"],
  ["Rahul Verma",  "5003", "Robotics",               "2025", "S1"],
];

export default function BulkEnrollment() {

  const { students, bulkAddStudents } = useStudents();

  const [dragOver, setDragOver] = useState(false);
  const [file, setFile]         = useState(null);
  const [preview, setPreview]   = useState(null); // { rows: [...] }
  const [imported, setImported] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const fileInputRef = useRef(null);

  /* ── parse Excel with SheetJS ── */
  const parseExcel = (f) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data     = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet    = workbook.Sheets[workbook.SheetNames[0]];
        const rawRows  = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        if (rawRows.length === 0) {
          alert("The Excel file appears to be empty or has no data rows.");
          return;
        }

        // Check that required columns exist
        const headers = Object.keys(rawRows[0]).map(normalizeKey);
        const missing = REQUIRED_FIELDS.filter((f) => !headers.includes(f));
        if (missing.length > 0) {
          alert(`Missing columns: ${missing.join(", ")}\n\nExpected: Name, Admission Number, Department, Batch, Class`);
          return;
        }

        const existingAdmissions = new Set(students.map((s) => s.admission.toLowerCase()));

        const rows = rawRows.map((raw, idx) => {
          const mapped = mapRow(raw);
          const errors = validateRow(mapped);

          // Also flag duplicates against existing students
          if (mapped.admission && existingAdmissions.has(mapped.admission.toLowerCase())) {
            errors.push("Admission number already exists");
          }

          return {
            ...mapped,
            _rowIndex: idx + 2, // Excel row number (1 = header, so data starts at 2)
            status: errors.length === 0 ? "valid" : "error",
            errors,
          };
        });

        setPreview({ rows });
        setImported(false);
      } catch (err) {
        alert("Failed to read file. Please make sure it's a valid .xlsx or .xls file.");
        console.error(err);
      }
    };
    reader.readAsArrayBuffer(f);
  };

  /* ── file selection ── */
  const handleFile = (f) => {
    if (!f) return;
    if (!f.name.match(/\.(xlsx|xls)$/i)) {
      alert("Please upload a valid Excel file (.xlsx or .xls)");
      return;
    }
    setFile(f);
    parseExcel(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleBrowse = (e) => handleFile(e.target.files[0]);

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    setImported(false);
    setImportedCount(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ── import valid rows into Students context ── */
  const validRows = preview?.rows.filter((r) => r.status === "valid") ?? [];
  const errorRows = preview?.rows.filter((r) => r.status === "error") ?? [];

  const handleImport = () => {
    if (validRows.length === 0) { alert("No valid rows to import"); return; }
    bulkAddStudents(validRows);
    setImportedCount(validRows.length);
    setImported(true);
  };

  /* ── download sample template ── */
  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet(SAMPLE_ROWS);
    ws["!cols"] = [{ wch: 20 }, { wch: 18 }, { wch: 25 }, { wch: 8 }, { wch: 8 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "bulk_enrollment_template.xlsx");
  };

  return (
    <div className="bulk-page">

      {/* HEADER */}
      <div className="students-header">
        <div>
          <h1>Bulk Student Enrollment</h1>
          <p>Upload student data via Excel file for bulk enrollment</p>
        </div>
      </div>

      {/* INSTRUCTIONS */}
      <div className="bulk-instructions">
        <h3>Instructions</h3>
        <ol className="bulk-steps">
          <li>Download the Excel template below</li>
          <li>Fill in student details (Name, Admission Number, Department, Batch, Class)</li>
          <li>Upload the completed Excel file</li>
          <li>Review the preview and click Import Students</li>
        </ol>
        <button className="bulk-download-btn" onClick={handleDownloadTemplate}>
          <Download size={16} />
          Download Sample Template
        </button>
      </div>

      {/* UPLOAD ZONE */}
      <div className="bulk-section">
        <h3 className="bulk-section-title">Upload Excel File</h3>

        {!file ? (
          <div
            className={`bulk-dropzone${dragOver ? " drag-over" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="bulk-drop-icon">
              <Upload size={28} color="#94a3b8" />
            </div>
            <p className="bulk-drop-title">Drop your Excel file here</p>
            <p className="bulk-drop-sub">or click to browse (.xlsx, .xls)</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              style={{ display: "none" }}
              onChange={handleBrowse}
            />
          </div>
        ) : (
          <div className="bulk-file-info">
            <div className="bulk-file-left">
              <FileSpreadsheet size={22} color="#16a34a" />
              <div>
                <p className="bulk-file-name">{file.name}</p>
                <p className="bulk-file-size">{(file.size / 1024).toFixed(1)} KB · {preview?.rows.length ?? 0} rows detected</p>
              </div>
            </div>
            <button className="bulk-remove-btn" onClick={handleRemoveFile}>
              <Trash2 size={15} /> Remove
            </button>
          </div>
        )}
      </div>

      {/* PREVIEW TABLE */}
      {preview && !imported && (
        <div className="bulk-section">
          <div className="bulk-preview-header">
            <h3 className="bulk-section-title">Preview</h3>
            <div className="bulk-preview-counts">
              <span className="bulk-count valid">
                <CheckCircle2 size={14} /> {validRows.length} valid
              </span>
              {errorRows.length > 0 && (
                <span className="bulk-count error">
                  <XCircle size={14} /> {errorRows.length} error{errorRows.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>

          <div className="students-table-wrapper">
            <table className="students-table">
              <thead>
                <tr>
                  <th>ROW</th>
                  <th>NAME</th>
                  <th>ADMISSION NO.</th>
                  <th>DEPARTMENT</th>
                  <th>BATCH</th>
                  <th>CLASS</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((row, i) => (
                  <tr key={i} className={row.status === "error" ? "bulk-row-error" : ""}>
                    <td style={{ color: "#94a3b8", fontSize: "12px" }}>{row._rowIndex}</td>
                    <td>{row.name || <span className="bulk-missing">—</span>}</td>
                    <td>{row.admission || <span className="bulk-missing">Missing</span>}</td>
                    <td>{row.department || <span className="bulk-missing">Missing</span>}</td>
                    <td>{row.batch || <span className="bulk-missing">Missing</span>}</td>
                    <td>{row.class || <span className="bulk-missing">Missing</span>}</td>
                    <td>
                      {row.status === "valid" ? (
                        <span className="status active">Valid</span>
                      ) : (
                        <span
                          className="status bulk-error-badge"
                          title={row.errors.join(", ")}
                        >
                          Error
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {errorRows.length > 0 && (
            <div className="bulk-error-detail">
              <p className="bulk-error-detail-title">
                <XCircle size={13} /> Issues found — these rows will be skipped:
              </p>
              <ul>
                {errorRows.map((r, i) => (
                  <li key={i}>
                    Row {r._rowIndex}: {r.errors.join(", ")}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="bulk-import-footer">
            <button
              className="submit-btn bulk-import-btn"
              onClick={handleImport}
              disabled={validRows.length === 0}
            >
              <Upload size={15} />
              Import {validRows.length} Student{validRows.length !== 1 ? "s" : ""}
            </button>
          </div>
        </div>
      )}

      {/* SUCCESS STATE */}
      {imported && (
        <div className="bulk-success">
          <CheckCircle2 size={44} color="#16a34a" />
          <h3>Import Successful!</h3>
          <p>
            {importedCount} student{importedCount !== 1 ? "s" : ""} have been added to the system.
            {errorRows.length > 0 && ` ${errorRows.length} row${errorRows.length > 1 ? "s" : ""} were skipped due to errors.`}
          </p>
          <button className="add-student-btn" onClick={handleRemoveFile}>
            Upload Another File
          </button>
        </div>
      )}

    </div>
  );
}