import { style, styleVariants } from '@vanilla-extract/css'

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

const createWrapperLeft = style({
  maxHeight: '100vh',
  background: "url('/bg.jpeg') no-repeat center center",

  backgroundSize: 'cover',
})

const createWrapperRight = style({
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
      maxWidth: 420,
    },
    '(max-width: 768px)': {
      position: 'relative',
      padding: 0,
      width: '100%',
    },
  },
})
