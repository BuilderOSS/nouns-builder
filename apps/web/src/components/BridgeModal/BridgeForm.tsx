import { L2ChainType, PUBLIC_L1_BRIDGE_ADDRESS } from '@buildeross/constants/addresses'
import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { useIsContract } from '@buildeross/hooks/useIsContract'
import { formatCryptoVal } from '@buildeross/utils/numbers'
import { Box, Button, Flex, Heading, Text } from '@buildeross/zord'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { Formik } from 'formik'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import Input from 'src/components/Input/Input'
import { useBridgeModal } from 'src/hooks'
import { useChainStore } from 'src/stores/useChainStore'
import { formatEther, parseEther } from 'viem'
import { useAccount, useBalance, useConfig, useSwitchChain } from 'wagmi'
import { sendTransaction, waitForTransactionReceipt } from 'wagmi/actions'

import { Icon } from '../Icon'
import bridgeFormSchema, { BridgeFormValues } from './BridgeForm.schema'
import { NetworkSelector } from './NetworkSelector'

export const BridgeForm = () => {
  const { address, chain: userChain } = useAccount()
  const { switchChain: switchNetwork } = useSwitchChain()
  const { closeBridgeModal } = useBridgeModal()
  const { openConnectModal } = useConnectModal()
  const { data: isContractWallet } = useIsContract({ address })
  const [loading, setLoading] = useState(false)

  const { chain: appChain } = useChainStore()

  const l1Chain = PUBLIC_DEFAULT_CHAINS[0]
  const [l2Chain, setL2Chain] = useState(
    appChain.id !== l1Chain.id ? appChain : PUBLIC_DEFAULT_CHAINS[1]
  )

  const isWalletOnL1 = userChain?.id === l1Chain.id

  const { data: userL1Balance } = useBalance({
    address,
    chainId: l1Chain.id,
  })

  const { data: userL2Balance } = useBalance({
    address,
    chainId: l2Chain.id,
  })

  const initialValues: BridgeFormValues = {
    amount: 0,
  }

  const config = useConfig()

  const handleSubmit = async (values: BridgeFormValues) => {
    const bridge = PUBLIC_L1_BRIDGE_ADDRESS[l2Chain.id as L2ChainType]

    if (!values.amount || !bridge) return

    setLoading(true)
    try {
      const hash = await sendTransaction(config, {
        chainId: l1Chain.id,
        to: PUBLIC_L1_BRIDGE_ADDRESS[l2Chain.id as L2ChainType],
        value: parseEther(values.amount.toString()),
      })
      await waitForTransactionReceipt(config, { hash, chainId: l1Chain.id })
    } catch (err) {
      console.error('Error sending bridge transaction', err)
    } finally {
      setLoading(false)
    }
  }

  const formattedL1Balance = userL1Balance
    ? parseFloat(formatEther(userL1Balance.value))
    : 0
  const formattedL2Balance = userL2Balance
    ? parseFloat(formatEther(userL2Balance.value))
    : 0

  const getButtonText = (isAmountInvalid: boolean) => {
    if (isContractWallet) return 'Contract wallets are not supported'
    if (loading) return 'Bridging...'
    if (isAmountInvalid) return 'Insufficient ETH balance'
    return 'Bridge'
  }

  return (
    <Box position={'relative'}>
      <Box
        onClick={closeBridgeModal}
        cursor={'pointer'}
        position={'absolute'}
        top="x0"
        right="x3"
      >
        <Icon id="cross" fill="text3" />
      </Box>
      <Heading size="xs" fontWeight="display">
        Bridge
      </Heading>

      <Formik
        initialValues={initialValues}
        validationSchema={bridgeFormSchema(formattedL1Balance)}
        onSubmit={handleSubmit}
        validateOnBlur
        validateOnMount={false}
        validateOnChange={false}
      >
        {({ errors, touched, isValid, submitForm }) => {
          const isAmountInvalid = !!errors.amount && touched.amount

          return (
            <Box>
              <Box
                mt="x5"
                p="x4"
                borderColor="border"
                borderStyle="solid"
                borderRadius="curved"
                borderWidth="normal"
              >
                <Input
                  name={'amount'}
                  label={
                    <Flex>
                      <Text mr="x2" fontWeight="heading">
                        From
                      </Text>
                      <Box mr="x1">
                        <Image
                          alt="L1 Chain"
                          style={{
                            height: 20,
                            width: 20,
                          }}
                          src={l1Chain.icon}
                        />
                      </Box>
                      <Text fontWeight="heading">{l1Chain.name}</Text>
                    </Flex>
                  }
                  secondaryLabel={'ETH'}
                  autoComplete={'off'}
                  type={'number'}
                  placeholder={0}
                  min={0}
                  max={userL1Balance?.formatted}
                  step={'any'}
                />
                <Text mt="x3" color="text3">
                  Balance: {formatCryptoVal(formattedL1Balance)} ETH
                </Text>
              </Box>

              <Box
                mt="x5"
                p="x4"
                borderColor="border"
                borderStyle="solid"
                borderRadius="curved"
                borderWidth="normal"
              >
                <Input
                  name={'amount'}
                  label={
                    <Flex align={'center'}>
                      <Text mr="x2" fontWeight="heading">
                        To
                      </Text>
                      <NetworkSelector
                        selectedChain={l2Chain}
                        setSelectedChain={setL2Chain}
                      />
                    </Flex>
                  }
                  secondaryLabel={'ETH'}
                  autoComplete={'off'}
                  type={'number'}
                  placeholder={0}
                  min={0}
                  max={parseFloat(formatEther(userL2Balance?.value ?? 0n))}
                  step={'any'}
                />
                <Text mt="x3" color="text3">
                  Balance: {formatCryptoVal(formattedL2Balance)} ETH
                </Text>
              </Box>

              {!address ? (
                <Button onClick={openConnectModal} type="button" w="100%" mt="x5">
                  Connect wallet
                </Button>
              ) : isWalletOnL1 ? (
                <Button
                  disabled={!isValid || isContractWallet || loading}
                  onClick={submitForm}
                  type="submit"
                  w="100%"
                  mt="x5"
                >
                  {getButtonText(isAmountInvalid || false)}
                </Button>
              ) : (
                <Button
                  onClick={() => switchNetwork?.({ chainId: l1Chain.id })}
                  type="button"
                  w="100%"
                  mt="x5"
                >
                  Switch network
                </Button>
              )}

              <Box fontSize={12} color="text3" mt="x4">
                By proceeding, you agree to Nouns Builder's{' '}
                <Link href="/legal" style={{ textDecoration: 'underline' }}>
                  terms
                </Link>
                . THIS BRIDGE IS DEPOSIT ONLY. YOU MUST USE ANOTHER BRIDGE TO WITHDRAW.
                Learn more about{' '}
                <Box
                  as="a"
                  rel="noopener noreferrer"
                  target="_blank"
                  style={{ textDecoration: 'underline' }}
                  href="https://docs.nouns.build/"
                >
                  bridging
                </Box>
                .
              </Box>
            </Box>
          )
        }}
      </Formik>
    </Box>
  )
}
