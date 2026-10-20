import * as z from '@buildeross/constants/layers'
import { vars } from '@buildeross/zord'
import { keyframes, style } from '@vanilla-extract/css'

const fadeIn = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
})

const popIn = keyframes({
  from: { opacity: 0, transform: 'translateY(-8px) scale(0.98)' },
  to: { opacity: 1, transform: 'translateY(0) scale(1)' },
})

// ---------------------------------------------------------------------------
// Nav trigger
// ---------------------------------------------------------------------------

export const triggerButton = style({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  height: 40,
  padding: '0 12px',
  borderRadius: 999,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.background1,
  color: vars.color.text3,
  cursor: 'pointer',
  fontSize: 14,
  transition: 'border-color 0.1s ease-in-out, background 0.1s ease-in-out',
  selectors: {
    '&:hover': { background: vars.color.neutralHover },
    '&:focus-visible': {
      outline: `2px solid ${vars.color.focusRing}`,
      outlineOffset: 2,
    },
  },
  '@media': {
    'screen and (max-width: 767px)': {
      width: 40,
      padding: 0,
      justifyContent: 'center',
    },
  },
})

export const triggerLabel = style({
  minWidth: 120,
  textAlign: 'left',
  '@media': {
    'screen and (max-width: 1023px)': { minWidth: 0 },
    'screen and (max-width: 767px)': { display: 'none' },
  },
})

export const kbd = style({
  fontFamily: vars.fonts.mono,
  fontSize: 11,
  lineHeight: '16px',
  padding: '0 6px',
  borderRadius: 4,
  border: `1px solid ${vars.color.border}`,
  color: vars.color.text3,
  background: vars.color.background2,
  whiteSpace: 'nowrap',
})

export const triggerKbd = style([
  kbd,
  {
    '@media': {
      'screen and (max-width: 767px)': { display: 'none' },
    },
  },
])

// ---------------------------------------------------------------------------
// Palette dialog
// ---------------------------------------------------------------------------

export const backdrop = style({
  position: 'fixed',
  inset: 0,
  background: vars.color.backdrop,
  zIndex: z.MODAL_BACKDROP_LAYER,
  animation: `${fadeIn} 0.12s ease-out`,
})

export const dialog = style({
  position: 'fixed',
  top: '10vh',
  left: '50%',
  transform: 'translateX(-50%)',
  width: 'min(680px, calc(100vw - 32px))',
  maxHeight: '75vh',
  display: 'flex',
  flexDirection: 'column',
  background: vars.color.background1,
  border: `1px solid ${vars.color.border}`,
  borderRadius: 16,
  boxShadow: vars.shadows.medium,
  zIndex: z.MODAL_CONTENT_LAYER,
  overflow: 'hidden',
  '@media': {
    'screen and (max-width: 767px)': {
      top: 0,
      left: 0,
      transform: 'none',
      width: '100vw',
      height: '100dvh',
      maxHeight: 'none',
      borderRadius: 0,
      border: 'none',
    },
  },
})

export const dialogInner = style({
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
  flex: 1,
  animation: `${popIn} 0.14s ease-out`,
})

export const inputRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '0 16px',
  borderBottom: `1px solid ${vars.color.border}`,
})

export const input = style({
  flex: 1,
  minWidth: 0,
  height: 56,
  border: 'none',
  outline: 'none',
  background: 'transparent',
  color: vars.color.text1,
  fontSize: 16,
  selectors: {
    '&::placeholder': { color: vars.color.text3 },
  },
})

export const textButton = style({
  border: 'none',
  background: 'none',
  padding: 0,
  cursor: 'pointer',
  color: vars.color.text3,
  fontSize: 14,
  selectors: {
    '&:hover': { color: vars.color.text1 },
    '&:focus-visible': {
      outline: `2px solid ${vars.color.focusRing}`,
      outlineOffset: 2,
      borderRadius: 4,
    },
  },
})

export const tabs = style({
  display: 'flex',
  gap: 6,
  padding: '10px 16px',
  overflowX: 'auto',
  borderBottom: `1px solid ${vars.color.border}`,
  scrollbarWidth: 'none',
  selectors: {
    '&::-webkit-scrollbar': { display: 'none' },
  },
})

export const chip = style({
  flexShrink: 0,
  height: 30,
  padding: '0 12px',
  borderRadius: 999,
  border: `1px solid ${vars.color.border}`,
  background: 'transparent',
  color: vars.color.text2,
  fontSize: 13,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  selectors: {
    '&:hover': { background: vars.color.neutralHover },
    '&[aria-selected="true"]': {
      background: vars.color.text1,
      borderColor: vars.color.text1,
      color: vars.color.background1,
    },
    // Toggles (e.g. "This DAO") are distinct from the selected tab
    '&[aria-pressed="true"]': {
      borderColor: vars.color.accent,
      color: vars.color.accent,
    },
    '&:focus-visible': {
      outline: `2px solid ${vars.color.focusRing}`,
      outlineOffset: 2,
    },
  },
})

export const chipDivider = style({
  flexShrink: 0,
  width: 1,
  margin: '4px 4px',
  background: vars.color.border,
})

export const results = style({
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  padding: '8px 8px 12px',
})

export const groupHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 8px 6px',
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: vars.color.text3,
})

export const footer = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  padding: '10px 16px',
  borderTop: `1px solid ${vars.color.border}`,
  fontSize: 12,
  color: vars.color.text3,
  '@media': {
    'screen and (max-width: 767px)': {
      paddingBottom: 'calc(10px + env(safe-area-inset-bottom))',
    },
  },
})

export const footerHints = style({
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  '@media': {
    'screen and (max-width: 767px)': { display: 'none' },
  },
})

export const footerLink = style([
  textButton,
  {
    color: vars.color.accent,
    fontSize: 13,
    fontWeight: 500,
    selectors: {
      '&:hover': { color: vars.color.accentHover },
    },
  },
])

export const message = style({
  padding: '32px 16px',
  textAlign: 'center',
  color: vars.color.text3,
  fontSize: 14,
})

// ---------------------------------------------------------------------------
// Result rows (shared by the palette and the /search page)
// ---------------------------------------------------------------------------

export const row = style({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  width: '100%',
  padding: '10px 8px',
  borderRadius: 10,
  color: vars.color.text1,
  textDecoration: 'none',
  cursor: 'pointer',
  selectors: {
    '&:hover, &[data-active="true"]': { background: vars.color.background2 },
    '&:focus-visible': {
      outline: `2px solid ${vars.color.focusRing}`,
      outlineOffset: -2,
    },
  },
})

export const rowMedia = style({
  flexShrink: 0,
  width: 36,
  height: 36,
  borderRadius: 8,
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: vars.color.background2,
})

export const rowBody = style({
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
})

export const rowTitle = style({
  fontSize: 15,
  fontWeight: 500,
  lineHeight: '20px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

export const rowMeta = style({
  fontSize: 13,
  lineHeight: '18px',
  color: vars.color.text3,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

export const rowSnippet = style([
  rowMeta,
  {
    color: vars.color.text2,
  },
])

export const rowAside = style({
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
})

export const badge = style({
  fontSize: 11,
  fontWeight: 600,
  lineHeight: '18px',
  padding: '0 8px',
  borderRadius: 999,
  background: vars.color.background2,
  color: vars.color.text2,
  whiteSpace: 'nowrap',
})

export const badgePositive = style([badge, { color: vars.color.positive }])
export const badgeNegative = style([badge, { color: vars.color.negative }])
export const badgeAccent = style([badge, { color: vars.color.accent }])

export const chainIcon = style({
  width: 16,
  height: 16,
  borderRadius: 999,
})

export const mark = style({
  background: 'none',
  color: vars.color.text1,
  fontWeight: 700,
})

// ---------------------------------------------------------------------------
// /search page
// ---------------------------------------------------------------------------

export const pageWrapper = style({
  width: '100%',
  maxWidth: 912,
  margin: '0 auto',
  padding: '40px 16px 64px',
})

export const pageInput = style({
  width: '100%',
  height: 56,
  padding: '0 16px',
  borderRadius: 12,
  border: `2px solid ${vars.color.border}`,
  background: vars.color.background1,
  color: vars.color.text1,
  fontSize: 16,
  boxSizing: 'border-box',
  selectors: {
    '&:focus': { outline: 'none', borderColor: vars.color.text3 },
    '&::placeholder': { color: vars.color.text3 },
  },
})

export const pageSection = style({
  marginTop: 24,
})

export const pageTabs = style([
  tabs,
  {
    padding: '16px 0',
  },
])
