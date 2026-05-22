import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Navbar } from "../../components/common/Navbar";
import { ProfileDrawer } from "../../components/common/ProfileDrawer";
import { PaymentModal } from "../../components/common/PaymentModal";
import { Toast } from "../../components/common/Toast";

import { FeeSection } from "../../components/fees/FeeSection";
import { HostelSection } from "../../components/hostel/HostelSection";
import API from "../../config/api";

export default function StudentDashboard() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [fees, setFees] = useState([]);
  const [studentId, setStudentId] = useState("");

  const [profile, setProfile] = useState(null);
  const [rawDues, setRawDues] = useState([]);
  //const API = "https://mess-management-system-q6us.onrender.com";

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    const admissionNo = user.username;
    if (user.refId) setStudentId(user.refId);

    // 1. Fetch Dues
    fetch(`${API}/api/admin/my-dues`, {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`
      },
    })
      .then((res) => res.json())
      .then((data) => setRawDues(data))
      .catch(console.error);

    // 2. Fetch full Profile (for hostel attendance and check if inmate)
    if (admissionNo) {
      fetch(`${API}/api/students/admission/${admissionNo}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`
        }
      })
        .then(res => res.json())
        .then(data => setProfile(data))
        .catch(console.error);
    }
  }, []);

  useEffect(() => {
    buildFeesList(rawDues, profile?.hostelEnrollmentDate);
  }, [rawDues, profile]);

  function buildFeesList(data, enrollmentDate) {
    console.log("Fees response data:", data);
    if (!Array.isArray(data)) {
      console.error("Expected array for fees, got:", data);
      return;
    }

    const safeDate = (d) => {
      if (!d) return "-";
      try {
        const date = new Date(d);
        if (isNaN(date.getTime())) return "-";
        return date.toISOString().split("T")[0];
      } catch (e) {
        return "-";
      }
    };

    const list = data
      .map((f) => {
        let st = "notpaid";

        if (f.status === "paid") st = "paid";
        else if (f.status === "draft")
          st = "draft";
        else st = "notpaid";

        const sectionName = f.feeSection?.name?.toLowerCase() || "";
        let category = f.feeSection?.category || "Academic";
        let monthValue = "Current";

        // Priority categorization for HOD/Advisor/Library
        if (
          sectionName.includes("hod") ||
          sectionName.includes("advisor") ||
          sectionName.includes("library")
        ) {
          category = "Fine";
        }

        const isMessBill = sectionName.includes("mess") && f.remark && f.remark.includes("Mess Bill");

        if (sectionName.includes("mess")) {
          category = "Hostel";
          if (f.remark && f.remark.includes("Mess Bill")) {
            const parts = f.remark.split(" ");
            if (parts[0] && parts[0].includes("-")) {
              const [y, m] = parts[0].split("-");
              const MONTHS = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ];
              const monthIdx = parseInt(m) - 1;
              if (monthIdx >= 0 && monthIdx < 12) {
                monthValue = `${MONTHS[monthIdx]} ${y}`;
              }
            }
          }
        }

        // Filtering logic: If it's a mess bill and was published before enrollment, return null
        if (isMessBill && enrollmentDate) {
          const enrollDate = new Date(enrollmentDate);
          const enrollYear = enrollDate.getFullYear();
          const enrollMonth = enrollDate.getMonth(); // 0-indexed

          if (f.remark && f.remark.includes("Mess Bill")) {
            const parts = f.remark.split(" ");
            if (parts[0] && parts[0].includes("-")) {
              const [y, m] = parts[0].split("-").map(Number);
              const billYear = y;
              const billMonth = m - 1; // 0-indexed

              // If the bill's month is before the enrollment month/year, hide it
              if (billYear < enrollYear || (billYear === enrollYear && billMonth < enrollMonth)) {
                return null;
              }
            }
          }

          // Fallback: If month parsing failed or as an extra safety, check publication date
          const pubDate = new Date(f.updatedAt || f.createdAt);
          if (pubDate < enrollDate) {
            return null;
          }
        }

        return {
          id: f._id,
          type: f.feeSection?.name || "Fee",
          cat: category,
          amt: f.amount,
          pub: safeDate(f.updatedAt),
          due: safeDate(f.dueDate),
          status: st,
          paidDate: f.status === "paid" ? safeDate(f.updatedAt) : "-",
          month: monthValue,
          receiptUrl: f.receiptUrl || null,
          remark: f.remark || null,

          meta: f.meta || {}
        };
      })
      .filter((f) => f !== null);

    setFees(list);
  }
  const [modalData, setModalData] = useState(null);
  const [toast, setToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const navigate = useNavigate();

  const handlePayNow = (feeOrId) => {

    const fee =
      typeof feeOrId === "object"
        ? feeOrId
        : fees.find((f) => f.id === feeOrId);

    if (!fee) return;

    // Draft Preview
    if (fee.status === "draft") {

      setModalData({
        ...fee,
        isDraftPreview: true
      });

      return;
    }

    // Normal Payment
    setModalData({
      id: fee.id,
      title: fee.type,
      sub: `To ${fee.cat}`,
      amount: `₹${fee.amt.toLocaleString("en-IN")}`,
      cat: fee.cat,
      entityModel: fee.type === "Fine"
        ? "Fine"
        : "Fee",
    });
  };

  const handleConfirmPayment = (receiptData) => {
    if (!studentId || !modalData) {
      setToastMsg(
        "Error: Not logged in properly. Please refresh and try again.",
      );
      setToast(true);
      return;
    }

    const file = receiptData?.file;
    if (!file) {
      setToastMsg("Please attach a receipt file before submitting.");
      setToast(true);
      return;
    }

    const doSubmit = (receiptUrl) => {
      fetch(`${API}/api/students/${studentId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount:
            receiptData?.amount ||
            Number(String(modalData.amount).replace(/[^0-9.-]+/g, "")),
          referenceId: receiptData?.receiptNo || "RECEIPT_UPLOAD",
          type: modalData.entityModel,
          relatedEntity: modalData.id,
          receiptUrl: receiptUrl || null,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          setToastMsg(
            data.message || "Receipt submitted! Status changed to Verifying.",
          );
          setToast(true);
          setModalData(null);
          setTimeout(() => setToast(false), 4000);
          return fetch(`${API}/api/students/${studentId}/dues`)
            .then((r) => r.json())
            .then(buildFeesList)
            .catch(console.error);
        })
        .catch((err) => {
          console.error(err);
          setToastMsg("Submission failed. Please try again.");
          setToast(true);
        });
    };

    if (file instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => doSubmit(e.target.result);
      reader.readAsDataURL(file);
    } else {
      doSubmit(file);
    }
  };

  return (
    <>
      <Navbar
        onAvatarClick={() => setDrawerOpen(true)}
        onLogout={() => {
          setToastMsg("Logged out");
          setToast(true);
          setTimeout(() => navigate("/login"), 800);
        }}
      />
      <FeeSection
        fees={fees}
        onPayNow={handlePayNow}
        extraActions={
          <button
            onClick={() => {
              const el = document.getElementById("hostel-attendance-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              fontSize: 11.5,
              fontWeight: 700,
              cursor: "pointer",
              border: "1.5px solid #e24b4a",
              background: "#fef2f2",
              color: "#e24b4a",
              transition: "all .18s",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            🏨 Hostel Attendance
          </button>
        }
      />
      <div id="hostel-attendance-section" style={{ marginTop: 24 }}>
        {profile?.hostelName ? (
          <HostelSection attendance={profile.attendance} />
        ) : (
          <div style={{ padding: 24, textAlign: "center", background: "#fcf9f8ff", borderRadius: 16, border: "1.5px dashed #e2e8f0", color: "#64748b" }}>
            <p style={{ fontWeight: 600 }}>No hostel enrollment found.</p>
            <p style={{ fontSize: 12 }}>Check with the hostel office if you are an inmate.</p>
          </div>
        )}
      </div>
      <ProfileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        messBills={fees.filter(f => f.type.toLowerCase().includes("mess") && f.remark && f.remark.includes("Mess Bill"))}
      />
      {modalData?.isDraftPreview ? (

        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}
        >

          <div
            style={{
              background: "rgba(255,255,255,0.96)",
              backdropFilter: "blur(14px)",
              padding: "28px",
              borderRadius: "24px",
              width: "420px",
              maxWidth: "95%",
              boxShadow: "0 20px 50px rgba(0,0,0,0.18)",
              border: "1px solid rgba(255,255,255,0.4)",
              animation: "fadeIn .25s ease"
            }}
          >

            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px"
              }}
            >

              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "22px",
                    fontWeight: "800",
                    color: "#111827"
                  }}
                >
                  🍽 Mess Bill Preview
                </h2>

                <p
                  style={{
                    marginTop: "4px",
                    fontSize: "13px",
                    color: "#6b7280"
                  }}
                >
                  Draft preview before official publication
                </p>
              </div>

              <div
                style={{
                  background: "#FEF3C7",
                  color: "#92400E",
                  padding: "6px 12px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: "700"
                }}
              >
                Draft
              </div>

            </div>

            {/* Amount Card */}
            <div
              style={{
                background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
                borderRadius: "18px",
                padding: "20px",
                color: "#fff",
                marginBottom: "20px"
              }}
            >

              <div
                style={{
                  fontSize: "13px",
                  opacity: 0.85
                }}
              >
                Total Amount
              </div>

              <div
                style={{
                  fontSize: "34px",
                  fontWeight: "800",
                  marginTop: "4px"
                }}
              >
                ₹{modalData.amt}
              </div>

              <div
                style={{
                  marginTop: "8px",
                  fontSize: "13px",
                  opacity: 0.9
                }}
              >
                {modalData.type}
              </div>

            </div>

            {/* Details Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginBottom: "20px"
              }}
            >

              {[
                {
                  label: "Attendance",
                  value: modalData.meta?.attendanceDays,
                  icon: "📅"
                },
                {
                  label: "Food Bill",
                  value: `₹${modalData.meta?.foodBill}`,
                  icon: "🍛"
                },
                {
                  label: "Staff Share",
                  value: `₹${modalData.meta?.staffShare}`,
                  icon: "👨‍🍳"
                },
                {
                  label: "Rate / Day",
                  value: `₹${modalData.meta?.foodRatePerDay}`,
                  icon: "💰"
                }
              ].map((item) => (

                <div
                  key={item.label}
                  style={{
                    background: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderRadius: "16px",
                    padding: "14px"
                  }}
                >

                  <div
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      marginBottom: "6px"
                    }}
                  >
                    {item.icon} {item.label}
                  </div>

                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: "700",
                      color: "#111827"
                    }}
                  >
                    {item.value}
                  </div>

                </div>

              ))}

            </div>

            {/* Info Box */}
            <div
              style={{
                background: "#EFF6FF",
                border: "1px solid #BFDBFE",
                color: "#1E40AF",
                padding: "14px",
                borderRadius: "14px",
                fontSize: "13px",
                lineHeight: "1.5",
                marginBottom: "20px"
              }}
            >
              ℹ️ This is only a preview of the calculated mess bill.
              Payment will be enabled after official publication.
            </div>

            {/* Close Button */}
            <button
              onClick={() => setModalData(null)}
              style={{
                width: "100%",
                padding: "13px",
                border: "none",
                borderRadius: "14px",
                background: "#111827",
                color: "#fff",
                fontSize: "15px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "0.2s"
              }}
            >
              Close Preview
            </button>

          </div>

        </div>

      ) : modalData ? (

        <PaymentModal
          modalData={modalData}
          onClose={() => setModalData(null)}
          onConfirm={handleConfirmPayment}
        />

      ) : null}
      <Toast show={toast} setShow={setToast} message={toastMsg} />
    </>
  );
}
