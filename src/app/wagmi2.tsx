'use client'

import React, { ReactNode } from 'react'
import { wagmiAdapter, projectId } from './config2'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react' 
import {auroraTestnet, mainnet, polygonAmoy, sepolia } from '@reown/appkit/networks'
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi'

// Setup queryClient
const queryClient = new QueryClient()

if (!projectId) throw new Error('Project ID is not defined')

// Create modal
const metadata = {
  name: 'genx',
  description: 'AppKit Example',
  url: 'https://reown.com/appkit', // origin must match your domain & subdomain
  icons: ['https://assets.reown.com/reown-profile-pic.png']
}
// Chains for EVM Wallets

// Create the modal
const modal = createAppKit({
  themeMode: 'dark',
  themeVariables: {
    '--w3m-color-mix': '#0E0C01',
    '--w3m-color-mix-strength': 60,
    '--w3m-accent':'#D2BD00',
    
  },
  adapters: [wagmiAdapter],
  projectId,
  networks: [auroraTestnet,polygonAmoy,sepolia,mainnet],
  defaultNetwork: sepolia,
  metadata: metadata,
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
  }
})
export default function Web3ModalProvider({ children, cookies }: { children: ReactNode; cookies: string | null }) {
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}