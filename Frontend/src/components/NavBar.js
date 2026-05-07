// src/components/Navbar.js
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles.css";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Which routes count as admin-only or student-only
  const adminPaths = ["/admin-dashboard", "/create-exam", "/exam-responses", "/manual-review"];
  const studentPaths = ["/dashboard", "/my-exams", "/start-exam", "/training"];

  const isAdminArea = adminPaths.some((p) => location.pathname.startsWith(p));
  const isStudentArea = studentPaths.some((p) => location.pathname.startsWith(p));

  // Hide logout on these routes:
  const noLogoutPaths = ["/", "/login/student", "/login/admin", "/register"];
  const showLogout = !noLogoutPaths.includes(location.pathname);

  const handleLogout = () => {
    // clear whatever you need (e.g. auth tokens)
    navigate("/", { replace: true });
  };

  return (
    <nav className="navbar">
      <div className="navbar__logo">
        <Link to="/">AI Proctored Examination Portal</Link>
      </div>

      <ul className="navbar__links">
        {/* always show Home */}
        <li><Link to="/">Home</Link></li>

        {/* if we’re not in an admin-only area, let them see Student Login */}
        {!isAdminArea && <li><Link to="/login/student">Student Login</Link></li>}

        {/* If in student area, show Training */}
        {isStudentArea && <li><Link to="/training">🧠 Training</Link></li>}

        {/* if we’re not in a student-only area, let them see Admin Login */}
        {!isStudentArea && <li><Link to="/login/admin">Admin Login</Link></li>}

        {/* show Register only on landing and login pages are showing */}
        {["/", "/login/student", "/login/admin"].includes(location.pathname) && (
          <li><Link to="/register">Register</Link></li>
        )}

        {/* finally, show Logout everywhere else */}
        {showLogout && (
          <li>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}
