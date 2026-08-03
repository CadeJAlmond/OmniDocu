/**
 * @brief : Generates tailwind css styling for html elements. The parameter
 *    objects describe the defaultStyling for an element, but will be 
 *    over-written by anything from the customStyles.
 * 
 * @param {object} defaultStylings : An object which describes the default
 *    tailwind css styling of a general html element.
 * 
 * @param {object} customStyles : An object which describes unique tailwind 
 *    css styling to a specific instance of an html element.
 * 
 * @example : 
 *    Given a defaultStylings of : { color : "color-[red]", h : "h-[32px]" }
 *    Given a customStyles of    : { color : "color-[blue]" }
 *  return the string "color-[blue] h-[32px] "
 * 
 * @returns A string which defines tailwind css styling which will 
 *    include all styles -not- overwritten within the defaultStylings
 *    object but will include all styles from the customStyles object. 
 */
export const applyCustomStyles = ( defaultStylings, customStyles ) => Object.values( { ...defaultStylings, ...customStyles }).join(" ")

