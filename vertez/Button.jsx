/** Button.jsx
 * @param {React.JSX} children : Text to use for the button
 * @param {function} onClick : A callback function to respond to the button being clicked
 * @param {object} styles : The desires styles we want incorporated into an Button element
 
 * @returns : A customizable Button element that allows logarithmic scaling within
 *    it's values. Has nice pre-defined styles included.
 * 
 * References - BudgetsForm.Jsx, RetirementForm.Jsx, StocksOverview.jsx
 */

import { applyCustomStyles } from "./ApplyCustomStyles";
import { vertexThemeBG } from "../VertexStyles";

/* --=== Imports ===-- */
export default function Button({ children, styles = {}, onClick }) {
  // Setup styles for Buttons
  const defaultStylings = {
    h: "min-h-[37.5px] max-h-[37.5px]",
    px: "px-[20.5px]",
    color: "text-[#ffffff]",
    bg: vertexThemeBG.btnPrimary,
    bgHover: vertexThemeBG.btnPrimaryHover,
    border: "rounded-[5px]",
    text: "text-[20px] text-[#ffffff]",
    flex: "flex",
    justify: "justify-center",
    wrap: "flex-wrap",
    item: "items-center"
  };

  const buttonStyling = applyCustomStyles(defaultStylings, styles)

  return (
    <button className={buttonStyling} onClick={onClick}>
      {children}
    </button>
  );
}
