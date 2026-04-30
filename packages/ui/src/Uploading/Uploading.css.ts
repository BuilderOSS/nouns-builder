import { vars } from '@buildeross/zord'
import { keyframes, style } from '@vanilla-extract/css'

export const uploadNotificationWrapper = style({
  position: 'relative',
  padding: '12px 16px',
  backgroundColor: vars.color.background1,
  border: `1px solid ${vars.color.text1}`,
  borderRadius: '6px',
  overflow: 'hidden',
  '@media': {
    '(max-width: 768px)': {
      backgroundColor: vars.color.background1,
      bottom: 0,
      paddingTop: 5,
      paddingBottom: 5,
    },
  },
})

export const progressUnderline = style({
  position: 'absolute',
  bottom: 0,
  left: 0,
  height: '6px',
  backgroundColor: vars.color.text1,
  transition: 'width 0.3s ease',
})

export const contentWrapper = style({
  position: 'relative',
  zIndex: 2,
})

export const progressText = style({
  color: vars.color.text1,
})

export const spinnerContainer = style({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 32,
  height: 32,
})

export const customSpinner = style({
  position: 'absolute',
  width: 28,
  height: 28,
  border: `3px solid ${vars.color.border}`,
  borderTop: `3px solid ${vars.color.text1}`,
  borderRadius: '50%',
  animation: `${keyframes({
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  })} 1s linear infinite`,
})

export const percentageText = style({
  position: 'absolute',
  fontSize: 10,
  fontWeight: 600,
  color: vars.color.text1,
  lineHeight: 1,
  zIndex: 1,
})
