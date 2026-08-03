import { vertexThemeText } from "../VertexStyles"
import { applyCustomStyles } from "./ApplyCustomStyles"

export default function Text({children, styles}) {
    const textStylingDefault = {
        "text" : ["text-[15px]", vertexThemeText.textNormal].join(" "),
        "tracking": "tracking-[0.15px]",
        "font": "font-[400]"
    }
    const textStyling = applyCustomStyles(textStylingDefault, styles);
    
    return <p className={textStyling}>{children}</p>
}