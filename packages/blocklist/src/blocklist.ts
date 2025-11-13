import { useMemo } from 'react'
import { Address, getAddress } from 'viem'

import badActors from '../bad-actors.json'
import sdnlistDev from '../sdnlist.dev.json'
import sdnlist from '../sdnlist.json'

const environment = process.env.NODE_ENV || 'development'

type InputAddress = string | undefined

function parseAddress(address: InputAddress): Address | undefined {
  if (!address) return

  try {
    return getAddress(address)
  } catch (e) {
    return
  }
}

function cleanBlocklist(blocklist: InputAddress[]): Address[] {
  return blocklist
    .map((a) => parseAddress(a))
    .filter((a) => typeof a === 'string') as Address[]
}

const blocklistMap: Record<string, Address[]> = {
  production: cleanBlocklist(sdnlist.concat(badActors)),
  development: cleanBlocklist(sdnlistDev.concat(badActors)),
}

const blocklist =
  environment in blocklistMap ? blocklistMap[environment] : blocklistMap.development

export function isBlocked(address: InputAddress) {
  const parsed = parseAddress(address)
  return parsed && blocklist.includes(parsed)
}

export function useBlocklist(address: InputAddress) {
  return useMemo(() => isBlocked(address), [address])
}
