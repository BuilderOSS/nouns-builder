import { style } from '@vanilla-extract/css'
export const holderLink = style({
  transition: 'background-color 0.2s ease-in-out',
  selectors: {
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    '&:focus-visible': {
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
  },
})
