import { store } from '@graphprotocol/graph-ts'

import { DAOLink } from '../../generated/schema'
import { parseDaoMetadata } from './parseDaoMetadata'

function getLinkId(daoId: string, key: string): string {
  return daoId.toLowerCase() + '-' + key.toLowerCase()
}

export function syncDaoLinks(
  daoId: string,
  previousMetadata: string,
  nextMetadata: string
): void {
  let previous = parseDaoMetadata(previousMetadata)
  for (let i = 0; i < previous.links.entries.length; i++) {
    let previousKey = previous.links.entries[i].key
    store.remove('DAOLink', getLinkId(daoId, previousKey))
  }

  let next = parseDaoMetadata(nextMetadata)
  for (let i = 0; i < next.links.entries.length; i++) {
    let entry = next.links.entries[i]
    let link = new DAOLink(getLinkId(daoId, entry.key))
    link.dao = daoId
    link.key = entry.key
    link.url = entry.value
    link.save()
  }
}
