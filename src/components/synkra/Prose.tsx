import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Safe markdown renderer — react-markdown escapes raw HTML by default,
 * so no user-supplied script markup can execute. GFM enables tables and
 * task lists. Used for project bodies and research articles.
 */
export function Prose({ content, className = "" }: { content: string; className?: string }) {
  if (!content?.trim()) return null;
  return (
    <div className={`synkra-prose synkra-scroll ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
