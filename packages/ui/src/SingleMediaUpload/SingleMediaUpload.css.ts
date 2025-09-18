import { style } from '@vanilla-extract/css'

export const defaultUploadStyle = style({
  display: 'none',
})

export const uploadErrorBox = style({
  color: '#ff0015',
  boxSizing: 'border-box',
})

export const singleMediaUploadWrapper = style({
  height: 64,
  width: '100%',
  borderRadius: 15,
  background: '#F2F2F2',
  overflow: 'hidden',
  selectors: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
})
