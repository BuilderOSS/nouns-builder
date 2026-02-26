import * as z from '@buildeross/constants/layers'
import { style, styleVariants } from '@vanilla-extract/css'

const baseDropdownMenu = style({
  position: 'absolute',
  top: 'calc(100% + 4px)',
  width: '100%',
  minWidth: '200px',
  zIndex: z.DROPDOWN_MENU_LAYER,
  backgroundColor: '#fff',
  border: '2px solid #E2E2E2',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  maxHeight: '300px',
  overflowY: 'auto',
  color: '#000',
  '@media': {
    'screen and (max-width: 768px)': {
      maxHeight: '250px',
    },
  },
})

export const absoluteDropdownMenu = styleVariants({
  left: [
    baseDropdownMenu,
    {
      left: 0,
      right: 'auto',
    },
  ],
  right: [
    baseDropdownMenu,
    {
      left: 'auto',
      right: 0,
    },
  ],
})

export const dropdownOption = style({
  backgroundColor: '#fff',
  color: '#000',
  ':hover': {
    backgroundColor: '#F2F2F2',
    cursor: 'pointer',
  },
})
