import { globalStyle, style } from '@vanilla-extract/css'

export const markdownBoxHeight = style({
  maxHeight: '480px',
  overflowY: 'auto',
  '@media': {
    '(max-width: 768px)': {
      maxHeight: '320px',
    },
  },
})

export const markdownContent = style({
  wordBreak: 'break-word',
})

globalStyle(`${markdownContent} :is(h1)`, {
  fontSize: '2.6rem',
  fontWeight: 700,
  borderBottom: '1px solid #f0f0f0',
  lineHeight: '1.8',
  marginBottom: 18,
  '@media': {
    '(max-width: 768px)': {
      fontSize: '2rem',
    },
  },
})

globalStyle(`${markdownContent} :is(h2)`, {
  fontSize: '2.1rem',
  fontWeight: 700,
  borderBottom: '1px solid #f0f0f0',
  lineHeight: '1.6',
  marginBottom: 16,
  '@media': {
    '(max-width: 768px)': {
      fontSize: '1.7rem',
    },
  },
})

globalStyle(`${markdownContent} :is(h3)`, {
  fontSize: '1.6rem',
  marginBottom: 14,
  '@media': {
    '(max-width: 768px)': {
      fontSize: '1.4rem',
    },
  },
})

globalStyle(`${markdownContent} :is(h4)`, {
  fontSize: '1.3rem',
  fontWeight: 700,
  marginBottom: 12,
  '@media': {
    '(max-width: 768px)': {
      fontSize: '1.1rem',
    },
  },
})

globalStyle(`${markdownContent} :is(h5)`, {
  fontSize: '1.1rem',
  fontWeight: 700,
  marginBottom: 12,
  '@media': {
    '(max-width: 768px)': {
      fontSize: '1rem',
    },
  },
})

globalStyle(`${markdownContent} :is(h6)`, {
  fontSize: '0.9rem',
  fontWeight: 700,
  marginBottom: 12,
  '@media': {
    '(max-width: 768px)': {
      fontSize: '0.8rem',
    },
  },
})

globalStyle(`${markdownContent} :is(p, li)`, {
  marginBottom: 8,
})

globalStyle(`${markdownContent} :is(a)`, {
  textDecoration: 'underline',
})

globalStyle(`${markdownContent} > p`, {
  marginBottom: 20,
})

globalStyle(`${markdownContent} code`, {
  backgroundColor: 'rgba(0, 0, 0, 0.08)',
  padding: '0.2em 0.4em',
  borderRadius: '6px',
  fontFamily: 'monospace!important',
})

globalStyle(`${markdownContent} blockquote`, {
  color: '#808080',
  padding: '0 1em',
  borderLeft: '0.25em solid #808080',
  margin: 0,
  marginBottom: 20,
})
