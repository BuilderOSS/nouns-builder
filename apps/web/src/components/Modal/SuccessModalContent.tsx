import { Flex } from '@buildeross/zord'
import React, { ReactNode } from 'react'

import {
  confirmRemoveHeadingStyle,
  confirmRemoveHelper,
} from 'src/components/Fields/styles.css'
import { Icon } from 'src/components/Icon'
import { Spinner } from 'src/components/Spinner'

type SuccessModalContentProps = {
  title: string
  subtitle: string
  content?: ReactNode
  actions?: ReactNode
  success?: boolean
  pending?: boolean
}

const SuccessModalContent: React.FC<SuccessModalContentProps> = ({
  title,
  subtitle,
  content,
  actions,
  success,
  pending,
}) => {
  return (
    <Flex direction={'column'} align={'center'}>
      {success && (
        <Flex
          align={'center'}
          justify={'center'}
          height={'x8'}
          width={'x8'}
          mb={'x6'}
          borderRadius={'round'}
          backgroundColor={'positive'}
        >
          <Icon id="check" fill="onAccent" />
        </Flex>
      )}

      {pending && <Spinner mb={'x4'} mx={'x4'} />}

      <Flex className={confirmRemoveHeadingStyle} mb={'x2'}>
        {title}
      </Flex>

      <Flex textAlign={'center'} className={confirmRemoveHelper}>
        {subtitle}
      </Flex>

      {content && <Flex>{content}</Flex>}

      {actions && <Flex mt={'x4'}>{actions}</Flex>}
    </Flex>
  )
}

export { SuccessModalContent }
