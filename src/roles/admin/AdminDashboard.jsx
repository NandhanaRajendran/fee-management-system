import { Users, Building2, Receipt, UserCog, Plus, Upload } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminDashboard() {

  const stats = [
    { name: "Total Students", value: "10", icon: Users, link: "/admin/students", color: "blue" },
    { name: "Total Departments", value: "6", icon: Building2, link: "/admin/departments", color: "green" },
    { name: "Total Staff Advisors", value: "4", icon: UserCog, link: "/admin/staff", color: "purple" },
    { name: "Total Fee Sections", value: "7", icon: Receipt, link: "/admin/fee-sections", color: "orange" },
  ];

  const quickActions = [
    { name: "Add Student", icon: Plus, link: "/admin/students", color: "blue" },
    { name: "Upload Student Excel", icon: Upload, link: "/admin/bulk-enrollment", color: "green" },
    { name: "Add Department", icon: Plus, link: "/admin/departments", color: "purple" },
    { name: "Create Fee Section", icon: Plus, link: "/admin/fee-sections", color: "orange" },
  ];

  return (
    <div className="admin-container">

      <div className="admin-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's an overview of your college management system.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <Link key={index} to={stat.link} className="stat-card">

              <div className="stat-left">
                <p className="stat-title">{stat.name}</p>
                <p className="stat-value">{stat.value}</p>
              </div>

              <div className={`stat-icon ${stat.color}`}>
                <Icon size={22} color="white"/>
              </div>

            </Link>
          );
        })}
      </div>


      {/* Quick Actions */}

      <div className="quick-actions-container">

        {/* <h2>Quick Actions</h2> */}

        <div className="quick-actions">

          {quickActions.map((action,index)=>{

            const Icon = action.icon;

            return(
              <Link
                key={index}
                to={action.link}
                className={`quick-btn ${action.color}`}
              >

                <Icon size={18}/>
                {action.name}

              </Link>
            )

          })}

        </div>

      </div>


      {/* Recent Activity */}

      <div className="recent-grid">

        <div className="recent-card">

          <h3>Recent Student Enrollments</h3>

          <ul>

            <li>
              Aarav Sharma
              <span>Computer Science</span>
            </li>

            <li>
              Diya Patel
              <span>Electrical Engineering</span>
            </li>

            <li>
              Rohan Gupta
              <span>Civil Engineering</span>
            </li>

            <li>
              Priya Reddy
              <span>Electronics</span>
            </li>

          </ul>

          <Link to="/admin/students" className="view-btn">
            View all students →
          </Link>

        </div>


        <div className="recent-card">

          <h3>Recent Department Updates</h3>

          <ul>

            <li>
              Computer Science
              <span>New HOD appointed</span>
            </li>

            <li>
              Information Technology
              <span>Lab upgraded</span>
            </li>

            <li>
              Mechanical Engineering
              <span>Advisor added</span>
            </li>

          </ul>

          <Link to="/admin/departments" className="view-btn">
            View all departments →
          </Link>

        </div>

      </div>

    </div>
  );
}