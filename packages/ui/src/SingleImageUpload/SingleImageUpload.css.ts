import { vars } from '@buildeross/zord'
import { style, styleVariants } from '@vanilla-extract/css'

export const defaultUploadStyle = style({
  display: 'none',
})

export const uploadErrorBox = style({
  color: vars.color.negative,
  boxSizing: 'border-box',
})

export const singleImageUploadWrapperVariants = styleVariants({
  sm: {
    border: 0,
    padding: 0,
    height: 80,
    width: 80,
    borderRadius: 40,
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
  },
  md: {
    border: 0,
    padding: 0,
    height: 160,
    width: 160,
    borderRadius: 80,
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
  },
  lg: {
    border: 0,
    padding: 0,
    height: 240,
    width: 240,
    borderRadius: 120,
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
  },
  xl: {
    border: 0,
    padding: 0,
    height: 320,
    width: 320,
    borderRadius: 160,
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
  },
})
