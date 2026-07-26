// Imports 
import { applyCustomStyles } from "./ApplyCustomStyles";

export const defaultGridColumnsOptions = {
  "ONE_COL" : "grid-cols-1 ",
  "TWO_COL" : "grid-cols-2 ",
  "THREE_COL" : "grid-cols-3 ",
  "FOUR_COL" : "grid-cols-4 ",
  "FIVE_COL" : "grid-cols-5 ",
  "SIX_COL"  : "grid-cols-6 ",
  "SEVEN_COL" : "grid-cols-7 ",
  "EIGHT_COL" : "grid-cols-8 ",
  "NINE_COL"  : "grid-cols-9 ",
  "TEN_COL"   : "grid-cols-10 ",
  "ELEVEN_COL" : "grid-cols-11 ",
  "TWELVE_COL" : "grid-cols-12 ",
}

export const largeGridColumnOptions = {
  "ONE_COL" : " max-xl:grid-cols-1",
  "TWO_COL" : " max-xl:grid-cols-2",
  "THREE_COL" : " max-xl:grid-cols-3",
  "FOUR_COL"  : " max-xl:grid-cols-4",
  "FIVE_COL" : " max-xl:grid-cols-5",
  "SIX_COL"  : " max-xl:grid-cols-6",
}

export const smallGridColumnOptions = {
  "ONE_COL" : " max-md:grid-cols-1",
  "TWO_COL" : " max-md:grid-cols-2",
  "THREE_COL" : " max-md:grid-cols-3",
  "FOUR_COL"  : " max-md:grid-cols-4",
}


/** Grid
 * @brief : Creates a html / css customizable and interactable Grid using 
 *   ANY defined React Component.
 * 
 * @param {Array} gridData : An array of data to use which needs to be 
 *      injected into the React Component which was provided to be an 
 *      item on the grid.
 * @param {ComponentClass} GridItemComponent : A React Component which
 *      will be mass-produced onto the grid.
 * @param {function | object} gridItemOnClick : An optional call-back 
 *      function, or map with call-back functions which will be invoked 
 *      when the GridItemComponent is clicked on. 
 * @param {object} customGridStyles : An object which described the 
 *      tailwind properties of the overall grid.  
 * @param {object} customGridColumnsStyling : An object which described
 *      the tailwind properties of each column within the grid.  
 * @param {number} columns : The number of columns to be used within the
 *      grid.
 * 
 * @returns An interacable and customizable Grid comprised instances of 
 *      GridItemComponents.
 */
export default function Grid({
  gridData,
  GridItemComponent,
  gridItemOnClick,
  gridDataKey,
  customGridStyles = {},
  columns,
  lgColumns = false,
  smColumns = false,
}) {
  const defaultGridStylings = {
    h: "min-h-[95%] max-h-[95%]",
    w: "min-w-[95%] max-w-[95%]",
    p: "p-[15px]",
    gap: "gap-[25px]",
    bg: "bg-[#fffbeb]/90",
    grid: "grid",
    columns: columns,
    lgColumns : lgColumns ? lgColumns : " ",
    smColumns : smColumns ? smColumns : " ",
  };

  const gridStyling = applyCustomStyles(defaultGridStylings, customGridStyles);

  return (
    <section className={gridStyling}>
     {
      gridData.map( (gridElementData, index) => {
        return (
          <GridItemComponent 
            {...gridElementData} 
            key={gridElementData[gridDataKey]} 
            onClick={gridElementData?.onClick || gridItemOnClick }
          />)
      })
     }
    </section>
  );
}
