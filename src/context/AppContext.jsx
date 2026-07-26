import { createContext, useContext, useReducer, useCallback } from "react";
import {
  getAllDocuments,
  saveDocument,
  deleteDocument,
  getAllFolders,
  saveFolder,
  deleteFolder,
  getLinksForDocument,
  addLink,
  removeLink,
  getRecents,
  addRecent,
  getAllLinks,
  removeLinksForDocument,
} from "../lib/storage";

/* ---------- Initial State ---------- */

const initialState = {
  documents: getAllDocuments(),
  folders: getAllFolders(),
  links: getAllLinks(),
  recents: getRecents(),
  currentDocId: null,
  currentView: "home", // "home" | "editor"
  editorMode: "viewing", // "viewing" | "editing"
  editorViewType: "traditional", // "traditional" | "markdown"
  filterFolderId: null,
  searchQuery: "",
};

/* ---------- Reducer ---------- */

function appReducer(state, action) {
  switch (action.type) {
    /* Navigation */
    case "NAVIGATE_TO_HOME":
      return { ...state, currentView: "home", currentDocId: null };
    case "NAVIGATE_TO_EDITOR":
      return { ...state, currentView: "editor", currentDocId: action.docId };

    /* Editor mode */
    case "SET_EDITOR_MODE":
      return { ...state, editorMode: action.mode };
    case "SET_EDITOR_VIEW_TYPE":
      return { ...state, editorViewType: action.viewType };

    /* Documents CRUD */
    case "ADD_DOCUMENT": {
      const doc = saveDocument(action.document);
      return { ...state, documents: getAllDocuments(), recents: getRecents() };
    }
    case "UPDATE_DOCUMENT": {
      saveDocument(action.document);
      return { ...state, documents: getAllDocuments() };
    }
    case "DELETE_DOCUMENT": {
      deleteDocument(action.docId);
      return {
        ...state,
        documents: getAllDocuments(),
        recents: getRecents(),
      };
    }

    /* Folders CRUD */
    case "ADD_FOLDER": {
      const folder = saveFolder(action.folder);
      return { ...state, folders: getAllFolders() };
    }
    case "DELETE_FOLDER": {
      deleteFolder(action.folderId);
      return { ...state, folders: getAllFolders() };
    }

    /* Folder filter */
    case "SET_FILTER_FOLDER":
      return { ...state, filterFolderId: action.folderId };

    /* Search */
    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.query };

    /* Links */
    case "ADD_LINK": {
      addLink(action.documentId, action.folderId);
      return { ...state };
    }
    case "REMOVE_LINK": {
      removeLink(action.documentId, action.folderId);
      return { ...state };
    }

    /* Recents */
    case "ADD_RECENT": {
      addRecent(action.docId);
      return { ...state, recents: getRecents() };
    }

    default:
      return state;
  }
}

/* ---------- Context ---------- */

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const addDoc = useCallback(
    (doc) => dispatch({ type: "ADD_DOCUMENT", document: doc }),
    []
  );
  const updateDoc = useCallback(
    (doc) => dispatch({ type: "UPDATE_DOCUMENT", document: doc }),
    []
  );
  const removeDoc = useCallback(
    (id) => dispatch({ type: "DELETE_DOCUMENT", docId: id }),
    []
  );
  const addFolder = useCallback(
    (folder) => dispatch({ type: "ADD_FOLDER", folder }),
    []
  );
  const removeFolder = useCallback(
    (id) => dispatch({ type: "DELETE_FOLDER", folderId: id }),
    []
  );
  const setFilterFolder = useCallback(
    (id) => dispatch({ type: "SET_FILTER_FOLDER", folderId: id }),
    []
  );
  const setSearchQuery = useCallback(
    (q) => dispatch({ type: "SET_SEARCH_QUERY", query: q }),
    []
  );
  const navigateHome = useCallback(
    () => dispatch({ type: "NAVIGATE_TO_HOME" }),
    []
  );
  const navigateToEditor = useCallback(
    (docId) => {
      addRecent(docId);
      dispatch({ type: "NAVIGATE_TO_EDITOR", docId });
    },
    [addRecent]
  );
  const setEditorMode = useCallback(
    (mode) => dispatch({ type: "SET_EDITOR_MODE", mode }),
    []
  );
  const setEditorViewType = useCallback(
    (type) => dispatch({ type: "SET_EDITOR_VIEW_TYPE", viewType: type }),
    []
  );
  const linkDocToFolder = useCallback(
    (docId, folderId) => dispatch({ type: "ADD_LINK", documentId: docId, folderId }),
    []
  );
  const unlinkDocFromFolder = useCallback(
    (docId, folderId) => dispatch({ type: "REMOVE_LINK", documentId: docId, folderId }),
    []
  );

  const value = {
    state,
    dispatch,
    addDoc,
    updateDoc,
    removeDoc,
    addFolder,
    removeFolder,
    setFilterFolder,
    setSearchQuery,
    navigateHome,
    navigateToEditor,
    setEditorMode,
    setEditorViewType,
    linkDocToFolder,
    unlinkDocFromFolder,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
