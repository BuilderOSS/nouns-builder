import { Auction_OrderBy } from '@buildeross/sdk/subgraph'
import { Flex, Select } from '@buildeross/zord'
import { useRouter } from 'next/router'
import React from 'react'

const SORT_KEY = {
  [Auction_OrderBy.StartTime]: 'Created',
  [Auction_OrderBy.HighestBidAmount]: 'Price',
  [Auction_OrderBy.EndTime]: 'Ending',
}

interface ExploreSortMenuProps {
  choice: string
}

export const ExploreSortMenu: React.FC<ExploreSortMenuProps> = () => {
  const { push, pathname, query } = useRouter()

  const selectionToOrderBy = React.useCallback((option: string) => {
    switch (option) {
      case 'Created':
        return Auction_OrderBy.StartTime
      case 'Price':
        return Auction_OrderBy.HighestBidAmount
      case 'Ending':
        return Auction_OrderBy.EndTime
      default:
        throw new Error('Invalid sort key')
    }
  }, [])

  const handleSortChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      push({
        pathname,
        query: {
          ...query,
          orderBy: selectionToOrderBy(e.target.value),
        },
      })
    },
    [push, pathname, query, selectionToOrderBy]
  )

  const defaultSort = React.useMemo(() => {
    const { sortKey } = query
    if (
      sortKey &&
      typeof sortKey === 'string' &&
      Object.keys(SORT_KEY).includes(sortKey)
    ) {
      return SORT_KEY[sortKey as keyof typeof SORT_KEY]
    }
    return 'Created'
  }, [query])

  return (
    <Flex w={'auto'}>
      <Select
        name="Explore Sort"
        defaultValue={defaultSort}
        onChange={(e) => handleSortChange(e)}
      >
        {Object.values(SORT_KEY).map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </Select>
    </Flex>
  )
}
