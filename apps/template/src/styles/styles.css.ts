import { globalStyle } from '@vanilla-extract/css'

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
