import { NavLink, Outlet } from "react-router-dom";

/* ── Home icon ── */
function HomeIcon({ active }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

/* ── Pencil / Edit icon ── */
function DocIcon({ active }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

/* ── App layout with persistent sidebar + <Outlet /> ── */
export default function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[280px] min-w-[280px] bg-white border-r border-[#E5E7EB] flex flex-col">
        {/* Brand */}
        <div className="px-[16px] py-[20px] border-b border-[#E5E7EB]">
          <h1 className="text-[20px] font-semibold text-[#141b2b] font-inter tracking-tight">
            Advance Docs
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-[16px] py-[12px] flex flex-col gap-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
                isActive
                  ? "bg-[#f3e8ff] text-[#6D28D9]"
                  : "text-[#4a4455] hover:bg-[#f9f9ff]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* 4px pill indicator on left for active state */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-5 bg-[#6D28D9] rounded-r" />
                )}
                <HomeIcon active={isActive} />
                <span>Home</span>
              </>
            )}
          </NavLink>

          <NavLink
            to="/"
            end={false}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
                isActive
                  ? "bg-[#f3e8ff] text-[#6D28D9]"
                  : "text-[#4a4455] hover:bg-[#f9f9ff]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-5 bg-[#6D28D9] rounded-r" />
                )}
                <DocIcon active={isActive} />
                <span>Documents</span>
              </>
            )}
          </NavLink>
        </nav>

        {/* Sidebar footer */}
        <div className="px-[16px] py-[12px] border-t border-[#E5E7EB]">
          <span className="text-[12px] text-[#9ca3af] font-inter">
            Advance Docs v1
          </span>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-[#f9f9ff]">
        <Outlet />
      </main>
    </div>
  );
}
