import { Flex, Text } from '@buildeross/zord'
import { useMemo } from 'react'
import { statistic, statisticContent, statisticHover } from 'src/styles/About.css'

interface StatisticProps {
  title: string
  content?: string | number | React.ReactNode
  onClick?: () => void
}

export const Statistic: React.FC<StatisticProps> = ({ title, content, onClick }) => {
  const props = useMemo(() => {
    if (onClick) {
      return {
        as: 'button',
        onClick,
        className: statisticHover,
      }
    } else {
      return { className: statistic }
    }
  }, [onClick])

  return (
    <Flex direction={'column'} {...props}>
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
    </Flex>
  )
}
