import { Outlet, NavLink } from "react-router-dom";

export default function Layout() {
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
        </div>
      </nav>
      <Outlet />
    </div>
  );
}
