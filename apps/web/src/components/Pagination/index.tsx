import { atoms, Flex, Icon } from '@buildeross/zord'
import omit from 'lodash/omit'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useCallback } from 'react'

type PaginationProps = {
  hasNextPage?: boolean
  scroll?: boolean
}

const Pagination: React.FC<PaginationProps> = ({
  hasNextPage = false,
  scroll = false,
}) => {
  const { query, pathname } = useRouter()

  const handlePageBack = useCallback(() => {
    // user is on the first page
    if (!query.page)
      return {
        pathname,
        query: {
          ...query,
        },
      }

    // user is at least on the second page
    return Number(query.page) > 2
      ? {
          pathname,
          query: {
            ...query,
            page: Number(query.page) - 1,
          },
        }
      : {
          pathname,
          query: omit(query, ['page']),
        }
  }, [query, pathname])

  const handlePageForward = useCallback(() => {
    // there are more results to be fetched
    if (!hasNextPage)
      return {
        pathname,
        query: {
          ...query,
        },
      }

    // user is on the first page
    if (!query.page)
      return {
        pathname,
        query: {
          ...query,
          page: 2,
        },
      }

    // user is at least on the second page
    return {
      pathname,
      query: {
        ...query,
        page: Number(query.page) + 1,
      },
    }
  }, [hasNextPage, pathname, query])

  const isFirst = !query.page
  const isLast = !hasNextPage

  return (
    <Flex direction={'row'} w={'100%'} justify={'center'} my={'x16'}>
      <Link
        href={handlePageBack()}
        passHref
        scroll={scroll}
        className={atoms({ pointerEvents: isFirst ? 'none' : 'auto' })}
      >
        <Flex
          as="button"
          backgroundColor={'background1'}
          borderRadius={'round'}
          borderColor={'border'}
          borderStyle={'solid'}
          borderWidth={'normal'}
          p={'x1'}
          mx={'x1'}
          disabled={isFirst}
          style={{
            cursor: isFirst ? 'default' : 'pointer',
          }}
        >
          <Flex
            style={{ height: 24, width: 24 }}
            placeItems={'center'}
            justify={'center'}
          >
            <Icon id="arrowLeft" style={{ opacity: isFirst ? 0.3 : 1 }} />
          </Flex>
        </Flex>
      </Link>

      <Link
        href={handlePageForward()}
        passHref
        scroll={scroll}
        className={atoms({ pointerEvents: isLast ? 'none' : 'auto' })}
      >
        <Flex
          as="button"
          backgroundColor={'background1'}
          borderRadius={'round'}
          borderColor={'border'}
          borderStyle={'solid'}
          borderWidth={'normal'}
          p={'x1'}
          mx={'x1'}
          disabled={isLast}
          style={{
            cursor: isLast ? 'default' : 'pointer',
          }}
        >
          <Flex
            style={{ height: 24, width: 24 }}
            placeItems={'center'}
            justify={'center'}
          >
            <Icon id="arrowRight" style={{ opacity: isLast ? 0.3 : 1 }} />
          </Flex>
        </Flex>
      </Link>
    </Flex>
  )
}

export default Pagination
