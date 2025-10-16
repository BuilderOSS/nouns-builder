import { style } from '@vanilla-extract/css'

export const page = style({
  vars: {
    '--gray-rgb': '0, 0, 0',
    '--gray-alpha-200': 'rgba(var(--gray-rgb), 0.08)',
    '--gray-alpha-100': 'rgba(var(--gray-rgb), 0.05)',
    '--button-primary-hover': '#383838',
    '--button-secondary-hover': '#f2f2f2',
  },

  display: 'grid',
  gridTemplateRows: '20px 1fr 20px',
  alignItems: 'center',
  justifyItems: 'center',
  minHeight: '100svh',
  padding: '80px',
  gap: '64px',
  fontFamily: 'var(--font-geist-sans)',

  '@media': {
    '(prefers-color-scheme: dark)': {
      vars: {
        '--gray-rgb': '255, 255, 255',
        '--gray-alpha-200': 'rgba(var(--gray-rgb), 0.145)',
        '--gray-alpha-100': 'rgba(var(--gray-rgb), 0.06)',
        '--button-primary-hover': '#ccc',
        '--button-secondary-hover': '#1a1a1a',
      },
    },
    '(max-width: 600px)': {
      padding: '32px',
      paddingBottom: '80px',
    },
  },
})

export const main = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '32px',
  gridRowStart: 2,

  '@media': {
    '(max-width: 600px)': {
      alignItems: 'center',
    },
  },
})

export const mainList = style({
  fontFamily: 'var(--font-geist-mono)',
  paddingLeft: 0,
  margin: 0,
  fontSize: '14px',
  lineHeight: '24px',
  letterSpacing: '-0.01em',
  listStylePosition: 'inside',

  '@media': {
    '(max-width: 600px)': {
      textAlign: 'center',
    },
  },
})

export const mainListItem = style({
  selectors: {
    '&:not(:last-of-type)': {
      marginBottom: '8px',
    },
  },
})

export const mainCode = style({
  fontFamily: 'inherit',
  background: 'var(--gray-alpha-100)',
  padding: '2px 4px',
  borderRadius: '4px',
  fontWeight: 600,
})

export const logo = style({
  '@media': {
    '(prefers-color-scheme: dark)': {
      filter: 'invert()',
    },
  },
})

export const ctas = style({
  display: 'flex',
  gap: '16px',

  '@media': {
    '(max-width: 600px)': {
      flexDirection: 'column',
    },
  },
})

export const ctaButton = style({
  appearance: 'none',
  borderRadius: '128px',
  height: '48px',
  padding: '0 20px',
  border: 'none',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'transparent',
  transition: 'background 0.2s, color 0.2s, border-color 0.2s',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '16px',
  lineHeight: '20px',
  fontWeight: 500,

  '@media': {
    '(max-width: 600px)': {
      fontSize: '14px',
      height: '40px',
      padding: '0 16px',
    },
  },
})

export const primary = style([
  ctaButton,
  {
    background: 'var(--foreground)',
    color: 'var(--background)',
    gap: '8px',

    selectors: {
      '&:hover': {
        background: 'var(--button-primary-hover)',
        borderColor: 'transparent',
      },
    },

    '@media': {
      '(hover: hover) and (pointer: fine)': {},
    },
  },
])

export const secondary = style([
  ctaButton,
  {
    borderColor: 'var(--gray-alpha-200)',
    minWidth: '158px',

    selectors: {
      '&:hover': {
        background: 'var(--button-secondary-hover)',
        borderColor: 'transparent',
      },
    },

    '@media': {
      '(max-width: 600px)': {
        minWidth: 'auto',
      },
      '(hover: hover) and (pointer: fine)': {},
    },
  },
])

export const footer = style({
  gridRowStart: 3,
  display: 'flex',
  gap: '24px',

  '@media': {
    '(max-width: 600px)': {
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'center',
    },
  },
})

export const footerLink = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',

  selectors: {
    '&:hover': {
      textDecoration: 'underline',
      textUnderlineOffset: '4px',
    },
  },

  '@media': {
    '(hover: hover) and (pointer: fine)': {},
  },
})

export const footerImage = style({
  flexShrink: 0,
})
