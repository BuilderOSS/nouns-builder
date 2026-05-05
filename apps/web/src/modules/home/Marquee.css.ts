import { style } from '@vanilla-extract/css'

const baseStyles = {
  height: '110px',
  width: 'auto',
}

const getMobileStyle = (width: string) => {
  return {
    '@media': {
      'screen and (max-width: 768px)': {
        height: 'auto',
        width: width,
      },
    },
  }
}

export const Unlock = style([baseStyles, getMobileStyle('130px')])
export const UnlockDark = style([baseStyles, getMobileStyle('130px')])
export const PurpleGalaxy = style([baseStyles, getMobileStyle('34px')])
export const The = style([baseStyles, getMobileStyle('62px')])
export const TheDark = style([baseStyles, getMobileStyle('62px')])
export const BlueWheel = style([baseStyles, getMobileStyle('36px')])
export const Possibilities = style([baseStyles, getMobileStyle('225px')])
export const PossibilitiesDark = style([baseStyles, getMobileStyle('225px')])
export const Of = style([baseStyles, getMobileStyle('38px')])
export const OfDark = style([baseStyles, getMobileStyle('38px')])
export const GreenClover = style([baseStyles, getMobileStyle('36px')])
export const Collective = style([baseStyles, getMobileStyle('180px')])
export const CollectiveDark = style([baseStyles, getMobileStyle('180px')])
export const PurpleStar = style([baseStyles, getMobileStyle('36px')])
export const BlueSun = style([baseStyles, getMobileStyle('36px')])
export const NounsGlasses = style([baseStyles, getMobileStyle('62px')])
export const Creation = style([baseStyles, getMobileStyle('157px')])
export const CreationDark = style([baseStyles, getMobileStyle('157px')])

const darkWordSelector = 'html[data-theme-mode="dark"] &'

export const lightWord = style({
  display: 'block',
  selectors: {
    [darkWordSelector]: {
      display: 'none',
    },
  },
})

export const darkWord = style({
  display: 'none',
  selectors: {
    [darkWordSelector]: {
      display: 'block',
    },
  },
})
