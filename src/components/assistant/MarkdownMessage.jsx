import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

const linkClass = 'font-medium text-violet-700 underline-offset-4 hover:underline dark:text-violet-300'
const codeClass =
  'rounded-md border border-zinc-200/80 bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.85em] text-zinc-900 dark:border-white/10 dark:bg-black/30 dark:text-violet-100'

export function MarkdownMessage({ content }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        a: ({ href, children }) => (
          <a className={linkClass} href={href} target="_blank" rel="noreferrer">
            {children}
          </a>
        ),
        p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
        ul: ({ children }) => <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>,
        ol: ({ children }) => <ol className="mb-3 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>,
        li: ({ children }) => <li className="pl-1">{children}</li>,
        h1: ({ children }) => <h1 className="mb-3 text-xl font-semibold text-zinc-950 dark:text-white">{children}</h1>,
        h2: ({ children }) => <h2 className="mb-2 text-lg font-semibold text-zinc-950 dark:text-white">{children}</h2>,
        h3: ({ children }) => <h3 className="mb-2 text-base font-semibold text-zinc-950 dark:text-white">{children}</h3>,
        blockquote: ({ children }) => (
          <blockquote className="my-3 border-l-2 border-violet-400 pl-4 text-zinc-600 dark:text-zinc-300">
            {children}
          </blockquote>
        ),
        code: ({ inline, children }) =>
          inline ? (
            <code className={codeClass}>{children}</code>
          ) : (
            <code className="block overflow-x-auto rounded-xl border border-zinc-200/90 bg-zinc-950 p-4 font-mono text-xs leading-relaxed text-zinc-100 dark:border-white/10">
              {children}
            </code>
          ),
        pre: ({ children }) => <pre className="my-3 overflow-x-auto">{children}</pre>,
        table: ({ children }) => (
          <div className="my-3 overflow-x-auto rounded-xl border border-zinc-200/90 dark:border-white/10">
            <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-white/10">{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th className="bg-zinc-100 px-3 py-2 text-left font-semibold dark:bg-white/10">{children}</th>
        ),
        td: ({ children }) => <td className="border-t border-zinc-200 px-3 py-2 dark:border-white/10">{children}</td>,
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
