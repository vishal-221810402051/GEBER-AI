import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { StatusBanner } from "../status/StatusBanner";

const navGroups = [
  {
    label: "Project",
    items: [
      { to: "/", label: "Home" },
      { to: "/intake", label: "Intake" },
      { to: "/review", label: "Review" },
      { to: "/dashboard", label: "Dashboard" }
    ]
  },
  {
    label: "Hardware Evidence",
    items: [
      { to: "/board", label: "Board" },
      { to: "/components", label: "Components" },
      { to: "/nets", label: "Nets" },
      { to: "/power", label: "Power" },
      { to: "/bom", label: "BOM" }
    ]
  },
  {
    label: "Outputs",
    items: [
      { to: "/firmware", label: "Firmware" },
      { to: "/reports", label: "Reports" }
    ]
  }
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
            <small>PCB intelligence workspace</small>
          </span>
        </Link>
        <div className="topbar-status">
          <span>Local analysis</span>
          <span>Evidence-based</span>
          <span>Exports ready</span>
        </div>
      </header>

      <div className="workspace">
        <aside className="sidebar" aria-label="Primary navigation">
          <nav>
            {navGroups.map((group) => (
              <section key={group.label} className="nav-section">
                <span className="nav-section-label">{group.label}</span>
                {group.items.map((item) => (
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
              </section>
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
