/** Tooltip.jsx
 * @brief : A simple tooltip component that displays a "?" icon which,
 *    on hover, shows a small text area with the provided content.
 *
 * @param {String} content : The tooltip text to display on hover.
 */

export function Tooltip({ content }) {
  return (
    <span className="relative inline-flex items-center ml-[6px] group">
      <span className="text-[14px] font-bold text-[#f4f4f5]/50 group-hover:text-[#f4f4f5] select-none">
        ?
      </span>
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[12px] text-white bg-black/80 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        {content}
      </span>
    </span>
  );
}
