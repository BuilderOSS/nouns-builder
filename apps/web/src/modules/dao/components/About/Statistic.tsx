import { Box, Flex, Text } from '@zoralabs/zord'

import { statistic, statisticContent, statisticHover } from 'src/styles/About.css'

interface StatisticProps {
  title: string
  content?: string | number | React.ReactNode
  onClick?: () => void
}

export const Statistic: React.FC<StatisticProps> = ({ title, content, onClick }) => {
  return (
    <Box className={onClick ? statisticHover : statistic} onClick={onClick}>
      <Flex direction={'row'} w={'100%'} justify={'space-between'}>
        <Text color="tertiary">{title}</Text>
      </Flex>
      {!content || typeof content === 'string' || typeof content === 'number' ? (
        <Text
          mt={{ '@initial': 'x1', '@768': 'x3' }}
          fontWeight={'display'}
          className={statisticContent}
        >
          {!!content ? content : undefined}
        </Text>
      ) : (
        content
      )}
    </Box>
  )
}
