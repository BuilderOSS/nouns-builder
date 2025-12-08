import { atoms, space, theme } from '@buildeross/zord'
import { globalStyle, style } from '@vanilla-extract/css'

export const feedItemCard = style([
  atoms({
    p: 'x4',
    borderRadius: 'curved',
    borderWidth: 'normal',
    borderStyle: 'solid',
    borderColor: 'border',
    backgroundColor: 'background1',
    w: '100%',
  }),
  {
    transition: 'all 0.15s ease-in-out',
    ':hover': {
      borderColor: theme.colors.neutralHover,
      boxShadow: `0 2px 8px ${theme.colors.ghostHover}`,
    },
  },
])

export const feedItemIcon = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: space.x10,
  height: space.x10,
  borderRadius: '50%',
  backgroundColor: theme.colors.background2,
  flexShrink: 0,
})

export const feedItemTitle = atoms({
  fontWeight: 'display',
  fontSize: 18,
  color: 'text1',
})

export const feedItemSubtitle = atoms({
  fontSize: 16,
  color: 'text2',
})

export const feedItemMeta = atoms({
  color: 'text3',
  fontSize: 14,
})

export const feedItemActorName = style({
  textDecoration: 'none',
  color: theme.colors.text2,
  ':hover': {
    color: theme.colors.accent,
  },
})

export const feedItemChainName = style({
  textDecoration: 'none',
  color: theme.colors.text2,
})

export const feedItemImage = style([
  atoms({
    borderRadius: 'curved',
    overflow: 'hidden',
    w: '100%',
  }),
  {
    aspectRatio: '1 / 1',
    objectFit: 'cover',
    '@media': {
      '(min-width: 480px)': {
        width: '240px',
        flexShrink: 0,
      },
    },
  },
])

export const feedItemContentHorizontal = style({
  '@media': {
    '(min-width: 480px)': {
      display: 'flex',
      flexDirection: 'row',
      gap: space.x4,
      alignItems: 'flex-start',
    },
  },
})

export const feedItemTextContentWrapper = style([
  {
    width: '100%',
    containerType: 'inline-size',
  },
])

export const feedItemTextContent = style([
  atoms({
    p: 'x4',
    borderRadius: 'curved',
    backgroundColor: 'border',
  }),
  {
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    wordBreak: 'break-word',
    maxWidth: '100%',
    width: '100%',
    maxHeight: '100cqw',
    overflow: 'auto',
    fontSize: 14,
  },
])

globalStyle(`${feedItemTextContent} :is(h1, h2, h3, h4, h5, h6)`, {
  fontFamily: 'Londrina Solid!important',
  marginTop: 12,
  marginBottom: 6,
})

globalStyle(`${feedItemTextContent} > p`, {
  marginBottom: 20,
})

globalStyle(`${feedItemTextContent} code`, {
  backgroundColor: 'rgba(0, 0, 0, 0.17)',
  padding: '0.2em 0.4em',
  borderRadius: '6px',
  fontFamily: 'monospace!important',
})

globalStyle(`${feedItemTextContent} pre`, {
  backgroundColor: 'rgba(0, 0, 0, 0.17)',
  padding: '1em',
  borderRadius: '6px',
  fontFamily: 'monospace!important',
  display: 'block',
  overflow: 'auto',
  whiteSpace: 'pre-wrap',
  maxWidth: '100%',
})

globalStyle(`${feedItemTextContent} pre code`, {
  backgroundColor: 'transparent',
  padding: 0,
})

globalStyle(`${feedItemTextContent} blockquote`, {
  color: '#808080',
  padding: '0 1em',
  borderLeft: '0.25em solid #808080',
  margin: 0,
  marginBottom: 20,
})

globalStyle(`${feedItemTextContent} *`, {
  wordWrap: 'break-word',
  overflowWrap: 'break-word',
  wordBreak: 'break-word',
  maxWidth: '100%',
})

globalStyle(`${feedItemTextContent} a`, {
  wordBreak: 'break-all',
})

export const feedItemMetaRow = style({
  display: 'flex',
  flexDirection: 'column',
  gap: space.x3,
  width: '100%',
  '@media': {
    '(min-width: 768px)': {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: space.x4,
    },
  },
})
