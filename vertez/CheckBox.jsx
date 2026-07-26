import React from "react";
import { applyCustomStyles } from "./ApplyCustomStyles";
import { Tooltip } from "./Tooltip";

/**
 * @param {React.JSX} children - The label text for the checkbox input.
 * @param {Function} onChange - Callback function to respond to input changes.
 * @param {Boolean} checked - The current checked state of the checkbox.
 * @param {Object} styles - Custom styles to apply to the checkbox.
 * @param {String} name - The name property of the checkbox input.
 * @returns {React.JSX} A styled checkbox input element with a label.
 */
export default function Checkbox({
    children,
    formValueUpdate,
    value = false,
    text,
    styles = {},
    name,
    tooltip,
}) {
    // Default styling for the checkbox and label
    const defaultStylings = {
        checkbox: "toggle-label block overflow-hidden rounded-full bg-gray-700 cursor-pointer",
    };

    const onClick = (e) => {
        const { checked, name } = e.target;
        formValueUpdate({ target: { value: checked, name: name } });
    }

    // Merge default styles with custom styles
    const checkboxStyles = applyCustomStyles(defaultStylings.checkbox, {});

    return (
        <span className="flex gap-[15px]">
            <p className="text-nowrap text-sm font-medium text-[#ffffffcc] flex tracking-wide flex items-center justify-between">
                {text}
                {tooltip && <Tooltip content={tooltip} />}
            </p>
            <input
                type="checkbox"
                name={name}
                onClick={onClick}
                onChange={() => { }}
                className={checkboxStyles}
                checked={value}
            />
        </span>
    );
}