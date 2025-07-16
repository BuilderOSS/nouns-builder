import { Flex, Select } from '@buildeross/zord'
import { useRouter } from 'next/router'
import React from 'react'

import { SORT_KEY } from 'src/constants/sortKey'
import { Auction_OrderBy } from 'src/data/subgraph/sdk.generated'

interface ExploreSortMenuProps {
  choice: string
}

const ExploreSortMenu: React.FC<ExploreSortMenuProps> = () => {
  const router = useRouter()

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
      router.push({
        pathname: router.pathname,
        query: {
          ...router.query,
          orderBy: selectionToOrderBy(e.target.value),
        },
      })
    },
    [router, selectionToOrderBy]
  )

  return (
    <Flex w={'auto'}>
      <Select
        name="Explore Sort"
        defaultValue={
          // (SORT_KEY[router?.query.sortKey] as string) is throwing a ts error
          // @ts-ignore-next-line
          router.query.sortKey ? (SORT_KEY[router?.query.sortKey] as string) : 'Created'
        }
        fontSize={16}
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

export default ExploreSortMenu
