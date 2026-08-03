/** Accordion.jsx
 * @brief : This component is responsible for displaying a collapsible
 *    set of sections. Each section can be expanded or collapsed to
 *    reveal its content. Supports both single and multi-select modes.
 */

/* --=== Imports ===-- */
import { useState } from "react";
import { applyCustomStyles } from "./ApplyCustomStyles";
import { Tooltip } from "./Tooltip";
import { vertexThemeBG, vertexThemeText } from "../VertexStyles";

/**
 * @param {React.JSX} children : Custom JSX to render instead of 
 *    auto-generating from items.
 * @param {Array} items : An array of accordion item definitions. Each 
 *    item may be a simple object with { label, content } or include 
 *    an ItemComponent for custom rendering.
 * @param {Boolean} multiSelect : If true, multiple accordion sections 
 *    can be open simultaneously. Defaults to false.
 * @param {Object} styles : Custom tailwind style overrides for the 
 *    accordion container.
 * @returns {Component} A collapsible accordion element.
 */
export default function Accordion({ children, items = [], multiSelect = false, styles = {}, tooltip }) {
  const [openSections, setOpenSections] = useState([]);

  // Setup styles for the Accordion container
  const defaultStylings = {
    w: "w-[100%]",
    flex: "flex flex-col",
    gap: "gap-[2px]",
    rounded: "rounded-[5px]",
    overflow: "overflow-hidden",
  };

  const accordionStyling = applyCustomStyles(defaultStylings, styles);

  /**
   * @param {Number} index : The index of the section to toggle
   * @brief : Toggles the open/closed state of an accordion section.
   *    If multiSelect is false, only one section can be open at a time.
   */
  const toggleSection = (index) => {
    if (multiSelect) {
      setOpenSections((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
      );
    } else {
      setOpenSections((prev) =>
        prev.includes(index) ? [] : [index]
      );
    }
  };

  const isSectionOpen = (index) => openSections.includes(index);

  // If children are provided, render them directly
  if (children) {
    return (
      <div className={accordionStyling}>
        {children}
      </div>
    );
  }

  // Otherwise, construct accordion from items array
  return (
    <div className={accordionStyling}>
      {items.map((item, index) => {
        const { label, ItemComponent, ...itemProps } = item;
        const isOpen = isSectionOpen(index);

        // Use the provided ItemComponent or the default AccordionItem
        const RenderComponent = ItemComponent ?? AccordionItem;

        return (
          <RenderComponent
            key={index}
            label={label}
            isOpen={isOpen}
            onToggle={() => toggleSection(index)}
            tooltip={tooltip}
            {...itemProps}
          />
        );
      })}
    </div>
  );
}

/**
 * @param {String} label : The header text for this accordion section.
 * @param {React.JSX} children : The content revealed when the section 
 *    is expanded.
 * @param {Boolean} isOpen : Whether this section is currently expanded.
 * @param {Function} onToggle : Callback to toggle the open/closed state.
 * @returns {Component} A single accordion section with header and content.
 */
export function AccordionItem({ label, children, content, isOpen, onToggle, tooltip }) {
  const accordionContainerStyling = [
    "border-[1px]",
    vertexThemeBG.border,
    "rounded-[5px]"
  ].join(" ");

  const accordionContainerTitleStyling = [
    vertexThemeBG.surface,
    vertexThemeBG.surfaceHover,
    vertexThemeText.textSecondary,
    "flex", 
    "place-content-between", 
    "items-center", 
    "px-[15px] py-[10px]", 
    "cursor-pointer", 
  ].join(" ")

  return (
    <div className={accordionContainerStyling}>
      <div
        className={accordionContainerTitleStyling}
        onClick={onToggle}
      >
        <span className="text-[16px] font-medium">{label}</span>
        {tooltip && <Tooltip content={tooltip} />}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          viewBox="0 0 16 16"
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        >
          <path d="M3.204 5h9.592L8 10.481zm-.753.659 4.796 5.48a1 1 0 0 0 1.506 0l4.796-5.48c.566-.647.106-1.659-.753-1.659H3.204a1 1 0 0 0-.753 1.659" />
        </svg>
      </div>
      {isOpen && (
        <div className="px-[15px] py-[10px] text-[#f4f4f5]/80 text-[14px]">
          {children ?? content}
        </div>
      )}
    </div>
  );
}
