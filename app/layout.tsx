'use client'
import '@mantine/core/styles.css'
import React from 'react'
import { MantineProvider, ColorSchemeScript } from '@mantine/core'
import { theme } from '../theme'
import { WagmiConfig, configureChains, createConfig } from 'wagmi'
import { Pegasus } from '../lib/constants/Chains'
import { jsonRpcProvider } from '@wagmi/core/providers/jsonRpc'
import { InjectedConnector } from '@wagmi/core/connectors/injected'

const { chains, publicClient } = configureChains(
  [Pegasus],
  [
    jsonRpcProvider({
      rpc: (chain) => ({
        http: 'https://replicator-02.pegasus.lightlink.io/rpc/v1'
      })
    })
  ]
)

const config = createConfig({
  autoConnect: true,
  connectors: [new InjectedConnector({ chains })],
  publicClient
})

export default function RootLayout({ children }: { children: any }) {
  return (
    <html lang='en'>
      <head>
        <ColorSchemeScript />
        <link rel='shortcut icon' href='/favicon.svg' />
        <meta
          name='viewport'
          content='minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no'
        />
      </head>
      <body>
        <WagmiConfig config={config}>
          <MantineProvider theme={theme}>{children}</MantineProvider>
        </WagmiConfig>
      </body>
    </html>
  )
}
