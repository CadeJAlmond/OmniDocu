import { createContext, useContext, useReducer, useCallback } from "react";

/* ---------- Initial State ---------- */

const initialState = {
  currentDocId: null,
  currentView: "home", // "home" | "editor"
  editorMode: "viewing", // "viewing" | "editing"
  editorViewType: "traditional", // "traditional" | "markdown"
  filterFolderId: null,
  searchQuery: "",
};

/* ---------- Reducer ---------- */

function appReducer(state, action) {
   return state;
}

/* ---------- Context ---------- */

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const value = {};

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
