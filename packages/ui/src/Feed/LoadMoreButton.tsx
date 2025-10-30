import { Button, Flex } from '@buildeross/zord'
import React from 'react'

interface LoadMoreButtonProps {
  onClick: () => void
  isLoading?: boolean
}

export const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({
  onClick,
  isLoading = false,
}) => {
  return (
    <Flex w="100%" justify="center" my="x4">
      <Button
        onClick={onClick}
        disabled={isLoading}
        loading={isLoading}
        variant="secondary"
        size="md"
      >
        {isLoading ? 'Loading...' : 'Load More'}
      </Button>
    </Flex>
  )
}
