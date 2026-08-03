import { NavLink, Outlet } from "react-router-dom";
import { vertexThemeBG, vertexThemeColors, vertexThemeText } from "../VertexStyles";
import Button from "../vertez/Button";

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

const navigationContainerStyling = [
  "bg-[#1c1816]",
  "border-[#382e29] border-[1px]",
  vertexThemeText.textNormal,
  "px-[6px]",
  "w-[40px]",
  "min-w-[40px]",
  "flex",
  "flex-col"
].join(" ");

const screenContainerStyling = [
  vertexThemeBG.appBackground,
  "flex-1",
  "overflow-auto"
].join(" ");

const sidebarTitleStyling = [
  vertexThemeText.textPrimary,
  "text-[32px]", 
  "font-semibold",
  "font-inter",
  "tracking-[0.35px]",
  "mb-[-10px]"
].join(" ");

/* ── App layout with persistent sidebar + <Outlet /> ── */
export default function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden text-[#BB99FF]">
      {/* Sidebar */}
      <aside className={navigationContainerStyling}>
        {/* Brand */}
        <div className="px-[16px] py-[12px]">
          <h1 className={sidebarTitleStyling}>
          </h1>
          <p>
          </p>
          {/* <Button styles={{ w: "w-[100%]" }}>+ New Document</Button> */}
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-[15px] px-[16px] py-[12px] flex flex-col gap-[18px]">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors relative`
            }
          >
            {({ isActive }) => (
              <>
                {/* 4px pill indicator on left for active state */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-5 bg-[#6D28D9] rounded-r" />
                )}
               {/* <span>Home</span> */}
              </>
            )}
          </NavLink>

          <NavLink
            to="/"
            end={false}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors relative`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-5 bg-[#6D28D9] rounded-r" />
                )}
                {/* <span>Documents</span> */}
              </>
            )}
          </NavLink>
        </nav>

        {/* Sidebar footer */}
        <div className="px-[16px] py-[12px]">
          <span className="text-[12px] text-[#9ca3af] font-inter">
            Advance Docs v1
          </span>
        </div>
      </aside>

      {/* Main content */}
      <main className={screenContainerStyling}>
        <Outlet />
      </main>
    </div>
  );
}
