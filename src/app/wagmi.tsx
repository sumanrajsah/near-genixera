"use client"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { config } from './config'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'

const queryClient = new QueryClient()

export function Wagmi({
    children,
}: Readonly<{
    children: React.ReactNode,
}>) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                    {children}
            </QueryClientProvider>
        </WagmiProvider>
    )
}