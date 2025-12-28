"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Highlight, themes } from "prism-react-renderer";

interface CodeBlockProps {
  language: string;
  value: string;
  className?: string;
}

export function CodeBlock({ language, value, className }: CodeBlockProps) {
  const lang = language === "curl" ? "bash" : language;
  const theme = themes.vsDark; // Using VS Code dark theme which is similar to GitHub dark

  return (
    <div className={cn('relative rounded-md', className)}>
      <Highlight
        theme={theme}
        code={value}
        language={lang as any}
      >
        {({ className: highlightClassName, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={cn(
              "max-h-[650px] overflow-x-auto rounded-lg border p-4 text-sm",
              highlightClassName
            )}
            style={style}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
} 