import { Box, Button, Flex } from '@zoralabs/zord'
import { useRouter } from 'next/router'
import React from 'react'
import CopyButton from 'src/components/CopyButton/CopyButton'
import { useMetadataContract } from 'src/modules/dao/hooks'
import { useDaoStore } from 'src/stores/useDaoStore'
import { useFormStore } from 'src/stores/useFormStore'
import {
  deployContractButtonStyle,
  infoSectionLabelStyle,
  infoSectionValueVariants,
  successHeadingStyle,
} from 'src/styles/deploy.css'
import { walletSnippet } from 'src/utils/helpers'
import { transformFileProperties } from 'src/utils/transformFileProperties'
import type { DaoContractAddresses } from 'src/typings'
import * as Sentry from "@sentry/nextjs";

interface DeployedDaoProps extends DaoContractAddresses {
  title: string
}

const SuccessfulDeploy: React.FC<DeployedDaoProps> = ({
  token,
  metadata,
  auction,
  treasury,
  governor,
  title,
}) => {
  const router = useRouter()
  const { generalInfo, setUpArtwork, ipfsUpload, orderedLayers, setFulfilledSections } =
    useFormStore()
  const { addresses, setAddresses } = useDaoStore()
  const { contract: metadataContract } = useMetadataContract(addresses?.metadata)
  const [isPendingTransaction, setIsPendingTransaction] = React.useState<boolean>(false)

  React.useEffect(() => {
    setAddresses({ token, metadata, auction, treasury, governor })
  }, [setAddresses, token, metadata, auction, treasury, governor])

  /*

   Initialize Contracts
   - token contract
   - metadataRenderer contract

 */

  /*

    add properties with metadataRenderer

  */

  const transactions = React.useMemo(() => {
    if (!orderedLayers || !ipfsUpload) return

    return transformFileProperties(orderedLayers, ipfsUpload, 500)
  }, [orderedLayers, ipfsUpload])

  const handleDeployMetadata = React.useCallback(async () => {
    if (!transactions || !metadataContract) return

    setIsPendingTransaction(true)
    for await (const transaction of transactions) {
      try {
        const { wait } = await metadataContract.addProperties(
          transaction.names,
          transaction.items,
          transaction.data
        )
        await wait()
      } catch (err) {
        console.log('err', err)
        setIsPendingTransaction(false)
        Sentry.captureException(err)
        await Sentry.flush(2000)
        return
      }
    }
    setIsPendingTransaction(false)
    setFulfilledSections(title)
    useFormStore.persist.clearStorage()
    await router.push(`/dao/${token}`)
  }, [metadataContract, transactions, router, setFulfilledSections, title, token])

  /*

    handle smaller screen size

   */
  /* add mobile flag to layout store  */
  const [isSmallDesktop, setIsSmallDesktop] = React.useState<boolean>(false)
  React.useEffect(() => {
    if (!!window) {
      window.addEventListener('resize', handleResize)
      setIsSmallDesktop(window.innerWidth <= 1200 && window.innerWidth >= 768)
    }
  }, [])
  const handleResize = () => {
    setIsSmallDesktop(window.innerWidth <= 1200 && window.innerWidth >= 768)
  }

  return (
    <Flex direction={'column'}>
      <Box mb={'x1'} className={successHeadingStyle}>
        Successfully Deployed Contracts
      </Box>
      <Flex direction={'row'} align={'center'} mb={'x5'} height={'x6'}>
        <Box fontSize={14} color={'tertiary'} mr={'x1'} cursor={'pointer'}>
          Copy all addresses
        </Box>
        <Box cursor={'pointer'}>
          <CopyButton title={generalInfo?.daoName} all={true} />
        </Box>
      </Flex>
      <Flex
        mb={'x4'}
        direction={'column'}
        style={{ boxSizing: 'border-box', width: '100%' }}
      >
        <Flex mb={'x5'} direction={'column'}>
          <Box className={infoSectionLabelStyle}>Token:</Box>{' '}
          <Flex
            align={'center'}
            fontSize={18}
            className={infoSectionValueVariants['default']}
          >
            {isSmallDesktop ? walletSnippet(token) : token}
            <CopyButton text={token as string} />
          </Flex>
        </Flex>
        <Flex mb={'x5'} direction={'column'}>
          <Box className={infoSectionLabelStyle}>Auction:</Box>{' '}
          <Flex
            align={'center'}
            fontSize={18}
            className={infoSectionValueVariants['default']}
            mr={'x10'}
          >
            {isSmallDesktop ? walletSnippet(auction) : auction}
            <CopyButton text={auction as string} />
          </Flex>
        </Flex>
        <Flex mb={'x5'} direction={'column'}>
          <Box className={infoSectionLabelStyle}>treasury:</Box>{' '}
          <Flex
            align={'center'}
            fontSize={18}
            className={infoSectionValueVariants['default']}
          >
            {isSmallDesktop ? walletSnippet(treasury) : treasury}
            <CopyButton text={treasury as string} />
          </Flex>
        </Flex>
        <Flex mb={'x5'} direction={'column'}>
          <Box className={infoSectionLabelStyle}>Governor:</Box>{' '}
          <Flex
            align={'center'}
            fontSize={18}
            className={infoSectionValueVariants['default']}
          >
            {isSmallDesktop ? walletSnippet(governor) : governor}
            <CopyButton text={governor as string} />
          </Flex>
        </Flex>
        <Flex mb={'x5'} direction={'column'}>
          <Box className={infoSectionLabelStyle}>Metadata Renderer:</Box>{' '}
          <Flex
            align={'center'}
            fontSize={18}
            className={infoSectionValueVariants['default']}
          >
            {isSmallDesktop ? walletSnippet(metadata) : metadata}
            <CopyButton text={metadata as string} />
          </Flex>
        </Flex>
      </Flex>
      <Button
        className={
          deployContractButtonStyle[isPendingTransaction ? 'pendingFull' : 'defaultFull']
        }
        disabled={!transactions}
        onClick={() => handleDeployMetadata()}
        w={'100%'}
        mt={'x8'}
      >
        Deploy Token Metadata (2 of 2)
      </Button>
      {transactions && transactions?.length > 1 && (
        <Flex color={'secondary'} fontSize={14} w={'100%'} justify={'center'} py={'x4'}>
          This Deploy Step will be split into {transactions?.length} Transactions
        </Flex>
      )}
    </Flex>
  )
}

export default SuccessfulDeploy
