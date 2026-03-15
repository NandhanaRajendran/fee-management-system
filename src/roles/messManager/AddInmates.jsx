import { useState, useRef } from "react";
import Layout from "../../components/Layout";
import "../../styles/mess.css";

const VALID_ROOMS = [
  "1101","1102","1103","1104","1105",
  "1106","1107","1108","1109","1110",
  "1111","1112","1113","1114",
];

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return null;

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const nameIdx = headers.findIndex((h) => h === "name");
  const roomIdx = headers.findIndex((h) => h === "room");
  if (nameIdx === -1 || roomIdx === -1) return null;

  const valid = [];
  const rejected = [];

  lines.slice(1).forEach((line, i) => {
    const cols = line.split(",").map((c) => c.trim());
    const name = cols[nameIdx] || "";
    const room = cols[roomIdx] || "";
    if (!name && !room) return;
    if (!VALID_ROOMS.includes(room)) {
      rejected.push({ row: i + 2, name: name || "(blank)", room: room || "(blank)" });
    } else if (name) {
      valid.push({ name, room });
    }
  });

  return { valid, rejected };
}

export default function AddInmates() {
  const [tab, setTab] = useState("manual");
  const [inmates, setInmates] = useState([]);

  const [manualName, setManualName] = useState("");
  const [manualRoom, setManualRoom] = useState("");
  const [manualMsg, setManualMsg] = useState(null);

  const fileRef = useRef(null);
  const [preview, setPreview] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [parseError, setParseError] = useState("");
  const [bulkMsg, setBulkMsg] = useState(null);

  function handleManualSubmit(e) {
    e.preventDefault();
    const name = manualName.trim();
    const room = manualRoom;
    if (!name || !room) return;
    setInmates((prev) => [...prev, { id: Date.now(), name, room }]);
    setManualMsg({ ok: true, text: `✅ "${name}" added to Room ${room}.` });
    setManualName("");
    setManualRoom("");
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    setParseError(""); setPreview([]); setRejected([]); setBulkMsg(null);
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setParseError("Only .csv files are supported. Export your Excel sheet as CSV first.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = parseCSV(ev.target.result);
      if (!result) { setParseError('CSV must have "name" and "room" as header columns.'); return; }
      if (result.valid.length === 0 && result.rejected.length === 0) { setParseError("No data rows found."); return; }
      setPreview(result.valid);
      setRejected(result.rejected);
    };
    reader.readAsText(file);
  }

  function handleBulkConfirm() {
    if (!preview.length) return;
    setInmates((prev) => [...prev, ...preview.map((p, i) => ({ id: Date.now() + i, ...p }))]);
    setBulkMsg({ ok: true, text: `✅ ${preview.length} inmate${preview.length !== 1 ? "s" : ""} added.` });
    setPreview([]); setRejected([]);
    if (fileRef.current) fileRef.current.value = "";
  }

  function removeInmate(id) {
    setInmates((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <Layout>
      <div className="attendance-container">
        <h2>Add Inmates</h2>
        <p className="session-note">ℹ️ Inmates added here are stored for this session only.</p>

        <div className="ai-tabs">
          <button onClick={() => setTab("manual")} className={tab === "manual" ? "ai-tab active" : "ai-tab"}>✏️ Manual Entry</button>
          <button onClick={() => setTab("bulk")} className={tab === "bulk" ? "ai-tab active" : "ai-tab"}>📂 Bulk Upload (CSV)</button>
        </div>

        {tab === "manual" && (
          <div className="ai-form-wrap">
            <form onSubmit={handleManualSubmit}>
              <div className="ai-field">
                <label>Full Name</label>
                <input type="text" placeholder="e.g. Arun Kumar" value={manualName}
                  onChange={(e) => { setManualName(e.target.value); setManualMsg(null); }} required />
              </div>
              <div className="ai-field">
                <label>Room Number</label>
                <select value={manualRoom} onChange={(e) => { setManualRoom(e.target.value); setManualMsg(null); }} required>
                  <option value="">— Select a room —</option>
                  {VALID_ROOMS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <button type="submit" className="ai-btn-primary">Add Inmate</button>
            </form>
            {manualMsg && <div className={manualMsg.ok ? "ai-msg success" : "ai-msg error"}>{manualMsg.text}</div>}
          </div>
        )}

        {tab === "bulk" && (
          <div>
            <div className="ai-info-card">
              <p><b>📋 How to use bulk upload</b></p>
              <ol>
                <li>Create a spreadsheet with two columns: <b>name</b> and <b>room</b>.</li>
                <li>Room must be one of <b>1101 – 1114</b>. Other values will be rejected.</li>
                <li>Save / Export as <b>.csv</b>, then upload below.</li>
              </ol>
              <p className="ai-example">Example: <code>name,room</code> → <code>Arun Kumar,1101</code></p>
            </div>

            <div className="ai-field">
              <label>Upload CSV File</label>
              <input ref={fileRef} type="file" accept=".csv" onChange={handleFileChange} />
            </div>

            {parseError && <div className="ai-msg error">{parseError}</div>}

            {rejected.length > 0 && (
              <div className="ai-msg error">
                <b>⚠️ {rejected.length} row{rejected.length !== 1 ? "s" : ""} skipped</b> — invalid room (must be 1101–1114):
                <ul>
                  {rejected.map((r, i) => <li key={i}>Row {r.row}: <b>{r.name}</b> → Room <b>"{r.room}"</b></li>)}
                </ul>
              </div>
            )}

            {preview.length > 0 && (
              <div className="ai-preview">
                <p><b>✅ {preview.length} valid inmate{preview.length !== 1 ? "s" : ""} ready to add</b></p>
                <div className="ai-table-scroll">
                  <table className="attendance-table">
                    <thead><tr><th>#</th><th>Name</th><th>Room</th></tr></thead>
                    <tbody>
                      {preview.map((row, i) => (
                        <tr key={i}><td>{i + 1}</td><td>{row.name}</td><td>{row.room}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button onClick={handleBulkConfirm} className="ai-btn-primary">
                  Confirm & Add {preview.length} Inmate{preview.length !== 1 ? "s" : ""}
                </button>
              </div>
            )}

            {bulkMsg && <div className={bulkMsg.ok ? "ai-msg success" : "ai-msg error"}>{bulkMsg.text}</div>}
          </div>
        )}

        {inmates.length > 0 && (
          <div className="ai-list">
            <h3>Added This Session ({inmates.length})</h3>
            <div className="ai-table-scroll">
              <table className="attendance-table">
                <thead><tr><th>#</th><th>Name</th><th>Room</th><th>Action</th></tr></thead>
                <tbody>
                  {inmates.map((s, i) => (
                    <tr key={s.id}>
                      <td>{i + 1}</td><td>{s.name}</td><td>{s.room}</td>
                      <td><button className="ai-btn-remove" onClick={() => removeInmate(s.id)}>Remove</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}