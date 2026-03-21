import React, { useState } from "react";

const C = {
  white: "#fff", bg: "#f8fafc", border: "#e2e8f0",
  text: "#0f172a", muted: "#64748b", muted2: "#94a3b8",
  accent: "#2563eb", accent2: "#1d4ed8", accentLight: "#eff6ff",
};

const inpStyle = {
  width: "100%", padding: "10px 12px", borderRadius: 8,
  border: `1.5px solid ${C.border}`, background: C.bg,
  fontSize: 13, color: C.text, fontFamily: "inherit", boxSizing: "border-box",
};

export function PaymentModal({ modalData, onClose, onConfirm }) {
  const [method, setMethod]       = useState(0);
  const [hovConfirm, setHovConfirm] = useState(false);
  const [receipt, setReceipt]     = useState({ mode:"", amount:"", cat:"", date:"", receiptNo:"", file:null });

  if (!modalData) return null;

  const methods = [
    { icon:"📱", label:"UPI / QR" },
    { icon:"🏦", label:"Net Banking" },
    { icon:"💳", label:"Debit / Credit" },
    { icon:"👛", label:"Wallet" },
    { icon:"📄", label:"Upload Receipt" },
  ];

  const isUpload  = methods[method].label === "Upload Receipt";
  const isEnabled = isUpload;

  const handleConfirm = () => {
    if (isUpload) onConfirm(receipt);
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,.45)", backdropFilter:"blur(3px)",
      zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:C.white, border:`1.5px solid ${C.border}`, borderRadius:20, padding:28,
        width:"100%", maxWidth:432, maxHeight:"92vh", overflowY:"auto",
        boxShadow:"0 20px 60px rgba(37,99,235,.18)", position:"relative" }}>

        {/* Close */}
        <button onClick={onClose}
          style={{ position:"absolute", top:14, right:14, width:30, height:30, borderRadius:8,
            background:C.bg, border:`1.5px solid ${C.border}`, display:"flex",
            alignItems:"center", justifyContent:"center", cursor:"pointer", color:C.muted, fontSize:18 }}>×</button>

        <div style={{ fontSize:16, fontWeight:800, marginBottom:3, paddingRight:32 }}>{modalData.title}</div>
        <div style={{ fontSize:12.5, color:C.muted, marginBottom:18 }}>{modalData.sub}</div>

        {/* Amount Due */}
        <div style={{ background:C.bg, border:`1.5px solid ${C.border}`, borderRadius:11,
          padding:"14px 16px", marginBottom:16, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:12, color:C.muted, fontWeight:600 }}>Amount Due</span>
          <span style={{ fontSize:22, fontWeight:800, color:C.accent }}>{modalData.amount}</span>
        </div>

        {/* Method selector */}
        <div style={{ fontSize:11, color:C.muted, fontWeight:700, textTransform:"uppercase",
          letterSpacing:".6px", marginBottom:10 }}>Select Payment Method</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:16 }}>
          {methods.map((m, i) => (
            <div key={m.label} onClick={() => setMethod(i)}
              style={{ background:method===i?C.accentLight:C.bg,
                border:`2px solid ${method===i?"#2563eb":C.border}`,
                borderRadius:10, padding:"8px", textAlign:"center", cursor:"pointer",
                fontSize:12.5, fontWeight:600, color:method===i?"#2563eb":C.muted,
                transition:"all .18s", display:"flex", flexDirection:"column",
                alignItems:"center", justifyContent:"center", gap:2 }}>
              <div style={{ fontSize:20 }}>{m.icon}</div>{m.label}
            </div>
          ))}
        </div>

        {/* Not-enabled banner */}
        {!isEnabled && (
          <div style={{ background:"#fef3c7", border:"1.5px solid #fbbf24", borderRadius:10,
            padding:"12px 14px", marginBottom:14, display:"flex", gap:10, alignItems:"flex-start" }}>
            <span style={{ fontSize:18, flexShrink:0 }}>🚫</span>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:"#92400e" }}>This functionality is not enabled</div>
              <div style={{ fontSize:11.5, color:"#78350f", marginTop:3 }}>
                Online payment via <strong>{methods[method].label}</strong> is not available at this time.
                Please use <strong>Upload Receipt</strong> to submit your proof of manual payment.
              </div>
            </div>
          </div>
        )}

        {/* Receipt form — auto-filled amount & category */}
        {isUpload && (
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:16 }}>
            <div style={{ fontSize:11, color:C.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:".6px" }}>
              Receipt Details
            </div>
            <input
              placeholder="Payment Mode (e.g. NEFT / RTGS / Cash)"
              style={inpStyle}
              onChange={e => setReceipt({ ...receipt, mode: e.target.value })} />
            {/* Pre-filled but editable */}
            <input
              placeholder="Amount Paid"
              defaultValue={modalData.rawAmount || modalData.amount}
              style={inpStyle}
              onChange={e => setReceipt({ ...receipt, amount: e.target.value })} />
            <input
              placeholder="Fee Category"
              defaultValue={modalData.cat || ""}
              style={inpStyle}
              onChange={e => setReceipt({ ...receipt, cat: e.target.value })} />
            <input
              type="date"
              style={inpStyle}
              onChange={e => setReceipt({ ...receipt, date: e.target.value })} />
            <input
              placeholder="Receipt / Transaction No."
              style={inpStyle}
              onChange={e => setReceipt({ ...receipt, receiptNo: e.target.value })} />
            <div style={{ fontSize:11, color:C.muted, fontWeight:600 }}>
              Attach Receipt / Proof of Payment <span style={{ color:"#dc2626" }}>*</span>
            </div>
            <input
              type="file"
              accept="image/*,application/pdf"
              required
              style={{ ...inpStyle, padding:"8px", cursor:"pointer" }}
              onChange={e => setReceipt({ ...receipt, file: e.target.files[0] || null })} />
          </div>
        )}

        {/* Confirm button */}
        <button
          onMouseEnter={() => setHovConfirm(true)}
          onMouseLeave={() => setHovConfirm(false)}
          onClick={handleConfirm}
          disabled={!isEnabled}
          style={{ width:"100%", padding:12, borderRadius:11, border:"none",
            background: isEnabled
              ? `linear-gradient(135deg,${C.accent},${C.accent2})`
              : C.border,
            color: isEnabled ? "#fff" : C.muted2,
            fontSize:14, fontWeight:800,
            cursor: isEnabled ? "pointer" : "not-allowed",
            fontFamily:"inherit",
            transform: hovConfirm && isEnabled ? "translateY(-1px)" : "none",
            boxShadow: hovConfirm && isEnabled ? "0 6px 20px rgba(37,99,235,.38)" : "none",
            transition:"all .2s" }}>
          {isEnabled ? "Submit Receipt →" : "Not Available"}
        </button>
      </div>
    </div>
  );
}
