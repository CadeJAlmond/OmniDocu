// src/screens/HomeScreen.jsx
import { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import Button from "../../vertez/Button";
import DropdownMenu from "../../vertez/DropdownMenu";
import Input from "../../vertez/Input";
import Accordion from "../../vertez/Accordion";
import Grid from "../../vertez/Grid";
import ScreenContainer from "../components/ScreenContainer";
import { vertexThemeText, vertexThemeBG } from "../../VertexStyles";

/* -- HomeScreen: the main landing page showing all docs and folders -- */

export default function HomeScreen() {
  const {
    state,
    addDoc,
    removeDoc,
    setFilterFolder,
    addFolder,
    removeFolder,
    linkDocToFolder,
    unlinkDocFromFolder,
    navigateToEditor,
    setSearchQuery,
  } = useApp();

  const [showNewDocForm, setShowNewDocForm] = useState(false);
  const [showNewFolderForm, setShowNewFolderForm] = useState(false);
  const [showFolderManager, setShowFolderManager] = useState(false);
  const [newDocName, setNewDocName] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [assignDocId, setAssignDocId] = useState(null);

  const { documents, folders, links, recents, filterFolderId, searchQuery } =
    state;

  /* Filter documents */
  const filteredDocs = useMemo(() => {
    let result = [...documents];

    // Filter by folder
    if (filterFolderId) {
      const linkedDocIds = links
        .filter((l) => l.folderId === filterFolderId)
        .map((l) => l.documentId);
      result = result.filter((d) => linkedDocIds.includes(d.id));
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((d) =>
        d.documentName.toLowerCase().includes(q)
      );
    }

    // Sort by lastEdited descending (most recent first)
    result.sort(
      (a, b) => new Date(b.lastEdited) - new Date(a.lastEdited)
    );

    return result;
  }, [documents, links, filterFolderId, searchQuery]);

  /* Handlers */
  const handleNewDoc = () => {
    if (!newDocName.trim()) return;
    addDoc({ documentName: newDocName.trim(), content: "", lastEdited: new Date().toISOString() });
    setNewDocName("");
    setShowNewDocForm(false);
  };

  const handleNewFolder = () => {
    if (!newFolderName.trim()) return;
    addFolder({ folderName: newFolderName.trim(), lastEdited: new Date().toISOString() });
    setNewFolderName("");
    setShowNewFolderForm(false);
  };

  const handleOpenDoc = (doc) => {
    navigateToEditor(doc.id);
  };

  /* Folder chips for a document */
  const docFolderChips = (docId) => {
    const folderIds = links.filter((l) => l.documentId === docId).map((l) => l.folderId);
    const folderNames = folders
      .filter((f) => folderIds.includes(f.id))
      .map((f) => f.folderName);
    if (folderNames.length === 0) return <span className="text-[12px] text-[#4a4455]">No folder</span>;
    return (
      <div className="flex flex-wrap gap-[4px] mt-[4px]">
        {folderNames.map((name) => (
          <span
            key={name}
            className="inline-block px-[6px] py-[1px] text-[11px] rounded-[2px] bg-[#f3e8ff] text-[#6D28D9]"
          >
            {name}
          </span>
        ))}
      </div>
    );
  };

  return (
    <ScreenContainer>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-[24px]">
        <h1 className="text-[32px] font-[600] font-inter text-[#141b2b] tracking-tight">
          Advance Docs
        </h1>
        <div className="flex items-center gap-[8px]">
          <Button onClick={() => setShowNewFolderForm(true)}>+ Folder</Button>
          <Button onClick={() => setShowNewDocForm(true)}>+ New Doc</Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-[20px] max-w-[400px]">
        <Input
          name="search"
          value={searchQuery}
          formValueUpdate={(val) => setSearchQuery(val.target.value)}
          placeholder="Search documents..."
        />
      </div>

      {/* Folder filter + View toggle */}
      <div className="flex items-center gap-[12px] mb-[24px] flex-wrap">
        <span className="text-[14px] text-[#4a4455] font-medium">Filter:</span>
        {filterFolderId && (
          <Button
            onClick={() => setFilterFolder(null)}
            styles={{
              bg: "bg-[#f3e8ff]",
              color: "text-[#6D28D9]",
              h: "min-h-[32px] max-h-[32px]",
              px: "px-[12px]",
              text: "text-[14px]",
              border: "rounded-[4px]",
            }}
          >
            × Clear filter
          </Button>
        )}
        <DropdownMenu
          placeholderText="All Folders"
          items={folders.map((f) => ({
            label: f.folderName,
            onSelect: () => setFilterFolder(f.id),
          }))}
        />
      </div>

      {/* Recents section */}
      {recents.length > 0 && (
        <div className="mb-[32px]">
          <h2 className="text-[20px] font-[600] text-[#141b2b] mb-[12px] font-inter">
            Recents
          </h2>
          <div className="flex flex-wrap gap-[8px]">
            {recents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-[8px] px-[12px] py-[8px] bg-[#ffffff] border border-[#E5E7EB] rounded-[4px] cursor-pointer hover:border-[#6D28D9] transition-colors"
                onClick={() => handleOpenDoc(doc)}
              >
                <span className="text-[14px] text-[#141b2b]">
                  {doc.documentName}
                </span>
                <span className="text-[12px] text-[#4a4455]">
                  {new Date(doc.lastEdited).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Folder manager (bottom section) */}
      {showFolderManager && (
        <div className="mb-[24px] border border-[#E5E7EB] rounded-[4px] p-[16px] bg-[#ffffff]">
          <div className="flex items-center justify-between mb-[12px]">
            <h3 className="text-[16px] font-[600] text-[#141b2b]">Folders</h3>
            <Button
              onClick={() => setShowFolderManager(false)}
              styles={{
                bg: "bg-transparent",
                text: "text-[14px] text-[#4B5563]",
                h: "min-h-[32px]",
                px: "px-[8px]",
                rounded: "rounded-[4px]",
              }}
            >
              Close
            </Button>
          </div>
          {folders.filter((f) => f.id !== "default").map((folder) => (
            <div
              key={folder.id}
              className="flex items-center justify-between py-[8px] border-b border-[#E5E7EB] last:border-0"
            >
              <span className="text-[14px] text-[#141b2b]">{folder.folderName}</span>
              <div className="flex gap-[8px]">
                <Button
                  onClick={() => setShowNewDocForm(true)}
                  styles={{
                    bg: "bg-transparent",
                    text: "text-[13px] text-[#6D28D9]",
                    border: "border border-[#6D28D9]",
                    h: "min-h-[32px]",
                    px: "px-[12px]",
                    rounded: "rounded-[4px]",
                  }}
                >
                  + Assign Doc
                </Button>
                <Button
                  onClick={() => removeFolder(folder.id)}
                  styles={{
                    bg: "bg-transparent",
                    text: "text-[13px] text-[#ba1a1a]",
                    border: "border border-[#ba1a1a]",
                    h: "min-h-[32px]",
                    px: "px-[12px]",
                    rounded: "rounded-[4px]",
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
          {/* New folder inline form */}
          <div className="mt-[12px] flex gap-[8px]">
            <Input
              name="newFolder"
              value={newFolderName}
              formValueUpdate={(e) => setNewFolderName(e.target.value)}
              placeholder="New folder name..."
              styles={{ flex: "flex-1" }}
            />
            <Button onClick={handleNewFolder}>Create</Button>
          </div>
        </div>
      )}

      {/* All Documents Grid */}
      <h2 className="text-[20px] font-[600] text-[#141b2b] mb-[12px] font-inter">
        {filterFolderId ? "Filtered Documents" : "All Documents"}
      </h2>

      {filteredDocs.length === 0 ? (
        <div className="text-center py-[48px] text-[#4a4455]">
          <p className="text-[16px] mb-[8px]">No documents found</p>
          <p className="text-[14px]">Create a new document to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[16px]">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-[#ffffff] border border-[#E5E7EB] rounded-[8px] p-[16px] cursor-pointer hover:shadow-[0_4px_12px_rgba(17,24,39,0.05)] transition-shadow"
              onClick={() => handleOpenDoc(doc)}
            >
              <div className="text-[16px] font-medium text-[#141b2b] mb-[4px]">
                {doc.documentName}
              </div>
              <div className="text-[12px] text-[#4a4455] mb-[8px]">
                Modified: {new Date(doc.lastEdited).toLocaleDateString()}
              </div>
              {docFolderChips(doc.id)}
              {/* Dropdown for assign/delete */}
              <div className="mt-[8px] flex gap-[4px]">
                <DropdownMenu
                  placeholderText="Actions"
                  items={[
                    {
                      label: "Assign to Folder",
                      ItemComponent: (props) => (
                        <li
                          {...props}
                          className="px-[12px] py-[6px] cursor-pointer hover:bg-[#f3e8ff] text-[14px] text-[#141b2b]"
                        >
                          {folders.map((f) => (
                            <div
                              key={f.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                const docLinks = links.filter(
                                  (l) => l.documentId === doc.id
                                );
                                const isLinked = docLinks.some(
                                  (l) => l.folderId === f.id
                                );
                                if (isLinked) {
                                  unlinkDocFromFolder(doc.id, f.id);
                                } else {
                                  linkDocToFolder(doc.id, f.id);
                                }
                              }}
                            >
                              {f.folderName}{" "}
                              {links.some(
                                (l) => l.documentId === doc.id && l.folderId === f.id
                              )
                                ? "✓"
                                : ""}
                            </div>
                          ))}
                        </li>
                      ),
                    },
                    {
                      label: "Delete",
                      onSelect: () => removeDoc(doc.id),
                    },
                  ]}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Document Modal */}
      {showNewDocForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[4px] flex items-center justify-center z-50">
          <div className="bg-[#ffffff] rounded-[8px] p-[24px] w-[400px] max-w-[90vw] shadow-[0_8px_32px_rgba(17,24,39,0.1)]">
            <h3 className="text-[18px] font-[600] text-[#141b2b] mb-[16px]">
              New Document
            </h3>
            <Input
              name="docName"
              value={newDocName}
              formValueUpdate={(e) => setNewDocName(e.target.value)}
              placeholder="Document name..."
              styles={{ flex: "flex-1" }}
            />
            <div className="flex justify-end gap-[8px] mt-[16px]">
              <Button
                onClick={() => {
                  setShowNewDocForm(false);
                  setNewDocName("");
                }}
                styles={{
                  bg: "bg-transparent",
                  text: "text-[14px] text-[#4B5563]",
                  border: "border border-[#E5E7EB]",
                  h: "min-h-[36px]",
                  px: "px-[16px]",
                  rounded: "rounded-[4px]",
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleNewDoc}>Create</Button>
            </div>
          </div>
        </div>
      )}

      {/* New Folder Modal */}
      {showNewFolderForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[4px] flex items-center justify-center z-50">
          <div className="bg-[#ffffff] rounded-[8px] p-[24px] w-[400px] max-w-[90vw] shadow-[0_8px_32px_rgba(17,24,39,0.1)]">
            <h3 className="text-[18px] font-[600] text-[#141b2b] mb-[16px]">
              New Folder
            </h3>
            <Input
              name="folderName"
              value={newFolderName}
              formValueUpdate={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name..."
              styles={{ flex: "flex-1" }}
            />
            <div className="flex justify-end gap-[8px] mt-[16px]">
              <Button
                onClick={() => {
                  setShowNewFolderForm(false);
                  setNewFolderName("");
                }}
                styles={{
                  bg: "bg-transparent",
                  text: "text-[14px] text-[#4B5563]",
                  border: "border border-[#E5E7EB]",
                  h: "min-h-[36px]",
                  px: "px-[16px]",
                  rounded: "rounded-[4px]",
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleNewFolder}>Create</Button>
            </div>
          </div>
        </div>
      )}
    </ScreenContainer>
  );
}