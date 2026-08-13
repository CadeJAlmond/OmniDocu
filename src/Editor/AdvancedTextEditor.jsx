/* --=== Imports ===-- */
// --() State Management
import { useEffect, useState } from "react";

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
// import TableOfContentsPlugin from "./TableOfContentsPlugin";
import EmbeddedLinkPlugin from "./EmbeddedLinksPlugin";
// import MentionsPlugin from "./MentionsPlugin";

//   - Custom Nodes
// import { EmbeddedLinkNode } from "./EmbeddedLinkNode";
import { HeadingNode } from "@lexical/rich-text";
import DropdownMenu from "../vertez/DropdownMenu";
// import { MentionNode } from "./MentionsNode";
import { useNavigate } from "react-router-dom";

export const punctuation = ["!", "?", ".", ","];

// Removes punctuation from a given word
// (Useful for detecting embedded links even if they have punctuation )
export const removePunctuationFromWord = (word) =>
  punctuation.includes(word.at(-1)) ? word.substring(0, word.length - 1) : word;

/**
 * 
 */
export default function AdvancedTextEditor({ documentName }) {
  //--- Compile the editor ---//
  const viewModes = ["Standard", "Markdown", "Display"];

  const [viewMode, setViewMode] = useState(viewModes[0]);
  const navigate = useNavigate();

  const navigateHome = () => navigate(`/`);

  const updateViewMode = (e) => {
    setViewMode(e.event.value);
  };

  //##--- Setup for the Lexical Text Editor ---##//
  function onError(error) {
    console.error(error);
  }

  const theme = {};

  const emptyEditorState =
    '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}';

  const SetupInitialState = () => {
    return emptyEditorState;
  };

  // Describes the settings for the Text Editor
  const initialConfig = {
    namespace: "MyEditor",
    theme,
    onError,
    editorState: SetupInitialState(),
    nodes: [],
  };

  /** Saves all edited chapters to the database */
  const saveEditorText = async () => {};

  /** Save all changes made to a chapter **/
  const onChange = (editorState) => {
    const editorStateToText = JSON.stringify(editorState);
  };

  return (
    <div className="flex gap-[2vw]">
      <div
        className={"text-[#fff] ml-[-2vw] min-w-min mt-[0vh] mt-[20px]"}
      >
        <LexicalComposer initialConfig={initialConfig} key="TEXT-EDITOR">
          {/* <TableOfContentsPlugin/> */}
          <div className="w-[750px] bg-[#f6f6f6] rounded-t-[25px]">
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
        </LexicalComposer>
      </div>
      <div className="">
        <h2 className="text-[#fff] tracking-[0.75px] text-[32px] border-b-[3px] border-b-[#96A8DD]/80 no-wrap h-[46px]">
          {documentName}
          <span className="absolute ml-[20px] mt-[18px] text-[#fff] text-[18px] cursor-pointer hover:opacity-[80%]" onClick={()=> navigateHome()}>| Home</span>
        </h2>
        <p className="text-[#fff]">View Mode: </p>
        <DropdownMenu
          styles={{ w: "w-[200px]", m: "mt-[-10px]" }}
          items={viewModes}
          selectedItem={viewMode}
          onSelectionChange={updateViewMode}
        />
      </div>
    </div>
  );
}
