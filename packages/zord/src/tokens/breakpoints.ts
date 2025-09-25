export const breakpoints = [480, 576, 768, 1024, 1440]

/*
  To be used within `vanilla-extract` media queries

  Example:

  export const test = style({
    width: '100%',
    '@media': {
      [media.min480]: {
        width: 500,
      },
    }
  })

*/

export const media = Object.fromEntries(
  breakpoints.map((width) => [`min${width}`, `(min-width: ${width}px)`])
)

// @TODO: For `responsiveProperties` in atoms.css.ts
export const themeBreakpoints = Object.fromEntries(
  breakpoints.map((width) => [`min${width}`, { '@media': `(min-width: ${width}px)` }])
)
