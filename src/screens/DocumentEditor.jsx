// src/screens/DocumentEditor.jsx
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import Button from "../vertez/Button";
import DropdownMenu from "../vertez/DropdownMenu";

/* -- DocumentEditor: viewing and editing modes with Traditional/Markdown view type -- */

export default function DocumentEditor() {
  const { docId } = useParams();
  const navigate = useNavigate();
  const {
    state,
    updateDoc,
    setEditorMode,
    setEditorViewType,
    removeDoc,
  } = useApp();

  const doc = state.documents.find((d) => d.id === docId);
  const isEditing = state.editorMode === "editing";
  const isTraditional = state.editorViewType === "traditional";

  const [localContent, setLocalContent] = useState("");
  const textareaRef = useRef(null);

  /* Load doc content when doc changes */
  useEffect(() => {
    if (doc) {
      setLocalContent(doc.content || "");
    }
  }, [doc]);

  /* Redirect if doc not found */
  useEffect(() => {
    if (!doc && state.documents.length > 0) {
      navigate("/");
    }
  }, [doc, navigate, state.documents]);

  if (!doc) {
    return (
      <div className="max-w-[820px] mx-auto py-[40px] px-[40px]">
        <div className="text-center py-[48px] text-[#4a4455]">
          <p className="text-[16px]">Document not found.</p>
          <Button onClick={() => navigate("/")} className="mt-[16px]">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  /* Render content as styled HTML for viewing / traditional preview */
  const renderStyledContent = (content) => {
    if (!content) return <p className="text-[#4a4455] italic">Empty document.</p>;

    const lines = content.split("\n");
    const elements = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i].trim();

      if (line.startsWith("# ") && !line.startsWith("## ") && !line.startsWith("### ")) {
        elements.push(
          <h1 key={i} className="text-[32px] font-[700] text-[#141b2b] mb-[12px] leading-[40px] tracking-tight font-inter">
            {line.slice(2)}
          </h1>
        );
      } else if (line.startsWith("## ")) {
        elements.push(
          <h2 key={i} className="text-[24px] font-[600] text-[#141b2b] mb-[10px] leading-[32px] font-inter">
            {line.slice(3)}
          </h2>
        );
      } else if (line.startsWith("### ")) {
        elements.push(
          <h3 key={i} className="text-[20px] font-[600] text-[#141b2b] mb-[8px] leading-[28px] font-inter">
            {line.slice(4)}
          </h3>
        );
      } else if (line === "") {
        elements.push(<br key={i} />);
      } else {
        let processed = line;
        const boldParts = processed.split(/(\*\*[^*]+\*\*)/);
        processed = boldParts.map((part, idx) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={idx} className="font-semibold text-[#141b2b]">
                {part.slice(2, -2)}
              </strong>
            );
          }
          const underlineParts = part.split(/(__[^_]+__)/);
          return underlineParts.map((uPart, uIdx) => {
            if (uPart.startsWith("__") && uPart.endsWith("__")) {
              return (
                <u key={`${idx}-${uIdx}`} className="text-[#141b2b]">
                  {uPart.slice(2, -2)}
                </u>
              );
            }
            return <span key={`${idx}-${uIdx}`}>{uPart}</span>;
          });
        });
        elements.push(
          <p key={i} className="text-[18px] text-[#141b2b] leading-[30px] font-sourceSerif mb-[8px]">
            {processed}
          </p>
        );
      }
      i++;
    }

    return <div className="font-sourceSerif">{elements}</div>;
  };

  /* Handlers */
  const handleSave = () => {
    updateDoc({ ...doc, content: localContent });
  };

  const handleDelete = () => {
    removeDoc(doc.id);
    navigate("/");
  };

  /* Word / character count */
  const wordCount = localContent.trim()
    ? localContent.trim().split(/\s+/).length
    : 0;
  const charCount = localContent.length;

  return (
    <div className="max-w-[820px] mx-auto py-[40px] px-[40px]">
      {/* Editor toolbar */}
      <div className="flex items-center justify-between mb-[24px] pb-[16px]">
        <div className="flex items-center gap-[12px]">
          <Button
            onClick={() => navigate("/")}
            styles={{
              bg: "bg-transparent",
              text: "text-[14px] text-[#4B5563]",
              h: "min-h-[36px]",
              px: "px-[16px]",
              rounded: "rounded-[4px]",
            }}
          >
            ← Home
          </Button>
          <h1 className="text-[20px] font-[600] text-[#141b2b] font-inter">
            {doc.documentName}
          </h1>
        </div>
        <div className="flex items-center gap-[8px]">
          <Button
            onClick={handleDelete}
            styles={{
              bg: "bg-transparent",
              text: "text-[14px] text-[#ba1a1a]",
              h: "min-h-[36px]",
              px: "px-[16px]",
              rounded: "rounded-[4px]",
            }}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* View toggle + view type — moved from sidebar to toolbar */}
      <div className="flex items-center gap-[12px] mb-[24px] flex-wrap">
        <div className="flex gap-[2px] bg-[#f1f3ff] rounded-[4px] p-[2px]">
          <button
            onClick={() => setEditorMode("viewing")}
            className={`flex-1 py-[6px] px-[12px] text-[13px] font-medium rounded-[4px] transition-colors ${
              state.editorMode === "viewing"
                ? "bg-[#f3e8ff] text-[#6D28D9]"
                : "text-[#4a4455] hover:text-[#141b2b]"
            }`}
          >
            Viewing
          </button>
          <button
            onClick={() => setEditorMode("editing")}
            className={`flex-1 py-[6px] px-[12px] text-[13px] font-medium rounded-[4px] transition-colors ${
              state.editorMode === "editing"
                ? "bg-[#f3e8ff] text-[#6D28D9]"
                : "text-[#4a4455] hover:text-[#141b2b]"
            }`}
          >
            Editing
          </button>
        </div>

        {isEditing && (
          <div className="flex gap-[2px] bg-[#f1f3ff] rounded-[4px] p-[2px]">
            <button
              onClick={() => setEditorViewType("traditional")}
              className={`flex-1 py-[5px] px-[8px] text-[13px] font-medium rounded-[4px] transition-colors ${
                isTraditional
                  ? "bg-[#f3e8ff] text-[#6D28D9]"
                  : "text-[#4a4455] hover:text-[#141b2b]"
              }`}
            >
              Traditional
            </button>
            <button
              onClick={() => setEditorViewType("markdown")}
              className={`flex-1 py-[5px] px-[8px] text-[13px] font-medium rounded-[4px] transition-colors ${
                !isTraditional
                  ? "bg-[#f3e8ff] text-[#6D28D9]"
                  : "text-[#4a4455] hover:text-[#141b2b]"
              }`}
            >
              Markdown
            </button>
          </div>
        )}
      </div>

      {/* Viewing mode */}
      {state.editorMode === "viewing" && (
        <div className="screen-enter">
          <h1 className="text-[32px] font-[700] text-[#141b2b] mb-[24px] tracking-tight font-inter leading-[40px]">
            {doc.documentName}
          </h1>
          <div className="text-[14px] text-[#4a4455] mb-[32px]">
            Last edited: {new Date(doc.lastEdited).toLocaleString()}
          </div>
          <div className="">
            {renderStyledContent(doc.content)}
          </div>
        </div>
      )}

      {/* Editing mode — Traditional (textarea + live HTML preview) */}
      {state.editorMode === "editing" && isTraditional && (
        <div className="screen-enter flex flex-col gap-[16px]">
          <input
            type="text"
            value={doc.documentName}
            onChange={(e) =>
              updateDoc({ ...doc, documentName: e.target.value })
            }
            className="w-full text-[24px] font-[600] text-[#141b2b] border-none outline-none bg-transparent font-inter leading-[32px]"
            placeholder="Document title..."
          />
          <div className="flex-1 flex gap-[16px]">
            <textarea
              ref={textareaRef}
              value={localContent}
              onChange={(e) => setLocalContent(e.target.value)}
              className="flex-1 w-full p-[16px] text-[16px] font-sourceSerif leading-[28px] text-[#141b2b] bg-transparent border-none outline-none resize-none font-inter"
              placeholder="Start writing..."
              spellCheck
            />
            <div className="flex-1 pt-[16px]">
              <span className="text-[12px] text-[#4a4455] uppercase tracking-wide mb-[8px] block">
                Preview
              </span>
              <div className="doc-canvas">
                {renderStyledContent(localContent)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Editing mode — Markdown (plain textarea only) */}
      {state.editorMode === "editing" && !isTraditional && (
        <div className="screen-enter flex flex-col gap-[16px]">
          <input
            type="text"
            value={doc.documentName}
            onChange={(e) =>
              updateDoc({ ...doc, documentName: e.target.value })
            }
            className="w-full text-[24px] font-[600] text-[#141b2b] border-none outline-none bg-transparent font-inter leading-[32px]"
            placeholder="Document title..."
          />
          <textarea
            ref={textareaRef}
            value={localContent}
            onChange={(e) => setLocalContent(e.target.value)}
            className="flex-1 w-full p-[16px] text-[16px] font-sourceSerif leading-[28px] text-[#141b2b] bg-transparent border-none outline-none resize-none"
            placeholder="Write in Markdown..."
            spellCheck
          />
        </div>
      )}

      {/* Footer bar — save + word/character count */}
      <div className="flex items-center justify-between pt-[16px] mt-[16px]">
        <div className="flex gap-[16px] text-[12px] text-[#4a4455]">
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
        </div>
        <Button
          onClick={handleSave}
          styles={{
            bg: "bg-[#6D28D9]",
            text: "text-[14px] text-[#ffffff]",
            h: "min-h-[36px]",
            px: "px-[20px]",
            rounded: "rounded-[4px]",
          }}
        >
          Save
        </Button>
      </div>
    </div>
  );
}
