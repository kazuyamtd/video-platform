import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

/**
 * Markdown を表示する。HTML タグはそのまま出力せず（文字として表示）、
 * javascript: などの危険な URL も無効化される（react-markdown の既定動作）。
 */
export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div
      className={cn(
        "prose prose-sm max-w-none prose-neutral dark:prose-invert prose-a:text-primary prose-img:rounded-lg sm:prose-base",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => {
            const external = !!href && /^https?:\/\//.test(href);
            return (
              <a
                href={href}
                {...(external && { target: "_blank", rel: "noopener noreferrer" })}
              >
                {children}
              </a>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
