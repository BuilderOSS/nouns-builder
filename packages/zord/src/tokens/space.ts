// function makeSpaces(base: number, num: number) {
//   const n = num + 1
//   return Object.fromEntries(
//     Array.from(new Array(n)).map((_, i) => [`x${i}`, `${i * base}px`])
//   )
// }

export const space = {
  x0: '0px',
  x1: '4px',
  x2: '8px',
  x3: '12px',
  x4: '16px',
  x5: '20px',
  x6: '24px',
  x7: '28px',
  x8: '32px',
  x9: '36px',
  x10: '40px',
  x11: '44px',
  x12: '48px',
  x13: '52px',
  x14: '56px',
  x15: '60px',
  x16: '64px',
  x17: '68px',
  x18: '72px',
  x19: '76px',
  x20: '80px',
  x21: '84px',
  x22: '88px',
  x23: '92px',
  x24: '96px',
  x25: '100px',
  x26: '104px',
  x27: '108px',
  x28: '112px',
  x29: '116px',
  x30: '120px',
  x32: '128px',
  x64: '256px',
  auto: 'auto',
}

export const size = {
  ...space,
  '100vw': '100vw',
  '100vh': '100vh',
  '100%': '100%',
  unset: 'unset',
} as const
