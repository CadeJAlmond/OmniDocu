// src/lib/storage.js
// localStorage CRUD helpers with error-safe wrappers.
// All keys are prefixed to avoid collisions.

const PREFIX = "advance_docs_";

function key(k) {
  return PREFIX + k;
}

/* ---------- HELPERS ---------- */

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key(key));
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  try {
    localStorage.setItem(key(key), JSON.stringify(value));
  } catch {
    // localStorage full or unavailable — silently degrade
  }
}

/* ---------- ID GENERATOR ---------- */

let _idCounter = Date.now();
export function generateId() {
  _idCounter += 1;
  return `${_idCounter}-${Math.random().toString(36).slice(2, 8)}`;
}

/* ---------- DOCUMENTS ---------- */

const DEFAULT_DOCUMENTS = [
  {
    id: "welcome",
    documentName: "Welcome to Advance Docs",
    content: "Start writing your document here.\n\nUse **bold** and __underline__ in Traditional view, or write in Markdown for lightweight formatting.",
    lastEdited: new Date().toISOString(),
  },
];

export function getAllDocuments() {
  return loadJSON("documents", DEFAULT_DOCUMENTS);
}

export function getDocument(id) {
  const docs = getAllDocuments();
  return docs.find((d) => d.id === id) || null;
}

export function saveDocument(doc) {
  const docs = getAllDocuments();
  const idx = docs.findIndex((d) => d.id === doc.id);
  const next = {
    ...doc,
    lastEdited: new Date().toISOString(),
  };
  if (idx >= 0) {
    docs[idx] = next;
  } else {
    next.id = next.id || generateId();
    docs.push(next);
  }
  saveJSON("documents", docs);
  return next;
}

export function deleteDocument(id) {
  const docs = getAllDocuments().filter((d) => d.id !== id);
  saveJSON("documents", docs);
  removeLinksForDocument(id);
}

/* ---------- FOLDERS ---------- */

const DEFAULT_FOLDERS = [
  {
    id: "default",
    folderName: "General",
    lastEdited: new Date().toISOString(),
  },
];

export function getAllFolders() {
  return loadJSON("folders", DEFAULT_FOLDERS);
}

export function getFolder(id) {
  const folders = getAllFolders();
  return folders.find((f) => f.id === id) || null;
}

export function saveFolder(folder) {
  const folders = getAllFolders();
  const idx = folders.findIndex((f) => f.id === folder.id);
  const next = { ...folder, lastEdited: new Date().toISOString() };
  if (idx >= 0) {
    folders[idx] = next;
  } else {
    next.id = next.id || generateId();
    folders.push(next);
  }
  saveJSON("folders", folders);
  return next;
}

export function deleteFolder(id) {
  const folders = getAllFolders().filter((f) => f.id !== id);
  saveJSON("folders", folders);
  // Remove all links pointing at this folder
  const links = getAllLinks().filter((l) => l.folderId !== id);
  saveJSON("links", links);
}

/* ---------- LINKS (many-to-many) ---------- */

export function getAllLinks() {
  return loadJSON("links", []);
}

export function getLinksForDocument(docId) {
  return getAllLinks().filter((l) => l.documentId === docId);
}

export function getLinksForFolder(folderId) {
  return getAllLinks().filter((l) => l.folderId === folderId);
}

export function addLink(documentId, folderId) {
  const links = getAllLinks();
  const exists = links.some(
    (l) => l.documentId === documentId && l.folderId === folderId
  );
  if (exists) return links;
  links.push({ id: generateId(), documentId, folderId });
  saveJSON("links", links);
  return links;
}

export function removeLink(documentId, folderId) {
  const links = getAllLinks().filter(
    (l) => !(l.documentId === documentId && l.folderId === folderId)
  );
  saveJSON("links", links);
  return links;
}

export function removeLinksForDocument(docId) {
  const links = getAllLinks().filter((l) => l.documentId !== docId);
  saveJSON("links", links);
}

export function removeLinksForFolder(folderId) {
  const links = getAllLinks().filter((l) => l.folderId !== folderId);
  saveJSON("links", links);
}

/* ---------- RECENTS ---------- */

function getRecentsRaw() {
  return loadJSON("recents", []);
}

export function addRecent(docId) {
  const recents = getRecentsRaw().filter((id) => id !== docId);
  recents.unshift(docId);
  // Keep only last 50
  saveJSON("recents", recents.slice(0, 50));
  return recents;
}

export function getRecents(limit = 10) {
  const ids = getRecentsRaw();
  const docs = getAllDocuments();
  const docMap = Object.fromEntries(docs.map((d) => [d.id, d]));
  return ids
    .slice(0, limit)
    .map((id) => docMap[id])
    .filter(Boolean);
}

/* ---------- RESET (dev convenience) ---------- */

export function resetAllData() {
  localStorage.removeItem(key("documents"));
  localStorage.removeItem(key("folders"));
  localStorage.removeItem(key("links"));
  localStorage.removeItem(key("recents"));
}