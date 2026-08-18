import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
} from "lexical";

import { $wrapNodes, $isAtNodeEnd } from "@lexical/selection";

import { $getNearestNodeOfType, mergeRegister } from "@lexical/utils";
import { $isListNode, ListNode } from "@lexical/list";

import { $createHeadingNode, $isHeadingNode } from "@lexical/rich-text";

import UndoIcon from '../images/icons/arrow-counterclockwise.svg'
import RedoIcon from '../images/icons/arrow-clockwise.svg'
import BoldIcon from '../images/icons/type-bold.svg'
import ItalicIcon from '../images/icons/type-italic.svg'
import SaveIcon from '../images/icons/save.svg'
import DropdownMenu from "../vertez/DropdownMenu";

const LowPriority = 1;

const supportedBlockTypes = new Set([
  "paragraph",
  "quote",
  "code",
  "h1",
  "h2",
  "ul",
  "ol"
]);

const blockTypeToBlockName = {
  h1: "Large Heading",
  h2: "Small Heading",
  ol: "Numbered List",
  paragraph: "Normal",
};

const alignmentOptions = ["Left", "Center", "Right"];
const viewModes = ["Standard", "Markdown", "Display"];

const blockTypeOptions = [
  { value: "paragraph", label: "Normal" },
  { value: "h1", label: "Large Heading" },
  { value: "h2", label: "Small Heading" },
];

function Divider() {
  return <div className="divider" />;
}

function getSelectedNode(selection) {
  const anchor = selection.anchor;
  const focus = selection.focus;
  const anchorNode = selection.anchor.getNode();
  const focusNode = selection.focus.getNode();
  if (anchorNode === focusNode) {
    return anchorNode;
  }
  const isBackward = selection.isBackward();
  if (isBackward) {
    return $isAtNodeEnd(focus) ? anchorNode : focusNode;
  } else {
    return $isAtNodeEnd(anchor) ? focusNode : anchorNode;
  }
}

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [blockType, setBlockType] = useState("paragraph");
  const [selectedElementKey, setSelectedElementKey] = useState(null);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [showHelpMenu, setShowHelpMenu] = useState(false);
  const [isEdited, setIsEdited] = useState(false);
  const [viewMode, setViewMode] = useState(viewModes[0]);
  const [activeAlign, setActiveAlign] = useState("Left");

  // Handle editor changes to track save status
  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();
      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);
      if (elementDOM !== null) {
        setSelectedElementKey(elementKey);
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType(anchorNode, ListNode);
          const type = parentList ? parentList.getTag() : element.getTag();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          setBlockType(type);
        }
      }
      // Update text format
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));

      // Update links
      const node = getSelectedNode(selection);
      const parent = node.getParent();
    }
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
        // Mark as edited when there's an update
        setIsEdited(true);
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, newEditor) => {
          updateToolbar();
          return false;
        },
        LowPriority
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        LowPriority
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        LowPriority
      )
    );
  }, [editor, updateToolbar]);

  const editButtonStyling = [
    "min-w-[40px] w-[40px] bg-[#141418]/95 hover:bg-[#323f66]/100 border-0 cursor-pointer"
  ].join(" ");

  const iconStyling = "invert-[0.95]";

  const handleSaveClick = () => {
    setIsEdited(false);
    // Trigger save action here if needed
  };

  const handleViewModeChange = (eventData) => {
    setViewMode(eventData.event.value);
    // For now, selecting a view mode does nothing functionally
    // This is a placeholder for future implementation
  };

  const handleAlignmentChange = (eventData) => {
    const value = eventData.event.value;
    const alignValue = value.toLowerCase();
    setActiveAlign(value);
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, alignValue);
  };

  const handleBlockTypeChange = (eventData) => {
    const value = eventData.event.value.toLowerCase();
    if (value !== blockType) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const targetType = value === "large heading" ? "h1" :
                            value === "small heading" ? "h2" : "paragraph";

          if (targetType === "paragraph") {
            $wrapNodes(selection, () => $createParagraphNode());
          } else if (targetType === "h1") {
            $wrapNodes(selection, () => $createHeadingNode("h1"));
          } else if (targetType === "h2") {
            $wrapNodes(selection, () => $createHeadingNode("h2"));
          }
        }
      });
      setBlockType(value === "large heading" ? "h1" :
                  value === "small heading" ? "h2" : "paragraph");
    }
  };

  const dropdownMenuStyling = { 
    w: "w-[100%]", h: "h-[28px]", b: "border-[0px]", hover: "hover:bg-[#323f66]/100", rounded: "rounded-[0px]",
    menu: { mt: "mt-[-2px]" }, 
    label: { mt: "mt-[3px]", w: "w-[120px]", mr: "mr-[40px]", ml: "ml-[5px]" } 
  }

  return (
    <div className="w-[740px] mb-[-15px] flex h-[28px] bg-[#141418]/95 border-[#96A8DD]/60 border-[2px] border-b-[0px] rounded-t-[10px] px-[3px]" ref={toolbarRef}>
      <button
        disabled={!canUndo}
        onClick={() => {
          editor.dispatchCommand(UNDO_COMMAND);
        }}
        className={editButtonStyling}
        aria-label="Undo"
      >
        <i className="format undo" />
        <img src={UndoIcon} className={iconStyling}/>
      </button>
      <button
        disabled={!canRedo}
        onClick={() => {
          editor.dispatchCommand(REDO_COMMAND);
        }}
        className={editButtonStyling}
        aria-label="Redo"
      >
        <i className="format redo" />
        <img src={RedoIcon} className={iconStyling}/>
      </button>
      <Divider />
      {supportedBlockTypes.has(blockType) && (
        <>
          {/* Block Type Dropdown - using custom DropdownMenu from vertez */}
          <div className="w-[173px]">
            <DropdownMenu
              items={blockTypeOptions.map(item => item.label)}
              selectedItem={blockTypeToBlockName[blockType] || "Normal"}
              onSelectionChange={handleBlockTypeChange}
              styles={dropdownMenuStyling}
            />
          </div>
          <Divider />
        </>
      )}
      <>
        <button
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
          }}
          className={editButtonStyling}
          aria-label="Format Bold"
        >
          <i className="format bold " />
          <img src={BoldIcon} className={iconStyling}/>
        </button>
        <button
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
          }}
          className={editButtonStyling}
          aria-label="Format Italics"
        >
          <i className="format italic" />
          <img src={ItalicIcon} className={iconStyling}/>
        </button>
        <Divider />

        {/* Alignment Dropdown - using custom DropdownMenu from vertez */}
        <div className="alignment-dropdown w-[163px]">
          <DropdownMenu
            items={alignmentOptions}
            selectedItem={'alignment'}
            onSelectionChange={handleAlignmentChange}
            styles={dropdownMenuStyling}
          />
        </div>

        {/* View Mode Dropdown - using custom DropdownMenu from vertez */}
        <div className="view-mode-dropdown w-[163px]">
          <DropdownMenu
            items={viewModes}
            selectedItem={'view mode'}
            onSelectionChange={handleViewModeChange}
            styles={dropdownMenuStyling}
          />
        </div>

        {/* Save Button with flash animation */}
        <button
          onClick={handleSaveClick}
          className={editButtonStyling + " relative"}
          aria-label="Save"
        >
          <i className="format save" />
          <img src={SaveIcon} className={iconStyling}/>
          {/* Flash animation when there are unsaved changes */}
          {isEdited && (
            <span className="absolute -top-[2px] -right-[2px] w-[8px] h-[8px] bg-blue-500 rounded-full animate-ping opacity-75"></span>
          )}
        </button>

        <button className={editButtonStyling + " text-[#fff]"} onClick={() => setShowHelpMenu(!showHelpMenu)}>
          ?
        </button>
      </>
      { showHelpMenu &&
      <div className={"help-section-invisible bg-transparent"}>
        <p className="bg-transparent" onClick={() => setShowHelpMenu(!showHelpMenu)}>Close ( X )</p>
      </div>
      }
    </div>
  );
}