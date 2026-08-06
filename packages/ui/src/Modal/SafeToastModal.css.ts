import * as z from '@buildeross/constants/layers'
import { vars } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const safeToastWrapper = style({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  pointerEvents: 'none', // Don't block clicks, no backdrop
  zIndex: z.SAFE_TRANSACTION_LAYER,
})

export const safeToastContainer = style({
  position: 'fixed',
  top: '16px',
  right: '16px',
  width: '400px',
  maxWidth: 'calc(100vw - 32px)',
  zIndex: z.SAFE_TRANSACTION_LAYER,
  background: vars.color.background1,
  borderRadius: '12px',
  padding: '32px',
  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15)',
  pointerEvents: 'auto', // Re-enable pointer events for the content
  selectors: {
    'html[data-theme-mode="dark"] &': {
      background: vars.color.background1,
      border: `1px solid ${vars.color.border}`,
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)',
    },
  },
  '@media': {
    'screen and (max-width: 768px)': {
      top: '8px',
      right: '8px',
      width: 'calc(100vw - 16px)',
      padding: '24px',
    },
  },
})
