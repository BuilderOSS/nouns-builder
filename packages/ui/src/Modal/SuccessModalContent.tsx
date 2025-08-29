import { Flex, Icon, Spinner } from '@buildeross/zord'
import React, { ReactNode } from 'react'

import { confirmRemoveHeadingStyle, confirmRemoveHelper } from '../Fields/styles.css'

type SuccessModalContentProps = {
  title: string
  subtitle: string
  content?: ReactNode
  actions?: ReactNode
  success?: boolean
  pending?: boolean
  // Custom icon renderer to avoid hard dependency on Icon component
  renderSuccessIcon?: () => ReactNode
  // Custom spinner renderer to avoid dependency on specific Spinner implementation
  renderSpinner?: () => ReactNode
}

const SuccessModalContent: React.FC<SuccessModalContentProps> = ({
  title,
  subtitle,
  content,
  actions,
  success,
  pending,
  renderSuccessIcon,
  renderSpinner,
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
          {renderSuccessIcon ? renderSuccessIcon() : <Icon id="check" fill="onAccent" />}
        </Flex>
      )}

      {pending && (
        <Flex mb={'x4'} mx={'x4'}>
          {renderSpinner ? renderSpinner() : <Spinner mb={'x4'} mx={'x4'} />}
        </Flex>
      )}

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
