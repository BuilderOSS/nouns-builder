import { Address, Bytes, BigInt } from '@graphprotocol/graph-ts'

/**
 * WETH address for Base and Base Sepolia
 * Both networks use the same WETH address (L2 standard)
 */
export const WETH_ADDRESS: Bytes = Address.fromString(
  '0x4200000000000000000000000000000000000006'
)

/**
 * ClankerToken uses dynamic fees (Uniswap V4 dynamic fee flag)
 */
export const DYNAMIC_FEE_FLAG: BigInt = BigInt.fromI32(0x800000)

/**
 * ClankerToken tick spacing constant
 */
export const CLANKER_TICK_SPACING: i32 = 200
