// src/screens/HomeScreen.jsx
import { vertexThemeText, vertexThemeBG } from "../VertexStyles";

const editDateTextStyling = [vertexThemeText.textNormal, "text-[12px]"].join(" ")
const documentTitleNameStyling = [vertexThemeText.textPrimary, "font-bold", "text-[14px]", "mt-[0px] mb-[4px]"].join(" ")


// Should add a "..." or edit circle on the top right corner of every document, which allows users to assign folders to the documents

export function CreateDocument({ isRecentDocumentType = false, onClick }) {
  const containerSize = isRecentDocumentType ? " h-[180px] w-[180px] rounded-[8px] " : " min-h-[160px] ";
  const containerStyling = [
    "cursor-pointer bg-[#141418] border border-[#323f66]/70 px-[16px] py-[16px] rounded-[2px] flex flex-col gap-[15px]" , containerSize 
  ].join(" ");
  const documentTitleNameStyling = [vertexThemeText.textSecondary, "font-[500]", "tracking-[0.33px]", "text-[14px]", "mt-[12px] mb-[4px]"].join(" ")

  return (
    <div className={containerStyling} onClick={(e)=> onClick(" ")}>
      <div className="w-[100%] h-[40%] rounded-[5px]"></div>
      <div className="text-[#f5f1ed] text-[45px] bg-[]/60 max-w-[40px] h-[40px] rounded-[50%] border-[#96A8DD]/50 border-[0.5px]">
        <p className="m-[0] translate-y-[-12px] translate-x-[4px]">+</p>
      </div>
      <div className="border-t border-[#382e29] h-[40px]">
        <h4 class={documentTitleNameStyling}>Create new document</h4>
      </div>
    </div>
  );
}

export function RecentlyEditedDocument({ documentName, onClick }) {
  return (
    <div className="cursor-pointer bg-[#141418] border border-[#323f66]/70 rounded-[8px] px-[16px] py-[16px] h-[180px] w-[180px] rounded-[2px] flex flex-col gap-[15px]"
      onClick={(e)=> onClick(documentName)}
    >
      <div className="w-[100%] h-[100%] rounded-[5px] "></div>
      <div className="flex flex-col gap-[6.5px]">
        <h4 class={documentTitleNameStyling}>{documentName}</h4>
        <span class="text-[10px] text-[#96A8DD] font-bold uppercase tracking-widest">
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

export function DocumentPreview({ documentName, folders = [], onClick }) {
  return (
    <div 
      className="cursor-pointer bg-[#141418] border border-[#323f66]/70 rounded-[2px] min-h-[160px] p-[16px] py-[18px] flex flex-col gap-[5px] justify-between group hover:border-primary/50 transition-all"
      onClick={(e)=> onClick(documentName)}
    >
      <div className="w-[100%] h-[45px] my-[10px] rounded-[5px]"></div>
      <div class="mb-[-4px]">
        <h4 class={documentTitleNameStyling}>{documentName}</h4>
      </div>
        <span class="text-[10px] text-[#96A8DD] font-bold uppercase tracking-widest">
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