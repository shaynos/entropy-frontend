'use client'
import { Container, Stack, Title, Text, Button } from '@mantine/core'
import { useAccount, useConnect, useContractRead } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import abi from '../lib/abi/raffle.json'
import { useMemo, useState } from 'react'
import { ethers } from 'ethers'
import { getWalletClient } from '@wagmi/core'
import { useNetwork } from 'wagmi'

const RAFFLE_NUMBER = 1
const RAFFLE_ADDRESS = '0x321443637A0a608123E557989E99c1DbB27e774c'

interface IRaffle {
  raffleOwner: string
  tokenId: bigint
  nftAddress: string
  ticketPrice: bigint
  maxTickets: bigint
  ticketOwners: string[]
  winningTicket: bigint
  sequenceNumber: bigint
  entropyFee: bigint
}

const Raffle = () => {
  const [loading, setLoading] = useState(false)
  const [randomNumber, setRandomNumber] = useState<string>()
  const { chain } = useNetwork()
  const { address } = useAccount()
  const { connect } = useConnect({
    connector: new InjectedConnector()
  })

  const { data: raffleDataRaw } = useContractRead({
    address: RAFFLE_ADDRESS,
    abi,
    functionName: 'getRaffle',
    args: [RAFFLE_NUMBER],
    watch: true
  })

  const raffleData = useMemo(() => raffleDataRaw as IRaffle, [raffleDataRaw])

  const handleBuyTicket = async () => {
    const walletClient = await getWalletClient()
    if (!walletClient) return
    setLoading(true)
    const hash = await walletClient.writeContract({
      address: RAFFLE_ADDRESS,
      abi,
      functionName: 'purchaseTicket',
      args: [RAFFLE_NUMBER],
      value: raffleData?.ticketPrice,
      chain
    })
    console.log('hash: ', hash)
    setLoading(false)
  }

  const handleCloseRaffle = async () => {
    const walletClient = await getWalletClient()
    if (!walletClient) return
    setLoading(true)

    const random = ethers.hexlify(ethers.randomBytes(32))
    setRandomNumber(random)

    const commitment = ethers.keccak256(random)

    const hash = await walletClient.writeContract({
      address: RAFFLE_ADDRESS,
      abi,
      functionName: 'closeRaffle',
      args: [RAFFLE_NUMBER, commitment],
      chain
    })
    console.log('hash: ', hash)
    setLoading(false)
  }

  const handleDrawRaffle = async () => {
    const walletClient = await getWalletClient()
    if (!walletClient) return
    setLoading(true)
    const url = `https://fortuna-staging.pyth.network/v1/chains/lightlink_pegasus/revelations/${raffleData.sequenceNumber.toString()}`
    const response = await fetch(url)
    const body = await response.json()
    const providerRandom = `0x${body.value.data}`
    console.log('providerRandom: ', providerRandom)

    const hash = await walletClient.writeContract({
      address: RAFFLE_ADDRESS,
      abi,
      functionName: 'drawRaffle',
      args: [
        RAFFLE_NUMBER,
        raffleData?.sequenceNumber,
        randomNumber,
        providerRandom
      ],
      chain
    })
    console.log('hash: ', hash)
    setLoading(false)
  }

  return (
    <Container>
      <Stack ta='center' justify='center' align='center'>
        <Title>Raffle</Title>

        {!address ? (
          <Button onClick={() => connect()}>Connect</Button>
        ) : (
          <>
            <Text>Connected: {address}</Text>
            <Text>Raffle Number: {RAFFLE_NUMBER.toString()}</Text>
            <Text>NFT Address: {raffleData?.nftAddress}</Text>
            <Text>Token ID: {raffleData?.tokenId?.toString()}</Text>
            <Text>Tickets Sold: {raffleData?.ticketOwners?.length}</Text>
            <Text>Sequence ID: {raffleData?.sequenceNumber.toString()}</Text>
            <Text>
              Winning Ticket: {raffleData?.winningTicket?.toString() || '...'}
            </Text>

            {raffleData?.ticketOwners.length ===
            parseInt(raffleData?.maxTickets.toString() || '0') ? (
              <>
                {raffleData?.sequenceNumber > BigInt(0) ? (
                  <Button loading={loading} onClick={handleDrawRaffle}>
                    Draw Raffle
                  </Button>
                ) : (
                  <Button loading={loading} onClick={handleCloseRaffle}>
                    Close Raffle
                  </Button>
                )}
              </>
            ) : (
              <Button loading={loading} onClick={handleBuyTicket}>
                Buy Ticket
              </Button>
            )}
          </>
        )}
      </Stack>
    </Container>
  )
}

export default Raffle
