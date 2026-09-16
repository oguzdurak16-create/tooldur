import React from 'react';

const URL_RE = /(https?:\/\/[^\s]+)/g;
const HTTP_RE = /^https?:\/\//i;

export default function SafeTextWithLinks({ text }: { text: string }) {
  return (
    <span style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
      {text.split(URL_RE).map((part, index) => {
        if (!HTTP_RE.test(part)) return <React.Fragment key={index}>{part}</React.Fragment>;
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="nofollow noopener noreferrer ugc"
            style={{ color: 'var(--amber)', textDecoration: 'underline', textUnderlineOffset: 2 }}
          >
            {part}
          </a>
        );
      })}
    </span>
  );
}
