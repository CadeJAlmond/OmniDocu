// src/screens/DocumentEditor.jsx
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import Button from "../vertez/Button";
import DropdownMenu from "../vertez/DropdownMenu";
import AdvancedTextEditor  from "./AdvancedTextEditor"
import ScreenContainer from "../components/ScreenContainer";
/* -- DocumentEditor: viewing and editing modes with Traditional/Markdown view type -- */

export default function DocumentEditor() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const emptyEditorState =
    '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}';

  return (
    <ScreenContainer>
      <AdvancedTextEditor
        documentName={documentId}
      />
    </ScreenContainer>
  );
}
