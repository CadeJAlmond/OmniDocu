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
import { router } from "../routes";

const editDateTextStyling = [vertexThemeText.textNormal, "text-[12px]"].join(" ")
const documentTitleNameStyling = [vertexThemeText.textPrimary, "font-bold", "text-[14px]", "mt-[0px] mb-[4px]"].join(" ")

/* -- HomeScreen: the main landing page showing all docs and folders -- */

function CreateDocument({ isRecentDocumentType = false, onClick }) {
  const containerSize = isRecentDocumentType ? " h-[180px] w-[180px] rounded-[8px] " : " min-h-[160px] ";
  const containerStyling = [
    "cursor-pointer bg-[#29221f]/60 border border-[#d96b27]/50 px-[16px] py-[16px] rounded-[2px] flex flex-col gap-[15px]" , containerSize 
  ].join(" ");
  const documentTitleNameStyling = [vertexThemeText.textSecondary, "font-[500]", "tracking-[0.33px]", "text-[14px]", "mt-[12px] mb-[4px]"].join(" ")

  return (
    <div className={containerStyling} onClick={(e)=> onClick(" ")}>
      <div className="w-[100%] h-[40%] rounded-[5px]"></div>
      <div className="text-[#f5f1ed] text-[45px] bg-[#29221f]/60 max-w-[40px] h-[40px] rounded-[50%] border-[#d96b27]/50 border-[0.5px]">
        <p className="m-[0] translate-y-[-12px] translate-x-[4px]">+</p>
      </div>
      <div className="border-t border-[#382e29] h-[40px]">
        <h4 class={documentTitleNameStyling}>Create new document</h4>
      </div>
    </div>
  );
}

function RecentlyEditedDocument({ documentName, onClick }) {
  return (
    <div className="cursor-pointer bg-[#29221f]/60 border border-[#382e29] rounded-[8px] px-[16px] py-[16px] h-[180px] w-[180px] rounded-[2px] flex flex-col gap-[15px]"
      onClick={(e)=> onClick(documentName)}
    >
      <div className="w-[100%] h-[100%] rounded-[5px] "></div>
      <div className="flex flex-col gap-[6.5px]">
        <h4 class={documentTitleNameStyling}>{documentName}</h4>
        <span class="text-[10px] text-[#d96b27] font-bold uppercase tracking-widest">
          [ Folder Name ]
        </span>
        <div class=" border-t border-[#382e29]">
        <span class={editDateTextStyling}>
            Edited Oct 15, 2023
          </span>
        </div>
      </div>
    </div>
  );
}

function DocumentPreview({ documentName, folders = [], onClick }) {
  return (
    <div 
      className="cursor-pointer bg-[#29221f]/60 border border-[#382e29] rounded-[2px] min-h-[160px] p-[16px] py-[18px] flex flex-col gap-[5px] justify-between group hover:border-primary/50 transition-all"
      onClick={(e)=> onClick(documentName)}
    >
      <div className="w-[100%] h-[45px] my-[10px] rounded-[5px]"></div>
      <div class="mb-[-4px]">
        <h4 class={documentTitleNameStyling}>{documentName}</h4>
      </div>
        <span class="text-[10px] text-[#d96b27] font-bold uppercase tracking-widest">
          [ Folder Name ]
      </span>
      <div class="pt-[10px] border-t border-[#382e29]">
        <span class={editDateTextStyling}>
          Edited Oct 15, 2023
        </span>
      </div>
    </div>
  );
}

export default function HomeScreen() {
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

  const navigateToDocument = (documentId) => {
    console.log(documentId)
    router.navigate({
      to: '/document/:documentId',
      params: { documentId: documentId }
    })
  }

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