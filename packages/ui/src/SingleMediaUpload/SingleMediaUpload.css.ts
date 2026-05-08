import { vars } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const defaultUploadStyle = style({
  display: 'none',
})

export const uploadErrorBox = style({
  color: vars.color.negative,
  boxSizing: 'border-box',
})

export const singleMediaUploadWrapper = style({
  border: 0,
  padding: 0,
  height: 64,
  width: '100%',
  borderRadius: 15,
  background: vars.color.background2,
  overflow: 'hidden',
  selectors: {
    '&:hover': {
      cursor: 'pointer',
    },
    '&:focus-visible': {
      outline: `2px solid ${vars.color.focusRing}`,
      outlineOffset: '2px',
    },
  },
})
