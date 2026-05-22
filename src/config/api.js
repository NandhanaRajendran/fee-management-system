const API =
  window.location.hostname === "localhost"
    ? "http://localhost:8000"
    : "https://mess-management-system-q6us.onrender.com";

export default API;