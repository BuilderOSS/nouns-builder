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
  return blocklist.map(parseAddress).filter((a): a is Address => Boolean(a))
}

const blocklistMap: Record<string, Address[]> = {
  production: cleanBlocklist(sdnlist.concat(badActors)),
  development: cleanBlocklist(sdnlistDev.concat(badActors)),
}

const blocklistArray =
  environment in blocklistMap ? blocklistMap[environment] : blocklistMap.development

const blocklist = new Set(blocklistArray)

export function isBlocked(address: InputAddress): boolean {
  const parsed = parseAddress(address)
  return parsed ? blocklist.has(parsed) : false
}

export function useBlocklist(address: InputAddress): boolean {
  return useMemo(() => isBlocked(address), [address])
}
