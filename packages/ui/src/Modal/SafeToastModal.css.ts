import * as z from '@buildeross/constants/layers'
import { vars } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const safeToastWrapper = style({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  pointerEvents: 'none', // Don't block clicks on backdrop
  zIndex: z.SAFE_TRANSACTION_LAYER,
  background: vars.color.backdrop,
  opacity: 0.4, // Faint backdrop, less prominent than regular modals
  backdropFilter: 'blur(5px)', // Lighter blur effect
  WebkitBackdropFilter: 'blur(5px)',
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
  padding: '20px',
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
      padding: '16px',
    },
  },
})
