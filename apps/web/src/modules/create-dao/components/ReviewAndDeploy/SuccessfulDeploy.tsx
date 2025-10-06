import { metadataAbi, tokenAbi } from '@buildeross/sdk/contract'
import { CopyButton } from '@buildeross/ui/CopyButton'
import { walletSnippet } from '@buildeross/utils/helpers'
import { Box, Flex, Paragraph, Text } from '@buildeross/zord'
import { useRouter } from 'next/router'
import React, { useCallback, useState } from 'react'
import { ContractButton } from 'src/components/ContractButton'
import { DaoContractAddresses, useChainStore, useDaoStore } from 'src/stores'
import {
  deployPendingButtonStyle,
  infoSectionLabelStyle,
  infoSectionValueVariants,
  successHeadingStyle,
} from 'src/styles/deploy.css'
import { useAccount, useConfig, useReadContract } from 'wagmi'
import { simulateContract, waitForTransactionReceipt, writeContract } from 'wagmi/actions'

import { useFormStore } from '../../stores'
import { Properties, transformFileProperties } from '../../utils'

interface DeployedDaoProps extends DaoContractAddresses {
  title: string
}

const DEPLOYMENT_ERROR = {
  MISMATCHING_SIGNER:
    'Oops! It looks like the owner of the token contract differs from your signer address. Please ensure that this transaction is handled by the same address.',
  GENERIC:
    'Oops! It looks like there was a problem. Please ensure that your input data is correct',
}

const DisplayAddress: React.FC<{ address: string }> = ({ address }) => {
  return (
    <Flex align={'center'} fontSize={18} className={infoSectionValueVariants['default']}>
      <Text display={{ '@initial': 'none', '@768': 'block' }}>{address}</Text>
      <Text display={{ '@initial': 'block', '@768': 'none' }}>
        {walletSnippet(address)}
      </Text>
      <CopyButton text={address} />
    </Flex>
  )
}

export const SuccessfulDeploy: React.FC<DeployedDaoProps> = ({
  token,
  metadata,
  auction,
  treasury,
  governor,
  title,
}) => {
  const { push } = useRouter()
  const config = useConfig()
  const { general, ipfsUpload, orderedLayers, setFulfilledSections, resetForm } =
    useFormStore()
  const chain = useChainStore((x) => x.chain)
  const { addresses, setAddresses } = useDaoStore()
  const [isPendingTransaction, setIsPendingTransaction] = useState<boolean>(false)
  const [deploymentError, setDeploymentError] = useState<string | undefined>()
  const { address } = useAccount()

  const { data: tokenOwner } = useReadContract({
    query: {
      enabled: !!token,
    },
    abi: tokenAbi,
    address: token,
    chainId: chain.id,
    functionName: 'owner',
  })

  React.useEffect(() => {
    setAddresses({ token, metadata, auction, treasury, governor })
  }, [setAddresses, token, metadata, auction, treasury, governor])

  /*
   Initialize Contracts
   - token contract
   - metadataRenderer contract
 */

  /* add properties with metadataRenderer */
  const transactions: Properties[] = React.useMemo(() => {
    if (!orderedLayers || !ipfsUpload) return []

    return transformFileProperties(orderedLayers, ipfsUpload, 500)
  }, [orderedLayers, ipfsUpload])

  const handleDeployMetadata = useCallback(async () => {
    setDeploymentError(undefined)

    if (!transactions || !addresses.metadata) {
      setDeploymentError(DEPLOYMENT_ERROR.GENERIC)
      return
    }

    if (tokenOwner !== address) {
      setDeploymentError(DEPLOYMENT_ERROR.MISMATCHING_SIGNER)
      return
    }

    setIsPendingTransaction(true)
    for await (const transaction of transactions) {
      try {
        const data = await simulateContract(config, {
          abi: metadataAbi,
          address: addresses.metadata,
          functionName: 'addProperties',
          chainId: chain.id,
          args: [transaction.names, transaction.items, transaction.data],
        })
        const txHash = await writeContract(config, data.request)
        await waitForTransactionReceipt(config, { hash: txHash, chainId: chain.id })
      } catch (err) {
        console.warn(err)
        setIsPendingTransaction(false)
        return
      }
    }

    setIsPendingTransaction(false)
    setFulfilledSections(title)

    push(`/dao/${chain.slug}/${token}`).then(() => {
      resetForm()
    })
  }, [
    transactions,
    addresses.metadata,
    tokenOwner,
    address,
    config,
    chain.id,
    chain.slug,
    token,
    setFulfilledSections,
    title,
    push,
    resetForm,
  ])

  const copyAllText = React.useMemo(() => {
    return `${general?.daoName ? `${general.daoName}:\n` : `all addresses:\n`}
    token: ${token}
    auction: ${auction}
    treasury: ${treasury}
    governor: ${governor}
    metadata: ${metadata}
    `
  }, [general?.daoName, token, auction, treasury, governor, metadata])

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
          <CopyButton text={copyAllText} />
        </Box>
      </Flex>
      <Flex direction={'column'} style={{ boxSizing: 'border-box', width: '100%' }}>
        <Flex mb={'x5'} direction={'column'}>
          <Box className={infoSectionLabelStyle}>Token:</Box>{' '}
          {!!token && <DisplayAddress address={token} />}
        </Flex>
        <Flex mb={'x5'} direction={'column'}>
          <Box className={infoSectionLabelStyle}>Auction:</Box>{' '}
          {!!auction && <DisplayAddress address={auction} />}
        </Flex>
        <Flex mb={'x5'} direction={'column'}>
          <Box className={infoSectionLabelStyle}>treasury:</Box>{' '}
          {!!treasury && <DisplayAddress address={treasury} />}
        </Flex>
        <Flex mb={'x5'} direction={'column'}>
          <Box className={infoSectionLabelStyle}>Governor:</Box>{' '}
          {!!governor && <DisplayAddress address={governor} />}
        </Flex>
        <Flex mb={'x5'} direction={'column'}>
          <Box className={infoSectionLabelStyle}>Metadata Renderer:</Box>{' '}
          {!!metadata && <DisplayAddress address={metadata} />}
        </Flex>
      </Flex>

      {deploymentError && (
        <Text variant={'paragraph-md'} color="negative">
          {deploymentError}
        </Text>
      )}

      <ContractButton
        size={'lg'}
        borderRadius={'curved'}
        className={isPendingTransaction ? deployPendingButtonStyle : undefined}
        disabled={!transactions || isPendingTransaction}
        handleClick={handleDeployMetadata}
        w={'100%'}
        mt={'x8'}
      >
        {`${isPendingTransaction ? 'Deploying' : 'Deploy'} Token Metadata (2 of 2)`}
      </ContractButton>
      {transactions && transactions?.length > 1 && (
        <Flex color={'secondary'} w={'100%'} justify={'center'} py={'x4'}>
          <Paragraph>
            <strong>ATTENTION:</strong> The deploy step will be split into{' '}
            <strong>{transactions.length} wallet transactions.</strong> You need to sign{' '}
            <strong>all of them. </strong>
            Rejecting any of them will cause the metadata upload to fail.
          </Paragraph>
        </Flex>
      )}
    </Flex>
  )
}
