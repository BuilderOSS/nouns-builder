import { color } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const hiddenDaoDisclosure = style({
  width: '100%',
})

export const hiddenDaoDisclosureTrigger = style({
  width: '100%',
  minHeight: '28px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '4px 6px',
  border: '0',
  borderRadius: '10px',
  background: 'transparent',
  color: 'inherit',
  textAlign: 'left',
  transition: 'background-color 0.12s ease',
  selectors: {
    '&:hover': {
      backgroundColor: color.background2,
    },
  },
})

export const hiddenDaoDisclosureChevron = style({
  flexShrink: 0,
  transition: 'transform 0.12s ease',
})

export const hiddenDaoDisclosureChevronOpen = style({
  transform: 'rotate(0deg)',
})

export const hiddenDaoDisclosureChevronClosed = style({
  transform: 'rotate(-90deg)',
})

export const hiddenDaoDisclosureContent = style({
  width: '100%',
  marginTop: '8px',
})
