import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import { ContractButton } from '@buildeross/ui'
import { Box, Button, Flex, Heading, Stack, Text } from '@buildeross/zord'
import { useEffect } from 'react'
import { decodeEventLog } from 'viem'
import { usePublicClient } from 'wagmi'

import { useCrossChainMigration } from '../../../hooks/useCrossChainMigration'
import { useDeployDAO } from '../../../hooks/useDeployDAO'

export const Step3_DeployDAO: React.FC = () => {
  const {
    editedConfig,
    targetChainId,
    targetAddresses,
    setTargetAddresses,
    deployTxHash,
    setDeployTxHash,
    goToNextStep,
  } = useCrossChainMigration()

  const { deploy, txHash, isDeploying, isConfirming, isSuccess, isSafeProposal } =
    useDeployDAO(editedConfig as any, targetChainId)

  const publicClient = usePublicClient({ chainId: targetChainId })

  // Check if deployment is complete based on persisted state
  // This ensures the component shows the correct state even after page refresh
  const isDeploymentComplete = !!targetAddresses?.token

  const handleDeploy = async () => {
    try {
      // Dual state pattern: Hook manages current tx (txHash), store persists for refresh (deployTxHash)
      // Priority: Hook state (if active) > Store state (after refresh)
      const hash = await deploy()
      setDeployTxHash(hash)
    } catch (err) {
      console.error('Deployment error:', err)
    }
  }

  // When deployment is successful, parse transaction receipt to extract addresses
  useEffect(() => {
    const extractAddresses = async () => {
      if (!isSuccess || isSafeProposal || !txHash || !publicClient) return

      try {
        // Get transaction receipt
        const receipt = await publicClient.getTransactionReceipt({ hash: txHash })

        // Find DAODeployed event log
        const daoDeployedLog = receipt.logs.find((log) => {
          try {
            const decoded = decodeEventLog({
              abi: [
                {
                  type: 'event',
                  name: 'DAODeployed',
                  inputs: [
                    { name: 'token', type: 'address', indexed: false },
                    { name: 'metadata', type: 'address', indexed: false },
                    { name: 'auction', type: 'address', indexed: false },
                    { name: 'treasury', type: 'address', indexed: false },
                    { name: 'governor', type: 'address', indexed: false },
                  ],
                },
              ],
              data: log.data,
              topics: log.topics,
            })
            return decoded.eventName === 'DAODeployed'
          } catch {
            return false
          }
        })

        if (daoDeployedLog) {
          const decoded = decodeEventLog({
            abi: [
              {
                type: 'event',
                name: 'DAODeployed',
                inputs: [
                  { name: 'token', type: 'address', indexed: false },
                  { name: 'metadata', type: 'address', indexed: false },
                  { name: 'auction', type: 'address', indexed: false },
                  { name: 'treasury', type: 'address', indexed: false },
                  { name: 'governor', type: 'address', indexed: false },
                ],
              },
            ],
            data: daoDeployedLog.data,
            topics: daoDeployedLog.topics,
          })

          const { token, metadata, auction, treasury, governor } = decoded.args as {
            token: `0x${string}`
            metadata: `0x${string}`
            auction: `0x${string}`
            treasury: `0x${string}`
            governor: `0x${string}`
          }

          // Store addresses in migration state
          setTargetAddresses({
            token,
            metadata,
            auction,
            treasury,
            governor,
          })
        }
      } catch (error) {
        console.error('Error extracting deployment addresses:', error)
      }
    }

    extractAddresses()
  }, [isSuccess, isSafeProposal, txHash, publicClient, setTargetAddresses])

  const handleContinue = () => {
    // Addresses are already set via useEffect, just proceed to next step
    goToNextStep()
  }

  return (
    <Stack gap="x6">
      <Box>
        <Heading size="md" mb="x2">
          Step 3: Deploy DAO
        </Heading>
        <Text color="text3">
          This will deploy a new DAO on the target chain with the configured parameters.
        </Text>
      </Box>

      {editedConfig && (
        <Box p="x4" borderRadius="curved" backgroundColor="background2">
          <Heading size="xs" mb="x3">
            Deployment Summary
          </Heading>
          <Stack gap="x2" fontSize={14}>
            <Flex justify="space-between">
              <Text color="text3">DAO Name:</Text>
              <Text>{editedConfig.name}</Text>
            </Flex>
            <Flex justify="space-between">
              <Text color="text3">Symbol:</Text>
              <Text>{editedConfig.symbol}</Text>
            </Flex>
            <Flex justify="space-between">
              <Text color="text3">Reserved Tokens:</Text>
              <Text>
                0 -{' '}
                {(editedConfig.reservedUntilTokenId
                  ? editedConfig.reservedUntilTokenId - 1n
                  : 0n
                ).toString()}
              </Text>
            </Flex>
            <Flex justify="space-between">
              <Text color="text3">Founders:</Text>
              <Text>{editedConfig.founders?.length || 0}</Text>
            </Flex>
          </Stack>
        </Box>
      )}

      {!isDeploymentComplete && (
        <Flex justify="flex-end">
          <ContractButton
            chainId={targetChainId!}
            handleClick={handleDeploy}
            disabled={isDeploying || isConfirming}
            loading={isDeploying || isConfirming}
          >
            {isDeploying ? 'Deploying...' : isConfirming ? 'Confirming...' : 'Deploy DAO'}
          </ContractButton>
        </Flex>
      )}

      {(txHash || deployTxHash) && targetChainId && !isSafeProposal && (
        <Box p="x4" borderRadius="curved" backgroundColor="background2">
          <Text fontSize={14} color="text3" mb="x2">
            Transaction Hash:
          </Text>
          <Text
            as="a"
            href={`${ETHERSCAN_BASE_URL[targetChainId]}/tx/${txHash || deployTxHash}`}
            target="_blank"
            rel="noopener noreferrer"
            fontFamily="mono"
            fontSize={12}
            color="accent"
            style={{
              wordBreak: 'break-all',
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
          >
            {txHash || deployTxHash}
          </Text>
        </Box>
      )}

      {isSafeProposal && (
        <Box p="x4" borderRadius="curved" backgroundColor="background2">
          <Text fontSize={14} color="text3" mb="x2">
            Safe Proposal Hash:
          </Text>
          <Text fontFamily="mono" fontSize={12} style={{ wordBreak: 'break-all' }}>
            {txHash || deployTxHash}
          </Text>
          <Text color="text3">
            Deployment proposed to Safe. Additional signatures are required before it can
            be executed.
          </Text>
        </Box>
      )}

      {isDeploymentComplete && targetAddresses && (
        <>
          <Box p="x4" borderRadius="curved" backgroundColor="positive">
            <Heading size="xs" mb="x2" color="onPositive">
              ✓ Deployment Successful!
            </Heading>
            <Text fontSize={14} color="onPositive">
              All DAO contracts have been deployed.
            </Text>
          </Box>

          <Box p="x4" borderRadius="curved" backgroundColor="background2">
            <Heading size="xs" mb="x3">
              Deployed Contracts
            </Heading>
            <Stack gap="x2" fontSize={12} fontFamily="mono">
              <Flex direction="column">
                <Text color="text3">Token:</Text>
                <Text>{targetAddresses.token}</Text>
              </Flex>
              <Flex direction="column">
                <Text color="text3">Metadata:</Text>
                <Text>{targetAddresses.metadata}</Text>
              </Flex>
              <Flex direction="column">
                <Text color="text3">Auction:</Text>
                <Text>{targetAddresses.auction}</Text>
              </Flex>
              <Flex direction="column">
                <Text color="text3">Treasury:</Text>
                <Text>{targetAddresses.treasury}</Text>
              </Flex>
              <Flex direction="column">
                <Text color="text3">Governor:</Text>
                <Text>{targetAddresses.governor}</Text>
              </Flex>
            </Stack>
          </Box>

          <Flex justify="flex-end">
            <Button onClick={handleContinue}>Continue to Metadata Setup</Button>
          </Flex>
        </>
      )}
    </Stack>
  )
}
