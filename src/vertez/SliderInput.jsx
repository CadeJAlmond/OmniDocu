/** Input.jsx
 * @param {function} updatedInput : A callback function to respond to 
 *    input changes in this element.
 * @param {string} type : The "type" of allowable values within an 
 *    Input element.
 * @param {object} styles : The desires styles we want incorporated into
 *    an Input element.
 * @param {any} value : The value within an Input element.
 * @param {number} min : The maximum possible element of the Input element.
 * @param {number} max : The minimum possible element of the Input element.
 * @param {string} name : The name property of an Input element.
 * 
 * @returns : A customizable slider Input type of element that allows 
 *    logarithmic scaling within it's values. Has nice pre-defined 
 *    styles included.
 * 
 * References - BudgetsForm.Jsx, RetirementForm.Jsx
 */

/* --=== Imports ===-- */
import { applyCustomStyles } from "./ApplyCustomStyles";
import { Tooltip } from "./Tooltip";

export function createSliderInput(inputName, value, max, min, text) {
  return {
    FormInputComponent: SliderInput,
    formInputProps: {
      [inputName]: { value, max, min, text },
    }
  }
}

export default function SliderInput({
  max,
  min,
  formValueUpdate,
  value,
  name,
  logScaling = false,
  styles = {},
  tooltip,
}) {
  const logMin = Math.log(min);
  const logMax = Math.log(max);
  const logValue = Math.log(value);

  /**
   * @param {number} value : A value to convert to a logarithmic scale 
   * @returns Converts a value a logarithmic scale  
   */
  const scaleValueToLog = (value) => {
    const scale = (Math.log(value) - logMin) / (logMax - logMin);
    return Math.round(scale * (max - min) + min);
  };

  /**
  * @param {number} value : A logged value to convert to a normal scale 
  * @returns Converts a logged value back to a normal scale  
  */
  const scaleLogToValue = (logValue) => {
    if(!logScaling) return logValue

    const scale = (logValue - min) / (max - min);
    return Math.round(Math.exp(scale * (logMax - logMin) + logMin));
  };

  /**
   * @param {ReactEventHandler} e : An input element event item
   * @brief : When the slider is used, convert the new value to a logged
   *    form and initiate the provided call-back function : updatedInput
   */
  const handleChange = (e) => {
    if(!logScaling) return e.target.value

    const linearValue = parseFloat(e.target.value);
    const logValue = scaleLogToValue(linearValue);

    updatedInput({ target: { name, value: logValue } });
  };

  // Setup styles for the SliderInput
  const defaultStylings = {
    h: "min-h-[32.5px] max-h-[32.5px]",
    w: "w-[85%]",
    pl: "pl-[10px]",
    bg: "bg-[transparent]",
    b : "border-[1.5px] border-[#f4f4f5]/80",
    border: "rounded-[5px]",
    text: "text-[17px] text-[#f4f4f5]/80",
  };

  const inputStyling = applyCustomStyles(defaultStylings, styles);

  return (
    <div className="flex items-center gap-[4px]">
      <input
        className={inputStyling}
        type="range"
        max={max}
        min={min}
        onChange={formValueUpdate}
        value={logScaling ? scaleValueToLog(value) : value}
        name={name}
      />
      {tooltip && <Tooltip content={tooltip} />}
    </div>
  );
}
