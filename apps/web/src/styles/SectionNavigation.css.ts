import { atoms, media, vars } from '@buildeross/zord'
import { style, styleVariants } from '@vanilla-extract/css'

export const sectionNavigation = style({
  width: '100%',
})

export const sectionNavigationWrapper = style({
  margin: '0 -16px 0 -16px',
  selectors: {
    '&::after': {
      content: '',
      display: 'block',
      borderBottom: '2px solid',
      borderColor: vars.color.border,
      marginBottom: vars.space.x4,
    },
  },
  '@media': {
    [media.min768]: {
      selectors: {
        '&::after': {
          marginBottom: vars.space.x8,
        },
      },
    },
  },
})

export const sectionMobileMenuButton = style({
  selectors: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
})

export const sectionTab = style([
  atoms({ mx: { '@initial': 'x2', '@768': 'x3' } }),
  {
    cursor: 'pointer',
    width: 'fit-content',
    selectors: {
      '&::after': {
        content: '',
        display: 'block',
        borderBottom: '2px solid',
        borderRadius: 12,
      },
    },
  },
])

export const sectionTabVariants = styleVariants({
  default: [sectionTab],
  active: [
    sectionTab,
    {
      selectors: {
        '&::after': {
          content: '',
          display: 'block',
          height: 1,
          width: '100%',
          marginTop: '16px',
          backgroundColor: '#000',
        },
      },
    },
  ],
})

export const sectionHandler = style({
  width: '100%',
})
