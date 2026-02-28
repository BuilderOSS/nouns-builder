import { Address } from '@graphprotocol/graph-ts'

import { DAO } from '../../generated/schema'
import { Governor as GovernorContract } from '../../generated/templates/Governor/Governor'
import { Treasury as TreasuryContract } from '../../generated/templates/Governor/Treasury'

/**
 * Loads a DAO entity by validating the treasury->governor->token chain.
 *
 * This function:
 * 1. Binds to the Treasury contract and gets its owner (the Governor)
 * 2. Binds to the Governor contract and verifies it points back to the same Treasury
 * 3. Gets the token address from the Governor
 * 4. Attempts to load the DAO entity using the token address
 *
 * @param treasuryAddress - The treasury contract address to validate
 * @returns DAO entity if validation succeeds and DAO exists, null otherwise
 */
export function loadDAOFromTreasury(treasuryAddress: Address): DAO | null {
  // Bind to Treasury contract to get owner (governor)
  let treasuryContract = TreasuryContract.bind(treasuryAddress)
  let ownerResult = treasuryContract.try_owner()

  // If we can't get the owner, this isn't a valid DAO treasury
  if (ownerResult.reverted) {
    return null
  }

  let governorAddress = ownerResult.value

  // Bind to Governor contract to verify token and treasury
  let governorContract = GovernorContract.bind(governorAddress)
  let tokenResult = governorContract.try_token()
  let treasuryResult = governorContract.try_treasury()

  // If we can't read from governor, return null
  if (tokenResult.reverted || treasuryResult.reverted) {
    return null
  }

  // Verify that the treasury from governor matches the input treasury address
  if (treasuryResult.value.toHexString() != treasuryAddress.toHexString()) {
    return null
  }

  // Try to load the DAO by the token address from governor
  let daoId = tokenResult.value.toHexString()
  let dao = DAO.load(daoId)

  return dao
}
