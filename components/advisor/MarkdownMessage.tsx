import React from "react";

interface MarkdownMessageProps {
  content: string;
  isUser?: boolean;
}

/**
 * Lightweight, zero-dependency Markdown renderer tailored for
 * Neobrutalist design tokens in the Attendance Advisor Chatbot.
 */
export function MarkdownMessage({ content, isUser = false }: MarkdownMessageProps) {
  if (isUser) {
    return <div className="whitespace-pre-wrap leading-relaxed">{content}</div>;
  }

  // Split lines
  const lines = content.split("\n");

  const renderInline = (text: string): React.ReactNode => {
    // Regex for bold (**text**), inline code (`code`), and italics (*text*)
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let keyIdx = 0;

    while (remaining.length > 0) {
      // Check for code `...`
      const codeMatch = remaining.match(/^(.*?)`([^`]+)`(.*)$/s);
      // Check for bold **...**
      const boldMatch = remaining.match(/^(.*?)\*\*([^*]+)\*\*(.*)$/s);

      // Prioritize whichever appears first in the string
      let firstMatch: { type: "code" | "bold"; index: number; before: string; inner: string; after: string } | null = null;

      if (codeMatch && boldMatch) {
        if (codeMatch[1].length <= boldMatch[1].length) {
          firstMatch = { type: "code", index: codeMatch[1].length, before: codeMatch[1], inner: codeMatch[2], after: codeMatch[3] };
        } else {
          firstMatch = { type: "bold", index: boldMatch[1].length, before: boldMatch[1], inner: boldMatch[2], after: boldMatch[3] };
        }
      } else if (codeMatch) {
        firstMatch = { type: "code", index: codeMatch[1].length, before: codeMatch[1], inner: codeMatch[2], after: codeMatch[3] };
      } else if (boldMatch) {
        firstMatch = { type: "bold", index: boldMatch[1].length, before: boldMatch[1], inner: boldMatch[2], after: boldMatch[3] };
      }

      if (firstMatch) {
        if (firstMatch.before) {
          parts.push(<span key={`text-${keyIdx++}`}>{firstMatch.before}</span>);
        }
        if (firstMatch.type === "bold") {
          // Check if this is a warning or alert highlight
          const isWarning = firstMatch.inner.includes("Drops below") || firstMatch.inner.includes("Detention");
          parts.push(
            <strong
              key={`bold-${keyIdx++}`}
              className={`font-black ${isWarning ? "text-nb-red underline" : "text-nb-ink"}`}
            >
              {firstMatch.inner}
            </strong>
          );
        } else {
          parts.push(
            <code
              key={`code-${keyIdx++}`}
              className="bg-yellow-100 text-nb-ink border border-zinc-400 px-1 py-0.2 font-mono text-[11px] font-bold"
            >
              {firstMatch.inner}
            </code>
          );
        }
        remaining = firstMatch.after;
      } else {
        parts.push(<span key={`text-${keyIdx++}`}>{remaining}</span>);
        break;
      }
    }

    return parts;
  };

  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // 1. Headings: ###, ##, #
    if (line.startsWith("### ") || line.startsWith("## ") || line.startsWith("# ")) {
      const headingText = line.replace(/^#{1,3}\s+/, "");
      elements.push(
        <div
          key={`heading-${i}`}
          className="bg-nb-yellow/40 border-l-[4px] border-nb-ink pl-2 py-1 my-2 font-heading font-black text-xs uppercase tracking-wide text-nb-ink flex items-center gap-1.5"
        >
          {renderInline(headingText)}
        </div>
      );
      i++;
      continue;
    }

    // 2. Actionable Advice / Callout section
    if (line.startsWith("**Actionable Advice:**") || line.startsWith("**Next Step:**")) {
      elements.push(
        <div
          key={`advice-${i}`}
          className="mt-2.5 p-2 bg-yellow-50 border-2 border-nb-ink shadow-[2px_2px_0px_#0A0A0A] text-nb-ink text-[11px] leading-relaxed"
        >
          {renderInline(line)}
        </div>
      );
      i++;
      continue;
    }

    // 3. Bullet list items: •, -, *
    if (line.startsWith("• ") || line.startsWith("- ") || line.startsWith("* ")) {
      const bulletText = line.replace(/^[•\-\*]\s+/, "");
      const isDetentionWarning = bulletText.includes("Drops below 75%");
      const isDetentionSafe = bulletText.includes("Remains strictly safe");

      elements.push(
        <div
          key={`bullet-${i}`}
          className={`flex items-start gap-1.5 my-1 pl-1 text-[11px] leading-snug ${
            isDetentionWarning
              ? "bg-red-50 border border-nb-red p-1 font-bold text-nb-red"
              : isDetentionSafe
              ? "bg-emerald-50 border border-emerald-600 p-1 text-emerald-950 font-semibold"
              : ""
          }`}
        >
          <span className="text-nb-ink font-bold select-none">•</span>
          <div className="flex-1">{renderInline(bulletText)}</div>
        </div>
      );
      i++;
      continue;
    }

    // 4. Empty lines
    if (!line) {
      elements.push(<div key={`spacer-${i}`} className="h-1" />);
      i++;
      continue;
    }

    // 5. Standard paragraph
    elements.push(
      <p key={`p-${i}`} className="my-1 leading-relaxed text-zinc-900 text-[11px]">
        {renderInline(rawLine)}
      </p>
    );
    i++;
  }

  return <div className="space-y-0.5">{elements}</div>;
}
