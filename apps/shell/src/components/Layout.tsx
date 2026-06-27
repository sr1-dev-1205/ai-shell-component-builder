import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ORG_NAME } from '../config';

const navItems = [
  { path: '/', label: 'Dashboard', title: 'Dashboard' },
  { path: '/playground', label: 'Playground', title: 'Playground' },
  { path: '/modules', label: 'Module Gallery', title: 'Module Gallery' },
  { path: '/shell-view', label: 'Live Shell View', title: 'Live Shell View' },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const currentNav =
    navItems.find((item) => item.path === location.pathname) || navItems[0];

  const sidebarWidth = collapsed ? 52 : 220;

  return (
    <div className="flex h-screen overflow-hidden">
      <aside
        className="cs-sidebar"
        style={{ width: sidebarWidth }}
      >
        <div className="cs-sidebar-brand">
          {!collapsed && <h1 className="cs-sidebar-logo">ShellOS</h1>}
          <button
            type="button"
            className="btn-icon"
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? '»' : '«'}
          </button>
        </div>

        <nav className="flex-1 py-2">
          <ul>
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  title={item.label}
                  className={({ isActive }) =>
                    `cs-nav-link${isActive ? ' cs-nav-link-active' : ''}`
                  }
                >
                  {collapsed ? item.label.charAt(0) : item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div
          className="border-t px-4 py-4"
          style={{ borderColor: 'var(--border)' }}
        >
          <div
            className="flex items-center gap-2"
            style={{ fontSize: '11px', color: 'var(--text-secondary)' }}
          >
            <span
              className="pulse-dot inline-block h-2 w-2 rounded-full"
              style={{ background: 'var(--accent-green)' }}
            />
            {!collapsed && 'Event Bus'}
          </div>
        </div>
      </aside>

      <div
        className="flex flex-1 flex-col"
        style={{ marginLeft: sidebarWidth }}
      >
        <header className="cs-topbar">
          <h2 className="cs-page-title">{currentNav.title}</h2>
          <span className="cs-org-badge">Org: {ORG_NAME}</span>
        </header>

        <main
          className="flex-1 overflow-auto p-6"
          style={{ background: 'var(--bg-light)' }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
