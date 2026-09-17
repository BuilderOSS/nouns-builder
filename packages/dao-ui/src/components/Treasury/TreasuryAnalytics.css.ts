import { skeletonAnimation } from '@buildeross/ui/styles'
import { vars } from '@buildeross/zord'
import { style, styleVariants } from '@vanilla-extract/css'

export const metricsGrid = style({
  gridTemplateColumns: 'repeat(4, 1fr)',
  gridGap: '0.5rem',
  '@media': {
    'screen and (max-width: 768px)': {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
  },
})

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

export const windowTab = styleVariants({
  selected: [tabBase, { borderBottom: `2px solid ${vars.color.text1} !important` }],
  unselected: [tabBase, { borderBottom: '2px solid transparent !important' }],
})

export const chartBox = style({
  width: '100%',
  height: '260px',
  '@media': {
    'screen and (max-width: 768px)': {
      height: '180px',
    },
  },
})

export const chartSvg = style({
  display: 'block',
  width: '100%',
  height: 'auto',
  overflow: 'visible',
})

export const chartLine = style({
  fill: 'none',
  stroke: vars.color.text1,
  strokeWidth: 2,
  strokeLinejoin: 'round',
  strokeLinecap: 'round',
  vectorEffect: 'non-scaling-stroke',
})

// Theme-agnostic translucent grays so gridlines stay visible in both
// light and dark themes (the `border` token goes near-invisible on dark).
export const chartGrid = style({
  stroke: 'rgba(128, 128, 128, 0.2)',
  strokeWidth: 1,
  vectorEffect: 'non-scaling-stroke',
})

export const chartBaseline = style({
  stroke: 'rgba(128, 128, 128, 0.45)',
  strokeWidth: 1,
  vectorEffect: 'non-scaling-stroke',
})

export const chartAxisLabel = style({
  fill: vars.color.text3,
  fontSize: '14px',
  fontFamily: 'inherit',
})

export const chartGradientTop = style({
  stopColor: vars.color.text1,
  stopOpacity: 0.16,
})

export const chartGradientBottom = style({
  stopColor: vars.color.text1,
  stopOpacity: 0,
})

export const chartSkeleton = style({
  animation: skeletonAnimation,
  width: '100%',
  height: '260px',
  borderRadius: vars.radii.curved,
  '@media': {
    'screen and (max-width: 768px)': {
      height: '180px',
    },
  },
})
