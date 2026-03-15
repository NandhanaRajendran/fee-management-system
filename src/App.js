import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./styles/global.css";

/* auth */
import LoginPage from "./auth/LoginPage";
import ForgotPasswordPage from "./auth/ForgotPasswordPage";

/* mess manager */
import Dashboard from "./roles/messManager/Dashboard";
import Attendance from "./roles/messManager/Attendance";
import Expenses from "./roles/messManager/Expenses";
import MessBill from "./roles/messManager/MessBill";

/* Admin*/
import AdminDashboard from "./roles/admin/AdminDashboard";
import AdminLayout from "./roles/admin/AdminLayout";
import Students from "./roles/admin/Students";
import Departments from "./roles/admin/Departments";
import BulkEnrollment from "./roles/admin/BulkEnrollment";
import FeeSections from "./roles/admin/FeeSections";
import StaffAndFaculty from "./roles/admin/StaffAndFaculty";
import Settings from "./roles/admin/Settings";

function App() {
  return (
    <Router>
      <Routes>
        {/* redirect root */}
        <Route path="/" element={<Navigate to="/login" />} />
        {/* auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        {/* mess manager */}

        <Route path="/mess/dashboard" element={<Dashboard />} />
        <Route path="/mess/attendance/:roomId" element={<Attendance />} />
        <Route path="/mess/expenses" element={<Expenses />} />
        <Route path="/mess/messbill" element={<MessBill />} />
        {/* admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="departments" element={<Departments />} />
          <Route path="bulk-enrollment" element={<BulkEnrollment />} />
          <Route path="fee-sections" element={<FeeSections />} />
          <Route path="staff" element={<StaffAndFaculty />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
