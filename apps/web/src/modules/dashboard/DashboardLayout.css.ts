import { globalStyle, style } from '@vanilla-extract/css'

export const sidebar = style({
  width: '100%',
  '@media': {
    '(min-width: 1024px)': {
      position: 'sticky',
      top: 16,
      alignSelf: 'flex-start',
      maxWidth: 360,
      transition: 'top 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
    '(min-width: 1280px)': {
      maxWidth: 480,
    },
  },
})

// When header is visible (data-header-visible="true")
globalStyle(`${sidebar}[data-header-visible="true"] [data-accordion-content]`, {
  '@media': {
    '(min-width: 1024px)': {
      maxHeight: 'calc(100vh - 516px)',
      overflowY: 'auto',
      overflowX: 'hidden',
      transition: 'max-height 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
})

// When header is hidden (data-header-visible="false"), add 80px to maxHeight
globalStyle(`${sidebar}[data-header-visible="false"] [data-accordion-content]`, {
  '@media': {
    '(min-width: 1024px)': {
      maxHeight: 'calc(100vh - 436px)', // 500px - 80px = 420px
      overflowY: 'auto',
      overflowX: 'hidden',
      transition: 'max-height 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
})

export const desktopLayout = style({
  display: 'none',
  '@media': {
    '(min-width: 1024px)': {
      display: 'flex',
    },
  },
})

export const mobileLayout = style({
  display: 'block',
  paddingBottom: '64px',
  '@media': {
    '(min-width: 1024px)': {
      display: 'none',
      paddingBottom: 0,
    },
  },
})
