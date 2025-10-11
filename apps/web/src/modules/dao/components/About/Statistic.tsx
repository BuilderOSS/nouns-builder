import { Flex, Text } from '@buildeross/zord'
import { LinkWrapper as Link } from 'src/components/LinkWrapper'
import { statistic, statisticContent, statisticHover } from 'src/styles/About.css'

interface StatisticProps {
  title: string
  content?: string | number | React.ReactNode
  onClick?: () => void
}

export const Statistic: React.FC<StatisticProps> = ({ title, content, onClick }) => {
  return (
    <Link
      className={onClick ? statisticHover : statistic}
      link={onClick ? { onClick } : {}}
    >
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
    </Link>
  )
}
