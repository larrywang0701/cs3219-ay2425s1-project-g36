import Markdown from "react-markdown";
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import 'katex/dist/katex.min.css' // `rehype-katex` does not import the CSS for you

/**
 * Renders a Markdown component with math support.
 */
export default function CustomMarkdown({ children } : { children : string | null | undefined }) {
    return (
        <div className="prose">
            <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                { children }
            </Markdown>
        </div>
    )
}