import { vars } from '@buildeross/zord'
import { style, styleVariants } from '@vanilla-extract/css'

const circleBackgroundBorder = {
  backgroundColor: vars.color.background1,
  border: `2px solid ${vars.color.background1}`,
}

const circleBorderMobile = {
  '@media': {
    'screen and (max-width: 768px)': {
      border: `2px solid ${vars.color.background2}`,
    },
  },
}

const lastCircleSelector = {
  selectors: {
    '&:before': {
      content: 'none',
    },
  },
}

const flowTitleBase = style({
  position: 'absolute',
  fontSize: 18,
  fontWeight: 700,
  color: vars.color.onAccent,
  top: 30,
  opacity: 0.8,
  '@media': {
    '(max-width: 768px)': {
      display: 'none',
    },
    '(max-width: 1080px)': {
      fontSize: 16,
    },
  },
})

export const flowTitleVariant = styleVariants({
  active: [flowTitleBase, { opacity: 1 }],
  default: [flowTitleBase],
  fulfilled: [flowTitleBase, { opacity: 1 }],
  preview: [flowTitleBase, { color: vars.color.text4 }],
  previewActive: [flowTitleBase, { color: vars.color.text1 }],
})

const flowFulfilledCircle = style({
  ...circleBackgroundBorder,
  selectors: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
})

const flowFulfilledCircleLast = style({
  ...circleBackgroundBorder,

  selectors: {
    '&:before': {
      content: 'none',
    },
    '&:hover': {
      cursor: 'pointer',
    },
  },
})

const flowCircle = style({
  backgroundColor: 'transparent',
  border: `2px solid ${vars.color.background1}`,
  '@media': {
    'screen and (max-width: 768px)': {
      backgroundColor: vars.color.background1,
      border: `2px solid ${vars.color.background2}`,
    },
  },
})

const flowCircleLast = style({
  backgroundColor: 'transparent',
  border: `2px solid ${vars.color.background1}`,
  '@media': {
    'screen and (max-width: 768px)': {
      backgroundColor: vars.color.background1,
      border: `2px solid ${vars.color.background2}`,
    },
  },
  ...lastCircleSelector,
})

const flowCircleActive = style({
  ...circleBackgroundBorder,
  ...circleBorderMobile,
})

const flowCircleActiveLast = style({
  ...circleBackgroundBorder,
  ...circleBorderMobile,
  ...lastCircleSelector,
})

const circleBase = style({
  position: 'relative',
  color: vars.color.positive,
  borderRadius: '100%',
})

export const circleVariant = styleVariants({
  flowCircle: [circleBase, flowCircle],
  flowCircleLast: [circleBase, flowCircleLast],
  flowCircleActive: [circleBase, flowCircleActive],
  flowCircleActiveLast: [circleBase, flowCircleActiveLast],
  flowFulfilledCircle: [circleBase, flowFulfilledCircle],
  flowFulfilledCircleLast: [circleBase, flowFulfilledCircleLast],
  preview: [circleBase, { backgroundColor: vars.color.text4 }],
  previewActive: [circleBase, { backgroundColor: vars.color.text1 }],
})

const flowSectionWrapper = style({
  marginRight: 85,
  selectors: {
    '&:last-of-type': {
      marginRight: 0,
    },
    '&:first-child&:before': {
      position: 'absolute',
      content: '',
      top: '50%',
      marginTop: -1,
      width: 516,
      border: `1px dashed ${vars.color.background1}`,
      opacity: 0.7,
      '@media': {
        '(max-width: 1080px)': {
          width: 368,
        },
        '(max-width: 768px)': {
          display: 'none',
        },
      },
    },
  },
  '@media': {
    '(max-width: 1080px)': {
      marginRight: 55,
    },
  },
})

export const flowSectionWrapperVariants = styleVariants({
  default: [flowSectionWrapper],
  preview: [
    flowSectionWrapper,
    {
      selectors: {
        '&:first-child&:before': {
          position: 'absolute',
          content: '',
          top: '50%',
          marginTop: -1,
          width: 516,
          border: `1px dashed ${vars.color.text4}`,
          '@media': {
            '(max-width: 1080px)': {
              width: 368,
            },
            '(max-width: 768px)': {
              display: 'none',
            },
          },
        },
      },
    },
  ],
})
