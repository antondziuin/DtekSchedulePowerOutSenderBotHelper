import React from 'react';

interface TelegramHtmlViewProps {
  html: string;
  className?: string;
}

/**
 * Parses Telegram supported HTML tags:
 * <b>, <strong>, <i>, <em>, <u>, <s>, <strike>, <code>, <pre>, <a href="...">
 * and renders clean sanitized React nodes.
 */
export const TelegramHtmlView: React.FC<TelegramHtmlViewProps> = ({ html, className = '' }) => {
  // Replace <br> tags with \n before parsing
  const cleanInput = html.replace(/<br\s*\/?>/gi, '\n');

  // Simple, safe recursive DOM-like element parser without dangerouslySetInnerHTML
  const renderNodes = (text: string): React.ReactNode[] => {
    const nodes: React.ReactNode[] = [];
    let remaining = text;
    let keyIdx = 0;

    while (remaining.length > 0) {
      // Find the next opening tag
      const openMatch = remaining.match(/<([a-zA-Z0-9]+)(?:\s+href="([^"]*)")?>/);
      if (!openMatch || openMatch.index === undefined) {
        // No more tags, append remaining text
        nodes.push(<span key={keyIdx++}>{remaining}</span>);
        break;
      }

      const matchIndex = openMatch.index;
      // Preceding text before tag
      if (matchIndex > 0) {
        nodes.push(<span key={keyIdx++}>{remaining.slice(0, matchIndex)}</span>);
      }

      const tagName = openMatch[1].toLowerCase();
      const hrefAttr = openMatch[2];
      const tagContentStart = matchIndex + openMatch[0].length;

      // Find matching closing tag </tag>
      const closeTagStr = `</${tagName}>`;
      const closeIndex = remaining.toLowerCase().indexOf(closeTagStr, tagContentStart);

      if (closeIndex === -1) {
        // No closing tag found, treat opening tag as plain text
        nodes.push(<span key={keyIdx++}>{openMatch[0]}</span>);
        remaining = remaining.slice(tagContentStart);
        continue;
      }

      const innerContent = remaining.slice(tagContentStart, closeIndex);
      const innerNodes = renderNodes(innerContent);

      switch (tagName) {
        case 'b':
        case 'strong':
          nodes.push(
            <strong key={keyIdx++} className="font-bold">
              {innerNodes}
            </strong>
          );
          break;
        case 'i':
        case 'em':
          nodes.push(
            <em key={keyIdx++} className="italic">
              {innerNodes}
            </em>
          );
          break;
        case 'u':
          nodes.push(
            <u key={keyIdx++} className="underline decoration-current">
              {innerNodes}
            </u>
          );
          break;
        case 's':
        case 'strike':
          nodes.push(
            <s key={keyIdx++} className="line-through opacity-80">
              {innerNodes}
            </s>
          );
          break;
        case 'code':
          nodes.push(
            <code
              key={keyIdx++}
              className="bg-black/15 dark:bg-white/10 text-emerald-600 dark:text-emerald-300 px-1 py-0.5 rounded font-mono text-[0.88em] inline-block"
            >
              {innerNodes}
            </code>
          );
          break;
        case 'pre':
          nodes.push(
            <pre
              key={keyIdx++}
              className="bg-black/20 dark:bg-black/40 p-2 my-1 rounded font-mono text-[0.85em] overflow-x-auto whitespace-pre-wrap"
            >
              {innerNodes}
            </pre>
          );
          break;
        case 'a':
          nodes.push(
            <a
              key={keyIdx++}
              href={hrefAttr || '#'}
              target="_blank"
              rel="noreferrer"
              className="text-sky-500 hover:underline"
            >
              {innerNodes}
            </a>
          );
          break;
        default:
          nodes.push(<span key={keyIdx++}>{innerNodes}</span>);
          break;
      }

      remaining = remaining.slice(closeIndex + closeTagStr.length);
    }

    return nodes;
  };

  return (
    <div className={`whitespace-pre-wrap break-words leading-relaxed ${className}`}>
      {renderNodes(cleanInput)}
    </div>
  );
};
