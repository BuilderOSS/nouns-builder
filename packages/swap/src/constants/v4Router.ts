/**
 * Universal Router command constants
 * @see https://github.com/Uniswap/universal-router/blob/main/contracts/libraries/Commands.sol
 */
export const Commands = {
  V4_SWAP: 0x10,
  // Add other commands as needed
} as const

/**
 * V4Router action constants
 * @see https://github.com/Uniswap/v4-periphery/blob/main/src/libraries/Actions.sol
 */
export const Actions = {
  SETTLE: 0x0b,
  SETTLE_ALL: 0x0c,
  SETTLE_PAIR: 0x0d,
  TAKE: 0x0e,
  TAKE_ALL: 0x0f,
  TAKE_PORTION: 0x10,
  TAKE_PAIR: 0x11,
  SWAP_EXACT_IN_SINGLE: 0x06,
  SWAP_EXACT_IN: 0x07,
  SWAP_EXACT_OUT_SINGLE: 0x08,
  SWAP_EXACT_OUT: 0x09,
} as const
