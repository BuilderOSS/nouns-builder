import { keyframes, style } from '@vanilla-extract/css'

export const uploadNotificationWrapper = style({
  position: 'relative',
  padding: '12px 16px',
  backgroundColor: '#fff',
  border: '1px solid #000',
  borderRadius: '6px',
  overflow: 'hidden',
  '@media': {
    '(max-width: 768px)': {
      background: '#fff',
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
  backgroundColor: '#000',
  transition: 'width 0.3s ease',
})

export const contentWrapper = style({
  position: 'relative',
  zIndex: 2,
})

export const progressText = style({
  color: '#000',
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
  border: '3px solid #e5e5e5',
  borderTop: '3px solid #000',
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
  color: '#000',
  lineHeight: 1,
  zIndex: 1,
})
