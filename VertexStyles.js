// VertexStyles.js — Advance Docs project theme (light theme aligned with DESIGN.md)
// This file is the centralized style hub for the app. Screens import from here,
// never reference hardcoded hex values directly.

export const vertexThemeColors = {
  primary: "#6D28D9",          // DESIGN.md primary
  primaryContainer: "#dac5ff",
  onPrimary: "#ffffff",

  secondary: "#555f6d",
  onSecondary: "#ffffff",
  secondaryContainer: "#d6e0f1",

  surface: "#f9f9ff",          // DESIGN.md surface & background
  surfaceBright: "#f9f9ff",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerLow: "#f1f3ff",
  surfaceContainer: "#e9edff",
  surfaceContainerHigh: "#e1e8fd",
  surfaceContainerHighest: "#dce2f7",
  onSurface: "#141b2b",        // DESIGN.md on-surface (deep charcoal)
  onSurfaceVariant: "#4a4455", // secondary label text
  surfaceTint: "#7331df",

  outline: "#7b7486",
  outlineVariant: "#ccc3d7",
  border: "#E5E7EB",           // DESIGN.md card border

  error: "#ba1a1a",
  onError: "#ffffff",
  errorContainer: "#ffdad6",
  onErrorContainer: "#93000a",

  inverseSurface: "#293040",
  inverseOnSurface: "#edf0ff",
  inversePrimary: "#d3bbff",

  background: "#f9f9ff",
  onBackground: "#141b2b",
  surfaceVariant: "#dce2f7",
};

// Token → Tailwind utility class strings (for use directly in className props)
export const vertexThemeText = {
  primary: "text-[#6D28D9]",
  onPrimary: "text-[#ffffff]",
  secondary: "text-[#555f6d]",
  onSecondary: "text-[#ffffff]",
  textPrimary: "text-[#141b2b]",
  textSecondary: "text-[#4a4455]",
  textMuted: "text-[#9ca3af]",
  error: "text-[#ba1a1a]",
  onSurface: "text-[#141b2b]",
  onSurfaceVariant: "text-[#4a4455]",
  border: "text-[#E5E7EB]",
};

export const vertexThemeBG = {
  primary: "bg-[#6D28D9]",
  primaryContainer: "bg-[#dac5ff]",
  onPrimary: "bg-[#ffffff]",

  secondary: "bg-[#555f6d]",
  secondaryContainer: "bg-[#d6e0f1]",

  surface: "bg-[#f9f9ff]",
  surfaceBright: "bg-[#f9f9ff]",
  surfaceContainerLowest: "bg-[#ffffff]",
  surfaceContainerLow: "bg-[#f1f3ff]",
  surfaceContainer: "bg-[#e9edff]",
  surfaceContainerHigh: "bg-[#e1e8fd]",
  surfaceContainerHighest: "bg-[#dce2f7]",

  card: "bg-[#ffffff]",          // white cards per DESIGN.md card spec
  cardBorder: "border-[#E5E7EB]",

  surfaceTint: "bg-[#7331df]",

  background: "bg-[#f9f9ff]",
  onBackground: "bg-[#141b2b]",

  btnPrimary: "bg-[#6D28D9]",
  btnPrimaryHover: "hover:bg-[#6D28D9]/90",
  btnPrimaryText: "text-[#ffffff]",

  btnSecondary: "bg-transparent border border-[#E5E7EB]",
  btnSecondaryText: "text-[#4B5563]",
  btnSecondaryHover: "hover:bg-[#f3e8ff]",

  activePill: "bg-[#f3e8ff]",   // DESIGN.md: tertiary purple for active tool bg
  activePillText: "text-[#6D28D9]",

  chip: "bg-[#f3e8ff]",
  chipText: "text-[#6D28D9]",

  itemHover: "hover:bg-[#f3e8ff]",
  itemHoverText: "text-[#6D28D9]",

  outline: "border-[#E5E7EB]",

  inputBorder: "border-[#E5E7EB]",
  inputFocus: "focus:border-[#6D28D9]",
  inputFocusRing: "focus:ring-0",
  inputBg: "bg-[#ffffff]",
  inputText: "text-[#141b2b]",
  inputPlaceholder: "placeholder-[#9ca3af]",

  danger: "bg-[#ba1a1a]",
  dangerText: "text-[#ffffff]",
};
