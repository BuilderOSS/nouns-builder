import { globalStyle, style, styleVariants } from '@vanilla-extract/css'

/*  Globals  */
globalStyle('*', {
  fontFamily: "'ptRoot', Arial, Helvetica, sans-serif!important",
})

globalStyle('h1, h2, h3, h4', {
  fontFamily: "'Londrina Solid', cursive",
  lineHeight: 'initial',
})

globalStyle('img', {
  maxWidth: '100%',
  height: 'auto',
})

/*    */
export const pageGrid = style({
  display: 'grid',
  minHeight: '100vh',
  gridTemplateColumns: '1fr 1fr',
  gridTemplateRows: '1fr',
  width: '100%',
  maxHeight: '100vh',
  overflow: 'hidden',
  '@media': {
    '(max-width: 768px)': {
      gridTemplateColumns: '1fr',
      minHeight: 'auto',
      overflow: 'initial',
    },
  },
})

/*  /pages/create -- forms   */
export const flowWrapper = style({
  display: 'flex',
  position: 'absolute',
  bottom: 84,
  left: '50%',
  margin: '0 auto',
  transform: 'translateX(-50%)',
  zIndex: 1,
  justifyContent: 'space-around',
  '@media': {
    '(max-width: 768px)': {
      display: 'none',
      position: 'relative',
      padding: 0,
      width: '100%',
      zIndex: 1,
      marginLeft: -0,
      left: 0,
      marginBottom: -184,
      paddingTop: 300,
    },
  },
})

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

export const flowFulfilledCircle = style({
  backgroundColor: '#FFF',
  border: '2px solid #FFF',
  selectors: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
})

export const flowFulfilledCircleLast = style({
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

export const flowCircle = style({
  backgroundColor: 'rgba(255,255,255, 0)',
  border: '2px solid #FFF',
  '@media': {
    'screen and (max-width: 768px)': {
      backgroundColor: '#FFF',
      border: '2px solid #F2F2F2',
    },
  },
})

export const flowCircleLast = style({
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

export const flowCircleActive = style({
  backgroundColor: '#FFF',
  border: '2px solid #FFF',
  '@media': {
    'screen and (max-width: 768px)': {
      border: '2px solid #F2F2F2',
    },
  },
})

export const flowCircleActiveLast = style({
  backgroundColor: '#FFF',
  border: '2px solid #FFF',
  selectors: {
    '&:before': {
      content: 'none',
    },
  },
})

export const circleBase = style({
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

export const flowSectionWrapper = style({
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

const createWrapperBase = style({
  position: 'relative',
  boxSizing: 'border-box',
  width: '100%',
  '@media': {
    '(max-width: 768px)': {
      padding: 25,
      paddingTop: 80,
    },
  },
})

export const createWrapperLeft = style({
  maxHeight: '100vh',
  background: "url('/bg.jpeg') no-repeat center center",

  backgroundSize: 'cover',
})

export const createWrapperRight = style({
  overflow: 'auto',
  '@media': {
    '(max-width: 768px)': {
      overflow: 'initial',
    },
  },
})

export const createWrapperHalf = styleVariants({
  left: [createWrapperBase, createWrapperLeft],
  right: [createWrapperBase, createWrapperRight],
})

export const formWrapper = style({
  position: 'absolute',
  top: 0,
  padding: '150px 0',
  maxWidth: 528,
  width: '80%',
  '@media': {
    '(max-width: 1200px)': {
      maxWidth: 400,
    },
    '(max-width: 768px)': {
      position: 'relative',
      padding: 0,
      width: '100%',
    },
  },
})
