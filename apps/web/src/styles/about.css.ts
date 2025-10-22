import { globalStyle, style } from '@vanilla-extract/css'

export const whyTextStyle = style({
  maxWidth: 720,
})

globalStyle(`${whyTextStyle} > *`, {
  fontFamily: 'Arial Narrow, sans-serif!important',
})

export const whyCreateButton = style({
  selectors: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
})
