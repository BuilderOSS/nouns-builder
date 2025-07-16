import { atoms } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const avatarSizes = {
  '16': atoms({
    size: 'x4',
    minWidth: 'x4',
  }),
  '20': atoms({
    size: 'x5',
    minWidth: 'x5',
  }),
  '24': atoms({
    size: 'x6',
    minWidth: 'x6',
  }),
  '28': style({
    height: 28,
    width: 28,
    minWidth: 28,
  }),
  '32': style({
    height: 32,
    width: 32,
    minWidth: 32,
  }),
  '40': atoms({
    size: 'x10',
    minW: 'x10',
  }),
  '48': atoms({
    size: 'x12',
    minWidth: 'x12',
  }),
  '52': atoms({
    size: 'x13',
    minWidth: 'x13',
  }),
  '64': atoms({
    size: 'x16',
    minWidth: 'x16',
  }),
  '80': atoms({
    size: 'x20',
    minWidth: 'x20',
  }),
  '90': style({
    height: 90,
    width: 90,
    minWidth: 90,
  }),
  '120': atoms({
    size: 'x30',
    minWidth: 'x30',
  }),
  '164': style({
    height: 164,
    width: 164,
    minWidth: 164,
  }),
}
