import { vertexThemeText } from "../VertexStyles"
import { applyCustomStyles } from "./ApplyCustomStyles"

export default function SubTitle({ children, styles }) {
    const subTitleStylingDefault = {
        "text" : ["text-[15px]", vertexThemeText.textSecondary].join(" "),
        "uppercase" : "uppercase",
        "tracking": "tracking-[0.55px]",
        "font": "font-[600]"
    }
    const subTitleStyling = applyCustomStyles(subTitleStylingDefault, styles);

    return <h4 className={subTitleStyling}>{children}</h4>
}