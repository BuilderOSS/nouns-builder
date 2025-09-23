import { globalStyle, style } from '@vanilla-extract/css'

export const proposalDescription = style({
  wordWrap: 'break-word',
  overflowWrap: 'break-word',
  wordBreak: 'break-word',
  maxWidth: '100%',
})

globalStyle(`${proposalDescription} :is(h1, h2, h3, h4, h5, h6)`, {
  fontFamily: 'Londrina Solid!important',
  marginTop: 12,
  marginBottom: 6,
})

globalStyle(`${proposalDescription} > p`, {
  marginBottom: 20,
})

globalStyle(`${proposalDescription} code`, {
  backgroundColor: 'rgba(0, 0, 0, 0.17)',
  padding: '0.2em 0.4em',
  borderRadius: '6px',
  fontFamily: 'monospace!important',
})

globalStyle(`${proposalDescription} pre`, {
  backgroundColor: 'rgba(0, 0, 0, 0.17)',
  padding: '1em',
  borderRadius: '6px',
  fontFamily: 'monospace!important',
  display: 'block',
  overflow: 'auto',
  whiteSpace: 'pre-wrap',
  maxWidth: '100%',
})

globalStyle(`${proposalDescription} pre code`, {
  backgroundColor: 'transparent',
  padding: 0,
})

globalStyle(`${proposalDescription} blockquote`, {
  color: '#808080',
  padding: '0 1em',
  borderLeft: '0.25em solid #808080',
  margin: 0,
  marginBottom: 20,
})

globalStyle(`${proposalDescription} *`, {
  wordWrap: 'break-word',
  overflowWrap: 'break-word',
  wordBreak: 'break-word',
  maxWidth: '100%',
})

globalStyle(`${proposalDescription} a`, {
  wordBreak: 'break-all',
})
