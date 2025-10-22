import { style, styleVariants } from '@vanilla-extract/css'

export const infoSectionStyle = style({
  display: 'flex',
  '@media': {
    '(max-width: 768px)': {
      paddingLeft: '5px',
      paddingRight: '5px',
    },
  },
})

export const infoSectionValueWrapperStyle = style({
  width: '100%',
  lineHeight: '24px',
  overflow: 'auto',
  fontSize: '18px',
  '@media': {
    '(max-width: 1200px)': {
      fontSize: '16px',
    },
  },
})

export const infoSectionValueVariants = styleVariants({
  default: [infoSectionValueWrapperStyle],
  sub: [infoSectionValueWrapperStyle, { paddingLeft: 0 }],
})

export const infoSectionLabelStyle = style({
  fontSize: 12,
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '.05em',
  color: '#4D4D4D',
})

export const infoSectionValueStyle = style({
  fontSize: 18,
})
