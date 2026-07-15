"use client"

import * as React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkBreaks from "remark-breaks"
import rehypeRaw from "rehype-raw"
import rehypeSlug from "rehype-slug"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { AssistantActions } from "./assistant-actions"
import { SmFolderLineIcon } from "@/components/icons"

export type AssistantSource = {
  id: string
  title: string
  href?: string
}

type AssistantMessageProps = {
  content: string
  messageId: string
  sources?: AssistantSource[] | null
  onRetry?: () => void
  /** Hides copy/retry/feedback actions (e.g. admin viewing someone else's conversation). */
  readOnly?: boolean
  className?: string
}

export function AssistantMessage({
  content,
  messageId,
  sources,
  onRetry,
  readOnly = false,
  className,
}: AssistantMessageProps) {
  return (
    <div
      data-slot="chat-assistant-message"
      className={cn("mb-6 flex w-full justify-start", className)}
    >
      <div className="w-full">
        <article className="max-w-none space-y-6 text-[15px] leading-relaxed text-pretty text-muted-foreground">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            rehypePlugins={[rehypeRaw, rehypeSlug]}
            components={{
              h1: ({ children }) => (
                <h1 className="mt-8 mb-4 font-body text-[24px] font-semibold tracking-tight text-balance text-foreground first:mt-0">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="mt-8 mb-3 font-body text-[20px] font-semibold tracking-tight text-balance text-foreground first:mt-0">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="mt-6 mb-2 font-body text-[17px] font-semibold text-balance text-foreground">
                  {children}
                </h3>
              ),
              h4: ({ children }) => (
                <h4 className="mt-5 mb-2 font-body text-[15px] font-semibold text-balance text-foreground">
                  {children}
                </h4>
              ),
              p: ({ children }) => (
                <p className="text-[15px] leading-[1.75] text-pretty">{children}</p>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-foreground">{children}</strong>
              ),
              em: ({ children }) => <em className="italic">{children}</em>,
              ul: ({ children }) => (
                <ul className="space-y-2 pl-5 list-disc marker:text-muted-foreground/60">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="space-y-2 pl-5 list-decimal marker:text-muted-foreground/60">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-[15px] leading-[1.75] text-pretty [&>strong]:text-foreground">
                  {children}
                </li>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 border-primary/50 pl-6 text-[20px] italic leading-relaxed text-pretty text-foreground/80">
                  {children}
                </blockquote>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  className="text-primary no-underline hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  {children}
                </a>
              ),
              code: ({ className, children }) => {
                const isBlock = className?.includes("language-")
                if (isBlock) {
                  return <code className={className}>{children}</code>
                }
                return (
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm text-foreground">
                    {children}
                  </code>
                )
              },
              pre: ({ children }) => (
                <pre className="overflow-x-auto rounded-lg border border-border bg-muted p-4 text-sm">
                  {children}
                </pre>
              ),
              hr: () => <hr className="my-8 border-border/50" />,
              br: () => <span aria-hidden className="block h-3" />,
              table: ({ children }) => (
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm">{children}</table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-accent/50">{children}</thead>
              ),
              th: ({ children }) => (
                <th className="px-4 py-3 text-left font-semibold text-foreground align-top">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="border-t border-border/50 px-4 py-3 align-top leading-relaxed text-pretty">
                  {children}
                </td>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </article>

        {sources && sources.length > 0 && (
          <div
            data-slot="chat-assistant-sources"
            className="mt-5 flex flex-wrap items-center gap-2"
          >
            <span className="text-xs text-muted-foreground">
              {sources.length === 1 ? "Fonte:" : "Fontes:"}
            </span>
            {sources.map((s) =>
              s.href ? (
                <Link
                  key={s.id}
                  href={s.href}
                  className="inline-flex h-7 max-w-[260px] items-center gap-1.5 rounded-full bg-accent/50 px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <SmFolderLineIcon className="size-3.5 shrink-0" />
                  <span className="truncate">{s.title}</span>
                </Link>
              ) : (
                <span
                  key={s.id}
                  className="inline-flex h-7 max-w-[260px] items-center gap-1.5 rounded-full bg-accent/50 px-2.5 text-xs font-medium text-muted-foreground"
                >
                  <SmFolderLineIcon className="size-3.5 shrink-0" />
                  <span className="truncate">{s.title}</span>
                </span>
              ),
            )}
          </div>
        )}

        {!readOnly && (
          <AssistantActions
            messageId={messageId}
            content={content}
            onRetry={onRetry}
          />
        )}
      </div>
    </div>
  )
}
