/** DropdownMenu.Jsx
 * @brief : This component is responsible for displaying an interactive
 *    container when clicked will open a menu os options for the user
 *    to select from.
 *
 * -Referenced : App.js
 */

/* --=== Imports ===-- */
import { Component, useState } from "react";

import { applyCustomStyles } from "./ApplyCustomStyles";
import { Tooltip } from "./Tooltip";
import { vertexThemeBG, vertexThemeText } from "../VertexStyles";

export function DropdownMenuItem({ children, onSelect }) {
  const style = [
    vertexThemeBG.surface,
    vertexThemeBG.surfaceHover,
    " px-[15px] py-[5px] cursor-pointer text-[#f4f4f5] "
  ].join(" ")
  return (
    <li className={style} onClick={(e) => {
      e.stopPropagation();
      onSelect({ event: { name: children, value: children } });
    }}>
      {children}
    </li>
  )
}

/**
 * @param {Object} buttonData : 
 * @returns {Component} : Generates a button from the provided data
 */
const generateButton = (buttonData, children) => {
  const { label, onClick } = buttonData;
  return (
    <button onClick={(e) => {
      e.stopPropagation();
      onClick(label, { event: { name: children, value: children } });
    }}>{label}</button>
  )
}

export function DropdownMenuItemButton({ children, onSelect, left, right, value, label, ...props }) {
  const rightButtonElement = right ? generateButton(right, children) : <></>
  const leftButtonElement = left ? generateButton(left, children) : <></>

  return (
    <li className={`px-[15px] py-[5px] cursor-pointer ${vertexThemeBG.surfaceHover} text-[#f4f4f5] flex place-content-between items-center`} onClick={(e) => {
      e.stopPropagation();
      onSelect({ ...props, event: { name: children, value: label ?? children } });
    }}>
      {leftButtonElement} {children} {rightButtonElement}
    </li>
  )
}

/**
 * @param {React.JSX} children : The JSX for the menu which is to be
 *    shown when a user clicks on the dropdown container.  
 * @param : The list of data to be displayed in the menu if no 
 *    children are provided.
 * @param {object} styles : The desires styles we want incorporated 
 *    into this dropdown menu.
 * @param {string} selectedItem : The item currently selected from
 *    provided menu. 
 * @param {string} onSelectionChange : on click callback function.
 * @returns {Component} An interactive dropdown-menu.
 */
export default function DropdownMenu({ children, items = [], styles = {}, selectedItem, multiSelect = false, onSelectionChange, placeHolderText = "", tooltip }) {
  const [openMenu, setOpenedMenu] = useState(false);

  const displaySelected = Array.isArray(selectedItem)
    ? (selectedItem.length > 0 ? selectedItem[selectedItem.length - 1] : placeHolderText)
    : (selectedItem || placeHolderText);

  const handleSelection = (eventData) => {
    if (onSelectionChange) {
      onSelectionChange(eventData);
    }
    if (!multiSelect) {
      setOpenedMenu(false);
    }
  };

  // Setup styles for the dropdown menu
  const defaultStylings = {
    h: "min-h-[37.5px] max-h-[37.5px]",
    p: "px-[15px]",
    b: "border-[2.5px]",
    tracking: "tracking-[0.65px]",
    bg: vertexThemeBG.surface,
    text: ["text-[17px]", vertexThemeText.textPrimary].join(" "),
    border: vertexThemeBG.border,
    rounded: "rounded-[5px]",
    flex: "flex flex-col",
    place: "place-content-between",
    w: "min-w-[90%] max-w-[90%]",
    item: "items-center",
    cursor: "cursor-pointer"
  };

  // Apply custom styles on top of the default styles
  const dropdownMenuStyling = applyCustomStyles(defaultStylings, styles);

  const openedMenuCss = {
    flex: "flex flex-col",
    gap: "gap-[2.5px]",
    w: "w-[100%]",
    border: "border-[2.5px]",
    font: "font-[400px]",
    border: vertexThemeBG.border,
    surface: vertexThemeBG.surface,
    rounded: "rounded-[2px]",
  };
  const menuStyling = applyCustomStyles(openedMenuCss, styles?.menu || {});

  const labelCss = { 
    mt: "mt-[7px]",
    text: "text-[15.5px]",
    font: "font-[200]",
    h: "h-[0px]"
  }

  const labelStyling = applyCustomStyles(labelCss, styles?.label || {});

  return (
    <>
      <div
        className={dropdownMenuStyling}
        onClick={() => setOpenedMenu(!openMenu)}
      >
        <div className="flex items-center justify-center">
          <h5 className={labelStyling}>{displaySelected}</h5>
          <div className="">
            {openMenu ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                fill="currentColor"
                class="bi bi-caret-up"
                viewBox="0 0 16 16"
              >
                <path d="M3.204 11h9.592L8 5.519zm-.753-.659 4.796-5.48a1 1 0 0 1 1.506 0l4.796 5.48c.566.647.106 1.659-.753 1.659H3.204a1 1 0 0 1-.753-1.659" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                fill="currentColor"
                class="bi bi-caret-down"
                viewBox="0 0 16 16"
              >
                <path d="M3.204 5h9.592L8 10.481zm-.753.659 4.796 5.48a1 1 0 0 0 1.506 0l4.796-5.48c.566-.647.106-1.659-.753-1.659H3.204a1 1 0 0 0-.753 1.659" />
              </svg>
            )}
          </div>
          {tooltip && <Tooltip content={tooltip} />}
        </div>
        <ul className={openMenu ? menuStyling : " w-[100%] "}>
          {openMenu && (children ? children : items.map((item, index) => {
            if (typeof (item) === "string") {
              return (
                <DropdownMenuItem key={index} onSelect={handleSelection}>{item}</DropdownMenuItem>
              );
            }

            const { label, ...props } = item;
            const ItemComponent = item?.ItemComponent ?? DropdownMenuItem;

            return (
              <ItemComponent key={index} {...props} label={label} onSelect={handleSelection}>{label}</ItemComponent>
            );
          }))}
        </ul>
      </div >
    </>
  );
}