import { theme } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const candidateCard = style({
  width: '100%',
  cursor: 'pointer',
  transition: 'all 0.15s ease-in-out',
  borderColor: theme.colors.border,
  background: theme.colors.background1,
  overflow: 'hidden',
  ':hover': {
    borderColor: theme.colors.neutralHover,
    boxShadow: `0 2px 8px ${theme.colors.ghostHover}`,
  },
})

export const title = style({
  minWidth: 0,
  flexGrow: 1,
})

export const stats = style({
  flexShrink: 0,
  width: '100%',
})

export const versionBadge = style({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '4px 10px',
  borderRadius: '999px',
  border: `1px solid ${theme.colors.border}`,
  background: theme.colors.background2,
  color: theme.colors.text3,
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.02em',
})

export const statPill = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 10px',
  borderRadius: '999px',
  border: `1px solid ${theme.colors.border}`,
  background: theme.colors.background2,
  color: theme.colors.text3,
  fontSize: '13px',
  whiteSpace: 'nowrap',
})

export const statusPill = style({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '6px 10px',
  borderRadius: '999px',
  border: `1px solid ${theme.colors.border}`,
  background: theme.colors.background2,
  color: theme.colors.text3,
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.02em',
  flexShrink: 0,
})

export const bodyText = style({
  lineHeight: 1.5,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
})
