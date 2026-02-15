import { atoms } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const commentsContainer = style([
  atoms({
    w: '100%',
  }),
])

export const commentsTitle = style([
  atoms({
    mb: 'x4',
  }),
])

export const commentCard = style([
  atoms({
    p: 'x4',
    backgroundColor: 'background2',
    borderRadius: 'curved',
  }),
])

export const commentHeader = style([
  atoms({
    mb: 'x3',
  }),
])

export const commentAuthor = style({
  cursor: 'pointer',
  transition: 'opacity 0.2s ease',
  ':hover': {
    opacity: 0.8,
  },
})

export const commentContent = style([
  atoms({
    color: 'text1',
  }),
  {
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
  },
])

export const loadMoreButton = style([
  atoms({
    mt: 'x4',
    w: '100%',
  }),
])
