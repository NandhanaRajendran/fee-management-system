import React, { useEffect } from "react";
import { C } from "../../utils/constants";

export function Toast({ show, setShow, message = "Payment successful!" }) {
  useEffect(() => {
    if (show) {
      const t = setTimeout(() => setShow(false), 3000);
      return () => clearTimeout(t);
    }
  }, [show, setShow]);
  return (
    <div style={{ position:"fixed", bottom:30, left:"50%", transform:`translate(-50%, ${show?0:20}px)`, opacity:show?1:0, pointerEvents:show?"all":"none", background:C.text, color:"#fff", padding:"12px 20px", borderRadius:12, fontSize:13.5, fontWeight:600, display:"flex", alignItems:"center", gap:8, boxShadow:"0 10px 30px rgba(0,0,0,.15)", transition:"all .3s cubic-bezier(.4,0,.2,1)", zIndex:400 }}>
      {message}
    </div>
  );
}
