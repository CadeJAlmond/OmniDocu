// src/components/ScreenContainer.jsx
// Shared wrapper that provides the max-width container and screen padding.
// All screens use this to stay consistent with DESIGN.md layout spec.

export default function ScreenContainer({ children, className = "" }) {
  return (
    <div
      className={`doc-canvas px-[16px] sm:px-[24px] lg:px-[40px] py-[24px] screen-enter ${className}`}
    >
      {children}
    </div>
  );
}
