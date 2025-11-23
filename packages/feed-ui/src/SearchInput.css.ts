import { atoms, vars } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const searchInputWrapper = style({
  position: 'relative',
  width: '100%',
  marginBottom: 8,
})

export const searchInputStyle = style([
  atoms({
    w: '100%',
    borderRadius: 'small',
  }),
  {
    border: `1px solid ${vars.color.border}`,
    fontSize: '14px',
    paddingTop: '8px',
    paddingBottom: '8px',
    paddingLeft: '12px',
    paddingRight: '64px', // Space for search icon
    transition: 'border-color 0.2s ease',
    selectors: {
      '&:focus': {
        outline: 'none',
        borderColor: vars.color.primary,
      },
    },
  },
])

export const searchInputWithClear = style({
  paddingRight: '96px', // Space for both clear and search icons
})

export const searchIconStyle = style({
  position: 'absolute',
  right: 12,
  top: '50%',
  transform: 'translateY(-50%)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 20,
  height: 20,
  background: 'none',
  border: 'none',
  padding: 0,
  selectors: {
    '&:hover': {
      opacity: 0.7,
    },
  },
})

export const clearIconStyle = style({
  position: 'absolute',
  right: 38, // Position left of search icon
  top: '50%',
  transform: 'translateY(-50%)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 16,
  height: 16,
  background: 'none',
  border: 'none',
  padding: 0,
  selectors: {
    '&:hover': {
      opacity: 0.7,
    },
  },
})

export const helperTextStyle = style({
  position: 'absolute',
  top: '100%',
  left: 12,
  marginTop: 4,
  fontSize: 12,
  color: vars.color.text3,
  transition: 'opacity 0.2s ease-in-out',
  pointerEvents: 'none',
  whiteSpace: 'nowrap',
  selectors: {
    '&.visible': {
      opacity: 1,
    },
    '&.hidden': {
      opacity: 0,
    },
  },
})
