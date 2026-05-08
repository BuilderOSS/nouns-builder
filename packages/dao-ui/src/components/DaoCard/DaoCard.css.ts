import { atoms, theme } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const card = style({
  transition: 'all 0.15s ease-in-out',
  ':hover': {
    boxShadow: `0 2px 8px ${theme.colors.ghostHover}`,
  },
})

export const cardWrapper = style({
  position: 'relative',
  height: '100%',
})

export const daoImage = style({
  position: 'relative',
  border: `2px solid ${theme.colors.border}`,
  transition: 'border 0.15s ease-in-out',
  borderBottom: 'none',
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0,
})

export const border = style({
  border: `2px solid ${theme.colors.border}`,
  transition: 'border 0.15s ease-in-out',
  borderTop: 'none',
})

export const title = style([border])

export const name = style([
  atoms({ overflow: 'hidden', whiteSpace: 'nowrap' }),
  {
    textOverflow: 'ellipsis',
    display: 'flex',
    alignItems: 'center',
  },
])

export const auction = style([
  border,
  {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
])

export const detail = style({
  flexBasis: '50%',
  flexGrow: 0,
})

export const favoriteButton = style({
  position: 'absolute',
  top: 12,
  right: 12,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 36,
  height: 36,
  borderRadius: 999,
  border: `1px solid ${theme.colors.border}`,
  background: theme.colors.background2,
  boxShadow: `0 8px 24px ${theme.colors.ghostHover}`,
  cursor: 'pointer',
  transition: 'transform 0.12s ease, box-shadow 0.12s ease, background-color 0.12s ease',
  zIndex: 1,
  ':hover': {
    transform: 'scale(1.04)',
    borderColor: theme.colors.neutralHover,
    boxShadow: `0 10px 28px ${theme.colors.ghostHover}`,
  },
  ':focus-visible': {
    outline: `2px solid ${theme.colors.focusRing}`,
    outlineOffset: 2,
  },
  ':disabled': {
    cursor: 'not-allowed',
    opacity: 0.55,
    transform: 'none',
    borderColor: theme.colors.border,
    background: theme.colors.background2,
    boxShadow: `0 8px 24px ${theme.colors.ghostHover}`,
  },
})

export const favoriteIcon = style({
  width: 20,
  height: 20,
  display: 'inline-block',
  backgroundColor: theme.colors.text1,
  WebkitMaskSize: 'contain',
  maskSize: 'contain',
  WebkitMaskRepeat: 'no-repeat',
  maskRepeat: 'no-repeat',
  WebkitMaskPosition: 'center',
  maskPosition: 'center',
})
