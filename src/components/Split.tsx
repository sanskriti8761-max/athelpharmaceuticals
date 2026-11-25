import { createElement } from 'react'

/** Splits text into words or letters so each piece can animate,
 *  while screen readers still hear the sentence once, normally. */
export function Split({ text, by = 'words', as = 'span', className = '', reveal }: { text: string; by?: 'words' | 'letters'; as?: string; className?: string; reveal?: boolean }) {
  const words = text.split(' ')
  return createElement(
    as,
    { className: `split ${className}`, 'aria-label': text, 'data-reveal': reveal === false ? undefined : by },
    words.map((w, i) => (
      <span key={i} className="split-w" aria-hidden="true">
        {by === 'words' ? (
          <span className="split-i">{w}</span>
        ) : (
          [...w].map((ch, j) => (
            <span key={j} className="split-i">
              {ch}
            </span>
          ))
        )}
        {i < words.length - 1 ? ' ' : ''}
      </span>
    )),
  )
}
