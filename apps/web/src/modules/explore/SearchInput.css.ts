import { style } from '@vanilla-extract/css'

export const searchInputWrapper = style({
  position: 'relative',
  width: '100%',
})

export const searchInputStyle = style({
  height: 64,
  width: '100%',
  backgroundColor: '#F2F2F2',
  borderRadius: '12px',
  fontSize: 16,
  paddingLeft: 16,
  paddingRight: 80, // Space for search icon
  boxSizing: 'border-box',
  border: '2px solid #fff',
  selectors: {
    '&:focus': {
      outline: 'none',
      backgroundColor: '#FFF',
      borderColor: '#E6E6E6',
    },
    '&::placeholder': {
      color: '#B3B3B3',
    },
  },
})

export const searchInputWithClear = style({
  paddingRight: 110, // Space for both clear and search icons
})

export const searchIconStyle = style({
  position: 'absolute',
  right: 16,
  top: '50%',
  transform: 'translateY(-50%)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 24,
  height: 24,
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
  right: 50, // Position left of search icon
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
