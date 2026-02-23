import { Address } from 'viem'

/**
 * Universal Router command constants
 * @see https://github.com/Uniswap/universal-router/blob/main/contracts/libraries/Commands.sol
 */
export const Commands = {
  V4_SWAP: 0x10,
  WRAP_ETH: 0x0b,
  UNWRAP_WETH: 0x0c,
  SWEEP: 0x04,
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
  WRAP: 0x15,
  UNWRAP: 0x16,
} as const

/// @notice used to signal that an action should use the input value of the open delta on the pool manager
/// or of the balance that the contract holds
export const OPEN_DELTA: bigint = 0n

/// @notice used to signal that an action should use the contract's entire balance of a currency
/// This value is equivalent to 1<<255, i.e. a singular 1 in the most significant bit.
export const CONTRACT_BALANCE: bigint =
  0x8000000000000000000000000000000000000000000000000000000000000000n

/// @notice used to signal that the recipient of an action should be the address(this)
export const ADDRESS_THIS: Address = '0x0000000000000000000000000000000000000002'

/// @notice used to signal that the recipient of an action should be the msgSender
export const MSG_SENDER: Address = '0x0000000000000000000000000000000000000001'
