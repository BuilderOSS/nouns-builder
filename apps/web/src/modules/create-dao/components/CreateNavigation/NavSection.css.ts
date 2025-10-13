import { style, styleVariants } from '@vanilla-extract/css'

const flowTitleBase = style({
  position: 'absolute',
  fontSize: 18,
  fontWeight: 700,
  color: '#FFF',
  top: 30,
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
  preview: [flowTitleBase, { color: '#DADADA' }],
  previewActive: [flowTitleBase, { color: '#000' }],
})

const flowFulfilledCircle = style({
  backgroundColor: '#FFF',
  border: '2px solid #FFF',
  selectors: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
})

const flowFulfilledCircleLast = style({
  backgroundColor: '#FFF',
  border: '2px solid #FFF',

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
  backgroundColor: 'rgba(255,255,255, 0)',
  border: '2px solid #FFF',
  '@media': {
    'screen and (max-width: 768px)': {
      backgroundColor: '#FFF',
      border: '2px solid #F2F2F2',
    },
  },
})

const flowCircleLast = style({
  backgroundColor: 'rgba(255,255,255, 0)',
  border: '2px solid #FFF',
  '@media': {
    'screen and (max-width: 768px)': {
      backgroundColor: '#FFF',
      border: '2px solid #F2F2F2',
    },
  },
  selectors: {
    '&:before': {
      content: 'none',
    },
  },
})

const flowCircleActive = style({
  backgroundColor: '#FFF',
  border: '2px solid #FFF',
  '@media': {
    'screen and (max-width: 768px)': {
      border: '2px solid #F2F2F2',
    },
  },
})

const flowCircleActiveLast = style({
  backgroundColor: '#FFF',
  border: '2px solid #FFF',
  selectors: {
    '&:before': {
      content: 'none',
    },
  },
})

const circleBase = style({
  position: 'relative',
  color: '#1CB687',
  borderRadius: '100%',
})

export const circleVariant = styleVariants({
  flowCircle: [circleBase, flowCircle],
  flowCircleLast: [circleBase, flowCircleLast],
  flowCircleActive: [circleBase, flowCircleActive],
  flowCircleActiveLast: [circleBase, flowCircleActiveLast],
  flowFulfilledCircle: [circleBase, flowFulfilledCircle],
  flowFulfilledCircleLast: [circleBase, flowFulfilledCircleLast],
  preview: [circleBase, { backgroundColor: '#DADADA' }],
  previewActive: [circleBase, { backgroundColor: '#000' }],
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
      border: '1px dashed #FFF',
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
          border: '1px dashed #B3B3B3',
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
