// src/screens/HomeScreen.jsx
import { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import Button from "../vertez/Button";
import DropdownMenu from "../vertez/DropdownMenu";
import Input from "../vertez/Input";
import Accordion from "../vertez/Accordion";
import Grid from "../vertez/Grid";
import ScreenContainer from "../components/ScreenContainer";
import { vertexThemeText, vertexThemeBG } from "../VertexStyles";
import SubTitle from "../vertez/SubTitle";
import Text from "../vertez/Text";
import { DocumentPreview, RecentlyEditedDocument, CreateDocument } from "./Documents"
import { useNavigate } from "react-router-dom";

/* -- HomeScreen: the main landing page showing all docs and folders -- */
export default function HomeScreen() {
  const navigate = useNavigate();

  const screenTitleStyling = [
    vertexThemeText.textPrimary,
    "flex",
    "text-[28px]", 
    "font-[600]", 
    "font-inter",
    "tracking-tight"
  ].join(" ");

  const recentlyAccessDocuments = [{
    isRecentDocumentType: true,
    InputComponent: CreateDocument,
  }, {
    documentName: 'Q4 Growth Strategy',
  }, {
    documentName: "Technical Analysis"
  }, {
    documentName: "Personal Notes: 2026"
  }];

  const userDocuments =  [{
    documentName: "Create ",
    InputComponent: CreateDocument,
  }, {
    documentName: 'Products Specs 4.0',
  }, {
    documentName: "Quarterly Report"
  }, {
    documentName: "Research Paper Long"
  }, {
    documentName: 'Meeting Minutes: Spring 4',
  }, {
    documentName: "Travel Literacy : Japan"
  }, {
    documentName: "Brand Style guide v4"
  }, {
    documentName: 'Products Specs 4.0',
  }, {
    documentName: "Quarterly Report"
  }]

  const navigateToDocument = (documentId) => navigate(`/document/${documentId}`);

  return (
    <ScreenContainer>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-[-15px]">
        <h1 className={screenTitleStyling}>
          Documents
        </h1>
      </div>
      <div>
        <div className="mb-[-20px] flex items-center justify-between">
          <SubTitle styles={{ flex: "flex" }}>
            Recently Accessed <Text styles={{ ml: "ml-[0px]", translate: "translate-y-[-15px]", scale: "scale-[90%]" }}> | Pick up where you left off</Text>
          </SubTitle>
        </div>
        <Grid gridData={recentlyAccessDocuments} gridItemOnClick={(e) => navigateToDocument(e)} GridItemComponent={RecentlyEditedDocument} gridDataKey={'documentName'} columns={'grid-cols-1'} customGridStyles={{ grid: '', flex: 'flex' }}/>
        <div className="flex justify-between my-[8px]">
          <SubTitle styles={{ flex: "flex gap-[15px]"}}>
            All documents
          </SubTitle>
          <DropdownMenu placeholderText={'Filter by Folder'} styles={{w: "w-[160px]", mt: "mt-[6.5px]", mr: "mr-[70px]", scale: "scale-[90%]"}}/>  
        </div>
        <Grid gridData={userDocuments} gridItemOnClick={navigateToDocument} GridItemComponent={DocumentPreview} gridDataKey={'documentName'} columns={'grid-cols-[repeat(auto-fit,minmax(177px,1fr))] '}/>
      </div>
    </ScreenContainer>
  );
}