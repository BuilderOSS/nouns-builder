import { style, styleVariants } from '@vanilla-extract/css'
import { skeletonAnimation } from 'src/styles/animations.css'

const tabBase = style({
  textTransform: 'capitalize',
  width: 'fit-content',
  borderRadius: '0px !important',
  selectors: {
    '&:not([disabled]):hover': {
      backgroundColor: 'transparent !important',
    },
  },
})
const selected = style({
  borderBottom: '2px solid black !important',
})
const unselected = style({
  borderBottom: '2px solid transparent !important',
})
const inner = style({
  fontSize: '14px',
  fontWeight: 500,
  height: 'fit-content',
})

export const buttonTab = styleVariants({
  selected: [tabBase, selected],
  unselected: [tabBase, unselected],
  innerSelected: [tabBase, selected, inner],
  innerUnselected: [tabBase, unselected, inner],
})

export const chartSkeleton = style({
  animation: skeletonAnimation,
  height: '330px',
  maxWidth: '912px',
  '@media': {
    'screen and (max-width: 768px)': {
      height: '125px',
    },
  },
})
export const outerBox = style({
  height: '464px',
  maxWidth: '912px',
  '@media': {
    'screen and (max-width: 768px)': {
      height: 'fit-content',
    },
  },
})

export const viewBox = style({
  height: '100%',
  maxWidth: '912px',
  width: '100%',
})
export const innerBox = style({
  height: '83%',
  width: '100%',
})
export const displayPanelBox = style({
  height: '300px',
  maxWidth: '912px',
})

export const graphOnLoadStyles = style({
  opacity: '0',
  strokeDasharray: '1000 1000', // Some large number to initially hide the line
  strokeDashoffset: '1000', // Same large number to initially hide the line
})
export const svgBox = style({
  overflow: 'visible',
})
export const cursorText = style({
  fontSize: '20px',
  '@media': {
    'screen and (max-width: 768px)': {
      fontSize: '12px',
    },
  },
})
