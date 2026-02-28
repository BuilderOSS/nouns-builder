import { style, styleVariants } from '@vanilla-extract/css'

export const defaultUploadStyle = style({
  display: 'none',
})

export const uploadErrorBox = style({
  color: '#ff0015',
  boxSizing: 'border-box',
})

export const singleImageUploadWrapperVariants = styleVariants({
  sm: {
    height: 80,
    width: 80,
    borderRadius: 40,
    background: '#F2F2F2',
    overflow: 'hidden',
    selectors: {
      '&:hover': {
        cursor: 'pointer',
      },
    },
  },
  md: {
    height: 160,
    width: 160,
    borderRadius: 80,
    background: '#F2F2F2',
    overflow: 'hidden',
    selectors: {
      '&:hover': {
        cursor: 'pointer',
      },
    },
  },
  lg: {
    height: 240,
    width: 240,
    borderRadius: 120,
    background: '#F2F2F2',
    overflow: 'hidden',
    selectors: {
      '&:hover': {
        cursor: 'pointer',
      },
    },
  },
  xl: {
    height: 320,
    width: 320,
    borderRadius: 160,
    background: '#F2F2F2',
    overflow: 'hidden',
    selectors: {
      '&:hover': {
        cursor: 'pointer',
      },
    },
  },
})
