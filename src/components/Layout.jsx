import { useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { loadAnalytics, isConfigured } from "../lib/analytics";

export default function Layout() {
  // Record the visit once per page load, from any page — so the unique-visitor
  // count covers the whole site, not just people who open the Analytics tab.
  useEffect(() => {
    if (isConfigured) loadAnalytics().catch(() => {});
  }, []);

  return (
    <div className="site-wrapper">
      <nav>
        <div className="nav-links">
          <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
            Home
          </NavLink>
          <NavLink
            to="/thoughts"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Thoughts
          </NavLink>
          <NavLink
            to="/analytics"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Analytics
          </NavLink>
        </div>
      </nav>
      <Outlet />
    </div>
  );
}
