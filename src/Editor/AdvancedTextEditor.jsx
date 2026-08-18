/* --=== Imports ===-- */
// --() State Management
import { useEffect, useState, useRef } from "react";

// --() Lexical text editor
import { LexicalComposer } from "@lexical/react/LexicalComposer";

//   - Lexical Plugins
import LexicalEditorTopBar from "./ToolBarPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { TableOfContentsPlugin } from "@lexical/react/LexicalTableOfContentsPlugin";

//   - Custom Plugins
import EmbeddedLinkPlugin from "./EmbeddedLinksPlugin";

//   - Custom Nodes
import { HeadingNode } from "@lexical/rich-text";
import DropdownMenu from "../vertez/DropdownMenu";
import { useNavigate } from "react-router-dom";

export const punctuation = ["!", "?", ".", ","];

// Removes punctuation from a given word
// (Useful for detecting embedded links even if they have punctuation )
export const removePunctuationFromWord = (word) =>
  punctuation.includes(word.at(-1)) ? word.substring(0, word.length - 1) : word;

/**
 * Advanced Text Editor component using Lexical
 * @param {Object} props - Component props
 * @param {string} props.documentName - Name/title of the document
 */
export default function AdvancedTextEditor({ documentName }) {
  //--- Compile the editor ---//
  const viewModes = ["Standard", "Markdown", "Display"];

  const [viewMode, setViewMode] = useState(viewModes[0]);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const navigate = useNavigate();

  const navigateHome = () => navigate(`/`);

  const updateViewMode = (e) => {
    setViewMode(e.event.value);
  };

  //##--- Setup for the Lexical Text Editor ---##//
  function onError(error) {
    console.error(error);
  }

  const theme = {
    // Add minimal theme to avoid issues
  };

  const emptyEditorState =
    '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}';

  // Describes the settings for the Text Editor
  const initialConfig = {
    namespace: "MyEditor",
    theme,
    onError,
    editorState: emptyEditorState,
    nodes: [HeadingNode],
  };

  /** Saves all edited chapters to the database */
  const saveEditorText = async () => { };
  const tocRef = useRef(null);
  const [tableOfContents, setTableOfContents] = useState([]);

  /**
   * Custom handler for table of contents updates
   * This avoids the "children is not a function" error
   */
  const handleTocChange = (toc) => {
    setTableOfContents(toc || []);
    if (tocRef.current) {
      // Update the DOM element safely
      try {
        tocRef.current.innerHTML = "";
        if (Array.isArray(toc) && toc.length > 0) {
          toc.forEach((item) => {
            const [textRowNumber, text, elementType] = item;

            const entry = document.createElement("div");
            entry.className = "toc-entry";
            entry.innerHTML = `<a href="#${item._key || item.key || ''}" class="text-blue-400 hover:text-blue-300 block py-1">${item.type || ''} - ${item.title || 'Untitled'}</a>`;
            tocRef.current.appendChild(entry);
          });
        } else {
          const message = document.createElement("p");
          message.className = "text-gray-500 text-sm";
          message.textContent = "";
          tocRef.current.appendChild(message);
        }
      } catch (err) {
        console.warn("Failed to update TOC DOM:", err);
      }
    }
  };

  const onChange = (editorState) => {
    const editorStateToText = JSON.stringify(editorState);
  };

  return (
    <div className="flex">
      <div
        className={"flex gap-[2vw] text-[#fff] ml-[-2vw] min-w-min mt-[0vh] mt-[20px]"}
      >
        <LexicalComposer initialConfig={initialConfig} key="TEXT-EDITOR" className="flex">
          {/** Table of Contents Plugin - safely implemented */}
          <TableOfContentsPlugin>
            {(toc) => {
              try {
                handleTocChange(toc);
              } catch (err) {
                console.warn("TOC update error:", err);
              }
              return null;
            }}
          </TableOfContentsPlugin>
          {/** Table of Contents - implemented without throwing errors */}
          <section className="flex gap-[20px]">
            <div className="bg-[#141418]/90 p-3 border-b border-[#96A8DD]/30 overflow-y-auto max-h-[150px]">
              <h4 className="text-[#fff] text-xs font-semibold mb-2">CONTENTS</h4>
              <div ref={tocRef} className="text-sm">
                <p className="text-gray-500 text-xs">Loading table of contents...</p>
              </div>
            </div>
            <div className="text-[#1a1a1a] w-[750px] bg-[#f6f6f6] rounded-t-[25px]">
              {/** The "Top bar" of the editor */}
              <LexicalEditorTopBar />
              {/** The main / default plugin for setting up the basic editor **/}
              <RichTextPlugin
                contentEditable={
                  <ContentEditable className="h-[87.5vh] w-[100%]" />
                }
              />
            </div>
            <>
              <OnChangePlugin onChange={onChange} />
              <HistoryPlugin />
            </>
          </section>
        </LexicalComposer>
        <div className="ml-[20px]">
          <h2 className="text-[#fff] tracking-[0.75px] text-[32px] border-b-[3px] border-b-[#96A8DD]/80 no-wrap h-[46px]">
            {documentName}
            <span className="absolute ml-[20px] mt-[18px] text-[#fff] text-[18px] cursor-pointer hover:opacity-[80%]" onClick={() => navigateHome()}>| Home</span>
          </h2>
        </div>
      </div>
    </div>
  );
}