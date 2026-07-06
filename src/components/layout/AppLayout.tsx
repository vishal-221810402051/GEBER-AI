import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { StatusBanner } from "../status/StatusBanner";

const navItems = [
  { to: "/", label: "Overview" },
  { to: "/intake", label: "Intake" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/board", label: "Board" },
  { to: "/components", label: "Components" },
  { to: "/nets", label: "Nets" },
  { to: "/power", label: "Power" },
  { to: "/bom", label: "BOM" },
  { to: "/firmware", label: "Firmware" },
  { to: "/reports", label: "Reports" }
];

type AppLayoutProps = Readonly<{
  children: ReactNode;
}>;

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand" aria-label="GEBER AI home">
          <span className="brand-mark">GA</span>
          <span>
            <strong>GEBER AI</strong>
            <small>Engineering review platform</small>
          </span>
        </Link>
        <div className="topbar-status">
          <span>Phase 1</span>
          <span>Upload not active</span>
          <span>Parser not implemented</span>
        </div>
      </header>

      <div className="workspace">
        <aside className="sidebar" aria-label="Primary navigation">
          <nav>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="content">
          <StatusBanner />
          {children}
        </main>
      </div>
    </div>
  );
}
