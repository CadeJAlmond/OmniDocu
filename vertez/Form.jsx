/** Form.jsx
 * @returns {Component} : A customizable Form element automatically
 *    constructed from basic JavaScript Objects, which communicates
 *    values within our forms.
 */

/* --=== Imports ===-- */
import { applyCustomStyles } from "./ApplyCustomStyles";
import { vertexThemeBG } from "../VertexStyles";

import _ from 'lodash';

/**
 * @param {String} title : The heading displayed above the form inputs.
 * @param {Object} formInputsData : A data representation of how to construct
 *    and represent an interactable html form. Each key maps to an input
 *    definition containing InputComponent, value, text, and optionally
 *    a validators array of functions.
 * @param {Function} formValueUpdate : A callback function which reports the
 *    updates that occur within a form.
 * @param {Object} styles : Custom tailwind style overrides for the form
 *    container.
 * @param {React.JSX} children : Optional child elements (e.g., submit buttons).
 * @returns A form element
 */
export default function Form({ title, formInputsData, formValueUpdate, styles = {}, children }) {
  // We need a shallow copy, since JS is pass by reference we should only interact with a copy of the 
  // form inputs schema when constructing the form.
  const formInputs = _.cloneDeep(formInputsData ? formInputsData : {})

  // Setup the Styling for the Form
  const defaultFormStylings = {
    bg: vertexThemeBG.surface,
    h: "min-h-[85%] max-h-[85%]",
    w: "min-w-[100%] max-w-[100%]",
    gap: "gap-x-[15px]",
    p: "p-[1.5rem]",
    flex: "flex flex-col items-start",
    rounded: "rounded-md",
    overflow: "overflow-auto"
  };

  // Merge the custom styles with the default styles
  const gridStyling = applyCustomStyles(defaultFormStylings, styles);

  /**
   * @param {InputHTMLAttributes} event : The html input event which contains the updated value
   *    belonging to the input which was just updated.
   * @returns The new state of the form
   */
  const computeNewFormState = (event) => {
    const { value, name } = event.target;
    const updatedState = { ...formInputs };

    // Update recorded value in our state
    updatedState[name].value = value;

    // Clear previous errors before re-validating
    delete updatedState[name].errors;

    // Run validators if defined on this input
    if (updatedState[name].validators && Array.isArray(updatedState[name].validators)) {
      const errors = updatedState[name].validators
        .map((validator) => validator(value))
        .filter((result) => result != null);

      // Only attach errors if validators returned non-null/non-undefined values
      if (errors.length > 0) {
        updatedState[name].errors = errors;
      }
    }

    return formValueUpdate({ state: updatedState, event: { value, name } });
  };

  return (
    <form className={gridStyling} onSubmit={() => onSubmit}>
      <h3 className="text-2xl font-bold text-[#ffffffde] mb-4 mr-[30px] border-b-[2px] border-[#2d323b]/70">{title}</h3>
      {/* Generate each input of the Form */}
      {Object.keys(formInputs).map((formInputName, rowIndex) => {
        const { InputComponent, ...inputProps } = formInputs[formInputName];
        // Include the name into the properties to pass into the input fields of the form
        inputProps.name = formInputName;

        return (
          /** Render each Input of the form **/
          <div className=" flex gap-4 justify-start max-md:flex-col w-[100%] mb-3">
              <InputComponent
                {...inputProps} // Inject component properties by spreading them
                formValueUpdate={(newInputData) => computeNewFormState(newInputData)}
                key={formInputName} // Define keys
              />
          </div>
        );
      })}
      {
        // Inject optional form elements
        children
      }
    </form>
  );
}
