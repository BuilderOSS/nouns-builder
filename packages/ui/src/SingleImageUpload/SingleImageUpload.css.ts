import { style } from '@vanilla-extract/css'

export const defaultUploadStyle = style({
  display: 'none',
})

export const uploadErrorBox = style({
  color: '#ff0015',
  boxSizing: 'border-box',
})

export const singleImageUploadWrapper = style({
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
})
