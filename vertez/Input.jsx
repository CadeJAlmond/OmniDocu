/** Input.jsx
 * @returns {Component} : A customizable Input element that allows 
 *    logarithmic scaling within it's values. Has nice pre-defined 
 *    styles included.
 * 
 * References - BudgetsForm.Jsx, RetirementForm.Jsx
 */

/* --=== Imports ===-- */
import { applyCustomStyles } from "./ApplyCustomStyles";
import { Tooltip } from "./Tooltip";

/**
 * @brief : 
 * @param {String} inputName 
 * @returns : A populated instance of a basic input
 */
export function createBasicInput(inputName, type = "number", value, max, min, text, styles = {}) {
  return {
    FormInputComponent: Input,
    formInputProps: {
      [inputName]: { max, min, value, styles, type, text },
    }
  }
}

/**
 * @param {React.JSX} children : The placeholder text for an input.
 * @param {Function} updatedInput : A callback function to respond to 
 *    input changes.
 * @param {String} type : The "type" of allowable values within an 
 *    input element.
 * @param {Object} styles : The desires styles we want incorporated 
 *    into an input element.
 * @param {Number | String} value : The value within an Input element.
 * @param {Number} min : The maximum possible element of the Input element.
 * @param {Number} max : The minimum possible element of the Input element.
 * @param {String} name : The name property of an Input element.
 * @returns {Component} An input element.
 */
export default function Input({
  children,
  formValueUpdate,
  type = "number",
  styles = {},
  value,
  min,
  max,
  name,
  tooltip,
}) {
  // Setup styles for the SliderInput
  const defaultStylings = {
    h: "min-h-[32.5px] max-h-[32.5px]",
    w: "w-[85%]",
    pl: "pl-[0px]",
    bg: "bg-[transparent]",
    text: "text-[13px] text-[#f4f4f5]/80"
  };
  // Apply custom styles on top of the default styles
  const inputStyling = applyCustomStyles(defaultStylings, styles);

  // Apply min and max if defined
  if (min && max)
    return (
      <div className="flex items-center gap-[4px]">
        <input
          className={inputStyling}
          onChange={formValueUpdate}
          type={type}
          value={value}
          placeholder={children}
          max={max}
          min={min}
          name={name}
        />
        {tooltip && <Tooltip content={tooltip} />}
      </div>
    );

  return (
    <div className="flex items-center gap-[4px]">
      <input
        className={inputStyling}
        onChange={formValueUpdate}
        value={value}
        type={type}
        placeholder={children}
        name={name}
      />
      {tooltip && <Tooltip content={tooltip} />}
    </div>
  );
}
